const test = require('node:test');
const assert = require('node:assert/strict');
const { canTerminateUser } = require('./terminationPermissions');

test('CEO can terminate anyone', () => {
  assert.equal(canTerminateUser({ role: 'CEO' }, { role: 'Manager' }), true);
  assert.equal(canTerminateUser({ role: 'CEO' }, { role: 'COO' }), true);
  assert.equal(canTerminateUser({ role: 'CEO' }, { role: 'CEO' }), true);
});

test('COO can terminate everyone except CEO', () => {
  assert.equal(canTerminateUser({ role: 'COO' }, { role: 'Manager' }), true);
  assert.equal(canTerminateUser({ role: 'COO' }, { role: 'Member' }), true);
  assert.equal(canTerminateUser({ role: 'COO' }, { role: 'CEO' }), false);
});

test('Manager can terminate everyone except CEO and COO', () => {
  assert.equal(canTerminateUser({ role: 'Manager' }, { role: 'Member' }), true);
  assert.equal(canTerminateUser({ role: 'Manager' }, { role: 'Team Lead' }), true);
  assert.equal(canTerminateUser({ role: 'Manager' }, { role: 'COO' }), false);
  assert.equal(canTerminateUser({ role: 'Manager' }, { role: 'CEO' }), false);
});

test('Non-privileged roles cannot terminate', () => {
  assert.equal(canTerminateUser({ role: 'Member' }, { role: 'Member' }), false);
  assert.equal(canTerminateUser({ role: 'Team Lead' }, { role: 'Member' }), false);
});
