const crypto = require('crypto');
const { getDb } = require('../config/db');

function matchFilter(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const orMatched = val.some(subFilter => matchFilter(doc, subFilter));
      if (!orMatched) return false;
      continue;
    }

    if (key === '$and' && Array.isArray(val)) {
      const andMatched = val.every(subFilter => matchFilter(doc, subFilter));
      if (!andMatched) return false;
      continue;
    }

    const docVal = (key === 'id' || key === '_id') ? (doc._id || doc.id) : doc[key];

    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof RegExp)) {
      if ('$in' in val && Array.isArray(val.$in)) {
        if (!val.$in.includes(docVal)) return false;
        continue;
      }
      if ('$nin' in val && Array.isArray(val.$nin)) {
        if (val.$nin.includes(docVal)) return false;
        continue;
      }
      if ('$regex' in val) {
        const flags = val.$options || '';
        const regex = new RegExp(val.$regex, flags);
        if (!regex.test(String(docVal || ''))) return false;
        continue;
      }
      if ('$gte' in val) {
        if (!(docVal >= val.$gte)) return false;
        continue;
      }
      if ('$lte' in val) {
        if (!(docVal <= val.$lte)) return false;
        continue;
      }
      if ('$gt' in val) {
        if (!(docVal > val.$gt)) return false;
        continue;
      }
      if ('$lt' in val) {
        if (!(docVal < val.$lt)) return false;
        continue;
      }
      if ('$ne' in val) {
        if (docVal === val.$ne) return false;
        continue;
      }
      if ('$exists' in val) {
        const exists = docVal !== undefined && docVal !== null;
        if (exists !== !!val.$exists) return false;
        continue;
      }
    }

    if (val instanceof RegExp) {
      if (!val.test(String(docVal || ''))) return false;
      continue;
    }

    if (val === undefined || val === null) {
      if (docVal !== val) return false;
      continue;
    }

    if (String(docVal) !== String(val)) {
      return false;
    }
  }

  return true;
}

function applyUpdate(doc, update) {
  const result = { ...doc };
  if (update.$set) {
    Object.assign(result, update.$set);
  }
  if (update.$push) {
    for (const [field, item] of Object.entries(update.$push)) {
      result[field] = Array.isArray(result[field]) ? [...result[field]] : [];
      if (item && item.$each && Array.isArray(item.$each)) {
        result[field].push(...item.$each);
      } else {
        result[field].push(item);
      }
    }
  }
  if (update.$inc) {
    for (const [field, amount] of Object.entries(update.$inc)) {
      result[field] = (Number(result[field]) || 0) + Number(amount);
    }
  }
  if (update.$unset) {
    for (const field of Object.keys(update.$unset)) {
      delete result[field];
    }
  }
  for (const [key, val] of Object.entries(update)) {
    if (!key.startsWith('$')) {
      result[key] = val;
    }
  }
  return result;
}

function createPgModel(tableName, options = {}) {
  const { methods = {}, statics = {}, preSave = [] } = options;

  function wrapInstance(data) {
    if (!data) return null;
    const instance = { ...data };
    instance.id = instance._id = String(data._id || data.id);

    for (const [name, fn] of Object.entries(methods)) {
      instance[name] = fn.bind(instance);
    }

    instance.save = async function() {
      for (const hook of preSave) {
        await hook.call(instance);
      }
      const db = await getDb();
      instance.updatedAt = new Date().toISOString();
      await db.query(
        `INSERT INTO ${tableName} (id, data, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
        [instance._id, JSON.stringify(instance)]
      );
      return instance;
    };

    return instance;
  }

  class ChainableQuery {
    constructor(promiseFn) {
      this._promiseFn = promiseFn;
      this._sortObj = null;
      this._limitVal = null;
      this._skipVal = null;
      this._selectFields = null;
    }

    sort(sortObj) {
      this._sortObj = sortObj;
      return this;
    }

    limit(n) {
      this._limitVal = n;
      return this;
    }

    skip(n) {
      this._skipVal = n;
      return this;
    }

    select(fields) {
      this._selectFields = fields;
      return this;
    }

    populate() { return this; }
    lean() { return this; }

    async _exec() {
      let results = await this._promiseFn();
      if (!Array.isArray(results)) return results;

      if (this._sortObj) {
        const [field, dir] = Object.entries(this._sortObj)[0] || [];
        if (field) {
          const factor = (dir === -1 || dir === 'desc' || dir === 'DESC') ? -1 : 1;
          results.sort((a, b) => {
            const valA = a[field] ?? '';
            const valB = b[field] ?? '';
            return valA > valB ? factor : valA < valB ? -factor : 0;
          });
        }
      }

      if (typeof this._skipVal === 'number') {
        results = results.slice(this._skipVal);
      }
      if (typeof this._limitVal === 'number') {
        results = results.slice(0, this._limitVal);
      }

      return results;
    }

    then(resolve, reject) {
      return this._exec().then(resolve, reject);
    }

    catch(reject) {
      return this._exec().catch(reject);
    }
  }

  const Model = function(data = {}) {
    const id = data._id || data.id || crypto.randomBytes(12).toString('hex');
    const doc = {
      _id: id,
      id: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    return wrapInstance(doc);
  };

  Model.find = function(filter = {}) {
    return new ChainableQuery(async () => {
      const db = await getDb();
      const res = await db.query(`SELECT data FROM ${tableName}`);
      const rows = res.rows.map(r => r.data).filter(d => matchFilter(d, filter));
      return rows.map(wrapInstance);
    });
  };

  Model.findOne = function(filter = {}) {
    return new ChainableQuery(async () => {
      const db = await getDb();
      const res = await db.query(`SELECT data FROM ${tableName}`);
      const row = res.rows.map(r => r.data).find(d => matchFilter(d, filter));
      return wrapInstance(row);
    });
  };

  Model.findById = function(id) {
    return Model.findOne({ _id: id });
  };

  Model.insertMany = async function(data) {
    return Model.create(data);
  };

  Model.create = async function(data) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(d => Model.create(d)));
    }
    const instance = Model(data);
    await instance.save();
    return instance;
  };

  Model.findByIdAndUpdate = async function(id, update, options = {}) {
    const existing = await Model.findById(id);
    if (!existing) return null;
    const updated = applyUpdate(existing, update);
    const inst = wrapInstance(updated);
    await inst.save();
    return inst;
  };

  Model.updateOne = async function(filter, update, options = {}) {
    const existing = await Model.findOne(filter);
    if (!existing) return { matchedCount: 0, modifiedCount: 0 };
    const updated = applyUpdate(existing, update);
    const inst = wrapInstance(updated);
    await inst.save();
    return { matchedCount: 1, modifiedCount: 1 };
  };

  Model.updateMany = async function(filter, update, options = {}) {
    const existingList = await Model.find(filter);
    let count = 0;
    for (const existing of existingList) {
      const updated = applyUpdate(existing, update);
      const inst = wrapInstance(updated);
      await inst.save();
      count++;
    }
    return { matchedCount: count, modifiedCount: count };
  };

  Model.deleteOne = async function(filter = {}) {
    const existing = await Model.findOne(filter);
    if (!existing) return { deletedCount: 0 };
    const db = await getDb();
    await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [existing._id]);
    return { deletedCount: 1 };
  };

  Model.findByIdAndDelete = async function(id) {
    const existing = await Model.findById(id);
    if (!existing) return null;
    const db = await getDb();
    await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [existing._id]);
    return existing;
  };

  Model.deleteMany = async function(filter = {}) {
    const db = await getDb();
    if (!filter || Object.keys(filter).length === 0) {
      await db.query(`DELETE FROM ${tableName}`);
      return { deletedCount: 1 };
    }
    const all = await Model.find(filter);
    for (const item of all) {
      await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [item._id]);
    }
    return { deletedCount: all.length };
  };

  Model.countDocuments = async function(filter = {}) {
    const matches = await Model.find(filter);
    return matches.length;
  };

  Model.distinct = async function(field, filter = {}) {
    const matches = await Model.find(filter);
    const values = matches.map(m => m[field]).filter(Boolean);
    return [...new Set(values)];
  };

  Model.exists = async function(filter = {}) {
    const match = await Model.findOne(filter);
    return !!match;
  };

  Object.assign(Model, statics);

  return Model;
}

module.exports = createPgModel;
