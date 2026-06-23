const express = require('express');
const router = express.Router();

const ExecutiveDecision = require('../models/ExecutiveDecision');
const ResourceRequest = require('../models/ResourceRequest');
const { protect, authorize } = require('../middleware/authMiddleware');

const toDto = (decision) => ({
  id: String(decision._id),
  _id: decision._id,
  title: decision.title,
  priority: decision.priority,
  due: decision.due,
  department: decision.department,
  impact: decision.impact,
  status: decision.status,
  description: decision.description,
  proposedBy: decision.proposedBy,
  proposedAt: decision.proposedAt,
  impactAnalysis: decision.impactAnalysis,
  approvedBy: decision.approvedBy,
  approvedAt: decision.approvedAt,
  rejectedBy: decision.rejectedBy,
  rejectedAt: decision.rejectedAt,
  rejectionReason: decision.rejectionReason,
  comment: decision.comment
});

const seedFromResourceRequests = async () => {
  const existing = await ExecutiveDecision.countDocuments();
  if (existing > 0) return;

  const requests = await ResourceRequest.find({ status: 'pending' }).limit(5).lean();
  if (requests.length === 0) {
    await ExecutiveDecision.create({
      title: 'Quarterly operating plan review',
      priority: 'High',
      due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      department: 'Platform and DevOps',
      impact: 'Company-wide',
      status: 'pending',
      description: 'Review operating priorities and unblock cross-functional execution.',
      proposedBy: 'Leadership Team',
      impactAnalysis: 'Aligns departments around active delivery goals.'
    });
    return;
  }

  await ExecutiveDecision.insertMany(requests.map((request) => ({
    title: `Approve ${request.resourceName} request`,
    priority: request.priority === 'high' ? 'High' : request.priority === 'low' ? 'Low' : 'Medium',
    due: new Date().toISOString().split('T')[0],
    department: request.department || 'Platform and DevOps',
    impact: 'Resource allocation',
    status: 'pending',
    description: request.reason,
    proposedBy: request.requesterName,
    impactAnalysis: `${request.quantity || 1} ${request.resourceName} requested for ${request.department || 'team'} delivery.`
  })));
};

router.use(protect, authorize('CEO'));

router.get('/', async (req, res) => {
  try {
    await seedFromResourceRequests();
    const query = {};
    if (req.query.status && req.query.status !== 'all') query.status = req.query.status;

    const decisions = await ExecutiveDecision.find(query).sort({ createdAt: -1 });
    res.json({ success: true, decisions: decisions.map(toDto), data: decisions.map(toDto) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch executive decisions' });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const decision = await ExecutiveDecision.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.body.approvedBy || req.user.name,
        approvedAt: req.body.approvedAt || new Date(),
        comment: req.body.comment || ''
      },
      { new: true }
    );
    if (!decision) return res.status(404).json({ success: false, message: 'Decision not found' });
    res.json({ success: true, data: toDto(decision) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to approve decision' });
  }
});

router.put('/:id/reject', async (req, res) => {
  try {
    const decision = await ExecutiveDecision.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectedBy: req.body.rejectedBy || req.user.name,
        rejectedAt: req.body.rejectedAt || new Date(),
        rejectionReason: req.body.reason || ''
      },
      { new: true }
    );
    if (!decision) return res.status(404).json({ success: false, message: 'Decision not found' });
    res.json({ success: true, data: toDto(decision) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to reject decision' });
  }
});

module.exports = router;
