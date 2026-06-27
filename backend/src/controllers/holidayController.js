const Holiday = require('../models/Holiday');
const Notification = require('../models/Notification');
const { formatResponse } = require('../utils/helpers');

// ==================== GET ALL HOLIDAYS ====================

exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json(formatResponse(true, 'Holidays fetched', holidays));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== ADD HOLIDAY ====================

exports.addHoliday = async (req, res) => {
  try {
    const { name, date, description, isRecurring, declaredBy } = req.body;
    
    const holiday = await Holiday.create({ 
      name, 
      date, 
      description, 
      isRecurring: isRecurring || false,
      declaredBy: declaredBy || 'CEO'
    });
    
    // Notify all employees
    await Notification.create({
      type: 'announcement',
      title: '🎉 Holiday Declared',
      message: `${name} on ${date} ${isRecurring ? '(Recurring yearly)' : ''}. ${description || ''}`,
      fromUserName: declaredBy || 'CEO',
      toRole: 'All',
      relatedId: holiday._id,
      relatedModel: 'Holiday',
      priority: 'high'
    });
    
    res.status(201).json(formatResponse(true, 'Holiday declared', holiday));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== UPDATE HOLIDAY ====================

exports.updateHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    const { name, date, description, isRecurring } = req.body;
    
    const holiday = await Holiday.findByIdAndUpdate(holidayId, 
      { name, date, description, isRecurring },
      { new: true }
    );
    
    if (!holiday) {
      return res.status(404).json(formatResponse(false, 'Holiday not found'));
    }
    
    res.status(200).json(formatResponse(true, 'Holiday updated', holiday));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== DELETE HOLIDAY ====================

exports.deleteHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    await Holiday.findByIdAndDelete(holidayId);
    res.status(200).json(formatResponse(true, 'Holiday deleted'));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};