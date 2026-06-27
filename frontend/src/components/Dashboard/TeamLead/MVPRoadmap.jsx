// src/components/Dashboard/Lead/MVPRoadmap.jsx
import React, { useState, useEffect, useRef } from 'react';
import roadmapService from '../../../services/roadmapService';

const MVPRoadmap = ({ userRole = 'Lead' }) => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [updatingRoadmap, setUpdatingRoadmap] = useState(null);
  const [sharingRoadmap, setSharingRoadmap] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [progressUpdate, setProgressUpdate] = useState({
    overallProgress: 0,
    milestoneUpdates: [],
    completedFeatures: [],
    notes: '',
    blockers: []
  });
  const [newBlocker, setNewBlocker] = useState('');
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    version: '1.0',
    description: '',
    startDate: '',
    targetDate: '',
    milestones: [],
    features: [],
    risks: [],
    status: 'draft',
    attachments: [],
    overallProgress: 0,
    progressHistory: []
  });

  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '', description: '' });
  const [newFeature, setNewFeature] = useState({ name: '', priority: 'medium', status: 'planned' });
  const [newRisk, setNewRisk] = useState({ description: '', impact: 'medium', mitigation: '' });

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRoadmaps = async () => {
    setIsLoading(true);
    try {
      const data = await roadmapService.getAllRoadmaps();
      if (data.length > 0) {
        setRoadmaps(data);
      } else if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    const mockRoadmaps = [
      {
        id: 1,
        title: 'SpaceBorn CMS MVP Roadmap',
        version: '2.1',
        description: 'Complete roadmap for SpaceBorn CMS MVP development including core features, milestones, and delivery timeline.',
        startDate: '2026-01-15',
        targetDate: '2026-12-20',
        lastUpdated: '2026-06-10T10:00:00Z',
        status: 'active',
        sharedWith: ['CEO', 'COO', 'Manager'],
        sharedAt: '2026-06-10T10:00:00Z',
        overallProgress: 45,
        progressHistory: [
          { date: '2026-06-01', progress: 40, notes: 'Completed authentication module' },
          { date: '2026-06-08', progress: 45, notes: 'Dashboard UI improvements' }
        ],
        milestones: [
          { id: 1, title: 'Phase 1: Foundation', dueDate: '2026-03-15', status: 'completed', description: 'Basic setup and architecture', progress: 100 },
          { id: 2, title: 'Phase 2: Core Features', dueDate: '2026-06-30', status: 'in-progress', description: 'Authentication, Dashboard, Content Management', progress: 65 },
          { id: 3, title: 'Phase 3: Advanced Features', dueDate: '2026-09-30', status: 'planned', description: 'Analytics, AI Insights, Collaboration', progress: 20 },
          { id: 4, title: 'Phase 4: Polish & Launch', dueDate: '2026-12-20', status: 'planned', description: 'Testing, Optimization, Deployment', progress: 0 }
        ],
        features: [
          { id: 1, name: 'User Authentication', priority: 'high', status: 'completed' },
          { id: 2, name: 'Dashboard UI', priority: 'high', status: 'completed' },
          { id: 3, name: 'Content Management System', priority: 'high', status: 'in-progress' },
          { id: 4, name: 'AI-Powered Insights', priority: 'medium', status: 'planned' },
          { id: 5, name: 'Real-time Collaboration', priority: 'medium', status: 'planned' }
        ],
        risks: [
          { id: 1, description: 'Third-party API dependency', impact: 'high', mitigation: 'Have fallback and caching strategy', status: 'monitoring' },
          { id: 2, description: 'Resource constraints', impact: 'medium', mitigation: 'Cross-training team members', status: 'mitigated' }
        ],
        attachments: [
          { id: 1, name: 'MVP_Requirements.pdf', url: '/files/mvp-requirements.pdf', size: '2.4 MB', type: 'application/pdf' }
        ],
        blockers: ['API documentation delay', 'Hardware & Integration resources unavailable'],
        createdBy: 'Priya Sharma',
        createdAt: '2026-01-10T09:00:00Z'
      }
    ];
    setRoadmaps(mockRoadmaps);
    setIsLoading(false);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        showToastMessage(`File ${file.name} exceeds 10MB limit`, 'error');
        continue;
      }

      setUploadProgress({ fileName: file.name, progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAttachment = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        displaySize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type,
        uploadedAt: new Date().toISOString(),
        file
      };
      
      setFormData({
        ...formData,
        attachments: [...formData.attachments, newAttachment]
      });
      
      setUploadProgress(null);
      showToastMessage(`File ${file.name} uploaded successfully`, 'success');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (attachmentId) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter(att => att.id !== attachmentId)
    });
    showToastMessage('Attachment removed', 'success');
  };

  const handleAddMilestone = () => {
    if (newMilestone.title && newMilestone.dueDate) {
      setFormData({
        ...formData,
        milestones: [...formData.milestones, { ...newMilestone, id: Date.now(), status: 'planned', progress: 0 }]
      });
      setNewMilestone({ title: '', dueDate: '', description: '' });
    }
  };

  const handleAddFeature = () => {
    if (newFeature.name) {
      setFormData({
        ...formData,
        features: [...formData.features, { ...newFeature, id: Date.now() }]
      });
      setNewFeature({ name: '', priority: 'medium', status: 'planned' });
    }
  };

  const handleAddRisk = () => {
    if (newRisk.description) {
      setFormData({
        ...formData,
        risks: [...formData.risks, { ...newRisk, id: Date.now(), status: 'identified' }]
      });
      setNewRisk({ description: '', impact: 'medium', mitigation: '' });
    }
  };

  const removeItem = (type, id) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter(item => item.id !== id)
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.targetDate) {
      showToastMessage('Please fill in all required fields', 'error');
      return;
    }

    try {
      const pendingAttachments = formData.attachments;
      const roadmapPayload = {
        ...formData,
        attachments: [],
        status: 'draft',
        overallProgress: 0,
        progressHistory: [],
        blockers: []
      };

      let createdRoadmap = await roadmapService.createRoadmap(roadmapPayload);
      const uploadedAttachments = [];

      for (const attachment of pendingAttachments) {
        if (attachment.file) {
          const uploaded = await roadmapService.uploadAttachment(createdRoadmap.id || createdRoadmap._id, attachment.file);
          uploadedAttachments.push(uploaded);
        }
      }

      createdRoadmap = {
        ...createdRoadmap,
        attachments: uploadedAttachments,
        lastUpdated: createdRoadmap.lastUpdated || new Date().toISOString()
      };

      setRoadmaps([createdRoadmap, ...roadmaps]);
      resetForm();
      showToastMessage('Roadmap created successfully', 'success');
    } catch (error) {
      showToastMessage(error.message || 'Failed to create roadmap', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      version: '1.0',
      description: '',
      startDate: '',
      targetDate: '',
      milestones: [],
      features: [],
      risks: [],
      status: 'draft',
      attachments: [],
      overallProgress: 0,
      progressHistory: []
    });
    setShowForm(false);
  };

  const openProgressModal = (roadmap) => {
    setUpdatingRoadmap(roadmap);
    setProgressUpdate({
      overallProgress: roadmap.overallProgress || 0,
      milestoneUpdates: roadmap.milestones.map(m => ({ id: m.id, progress: m.progress || 0 })),
      completedFeatures: roadmap.features.filter(f => f.status === 'completed').map(f => f.name),
      notes: '',
      blockers: roadmap.blockers || []
    });
    setShowProgressModal(true);
  };

  const updateMilestoneProgress = (milestoneId, progress) => {
    setProgressUpdate({
      ...progressUpdate,
      milestoneUpdates: progressUpdate.milestoneUpdates.map(m => 
        m.id === milestoneId ? { ...m, progress: parseInt(progress) } : m
      )
    });
  };

  const addBlocker = () => {
    if (newBlocker.trim()) {
      setProgressUpdate({
        ...progressUpdate,
        blockers: [...progressUpdate.blockers, newBlocker.trim()]
      });
      setNewBlocker('');
    }
  };

  const removeBlocker = (index) => {
    setProgressUpdate({
      ...progressUpdate,
      blockers: progressUpdate.blockers.filter((_, i) => i !== index)
    });
  };

  const toggleFeatureCompletion = (featureName) => {
    if (progressUpdate.completedFeatures.includes(featureName)) {
      setProgressUpdate({
        ...progressUpdate,
        completedFeatures: progressUpdate.completedFeatures.filter(f => f !== featureName)
      });
    } else {
      setProgressUpdate({
        ...progressUpdate,
        completedFeatures: [...progressUpdate.completedFeatures, featureName]
      });
    }
  };

  const saveProgressUpdate = async () => {
    const updatedRoadmaps = roadmaps.map(r => {
      if (r.id === updatingRoadmap.id) {
        // Update milestone progress
        const updatedMilestones = r.milestones.map(m => {
          const update = progressUpdate.milestoneUpdates.find(u => u.id === m.id);
          if (update) {
            const newProgress = update.progress;
            let newStatus = m.status;
            if (newProgress === 100) newStatus = 'completed';
            else if (newProgress > 0 && newProgress < 100) newStatus = 'in-progress';
            return { ...m, progress: newProgress, status: newStatus };
          }
          return m;
        });

        // Update feature statuses
        const updatedFeatures = r.features.map(f => ({
          ...f,
          status: progressUpdate.completedFeatures.includes(f.name) ? 'completed' : f.status
        }));

        // Calculate new overall progress
        const totalProgress = updatedMilestones.reduce((sum, m) => sum + (m.progress || 0), 0);
        const newOverallProgress = Math.round(totalProgress / updatedMilestones.length);

        // Add to progress history
        const newProgressHistory = [
          ...(r.progressHistory || []),
          {
            date: new Date().toISOString(),
            progress: newOverallProgress,
            notes: progressUpdate.notes,
            blockers: progressUpdate.blockers
          }
        ];

        return {
          ...r,
          milestones: updatedMilestones,
          features: updatedFeatures,
          overallProgress: newOverallProgress,
          progressHistory: newProgressHistory,
          blockers: progressUpdate.blockers,
          lastUpdated: new Date().toISOString()
        };
      }
      return r;
    });

    try {
      const updatedRoadmap = updatedRoadmaps.find(r => r.id === updatingRoadmap.id);
      const savedRoadmap = await roadmapService.updateRoadmap(updatedRoadmap.id || updatedRoadmap._id, updatedRoadmap);
      setRoadmaps(updatedRoadmaps.map(r => r.id === updatingRoadmap.id ? savedRoadmap : r));
      setShowProgressModal(false);
      showToastMessage('Progress updated successfully', 'success');
    } catch (error) {
      showToastMessage(error.message || 'Failed to update progress', 'error');
    }
  };

  const handleShare = (roadmap) => {
    setSharingRoadmap(roadmap);
    setShowShareModal(true);
  };

  const issueRoadmapToLeadership = async () => {
    try {
      const sharedRoadmap = await roadmapService.shareRoadmap(sharingRoadmap.id || sharingRoadmap._id);
      setRoadmaps(roadmaps.map(r =>
        r.id === sharingRoadmap.id ? sharedRoadmap : r
      ));
      setShowShareModal(false);
      showToastMessage('MVP roadmap issued to Manager, CEO, and COO', 'success');
    } catch (error) {
      showToastMessage(error.message || 'Failed to issue roadmap', 'error');
    }
  };

  const downloadRoadmap = (roadmap) => {
    const content = `
MVP ROADMAP REPORT
==================
Title: ${roadmap.title}
Version: ${roadmap.version}
Status: ${roadmap.status.toUpperCase()}
Overall Progress: ${roadmap.overallProgress}%
Last Updated: ${new Date(roadmap.lastUpdated).toLocaleDateString()}

DESCRIPTION
${roadmap.description}

TIMELINE
Start Date: ${new Date(roadmap.startDate).toLocaleDateString()}
Target Date: ${new Date(roadmap.targetDate).toLocaleDateString()}

MILESTONES
${roadmap.milestones.map(m => `- ${m.title}: ${m.progress || 0}% (Due: ${new Date(m.dueDate).toLocaleDateString()}) - ${m.status}`).join('\n')}

FEATURES
${roadmap.features.map(f => `- ${f.name} [${f.priority}] - ${f.status}`).join('\n')}

RISKS & MITIGATION
${roadmap.risks.map(r => `- ${r.description} (Impact: ${r.impact}) - Mitigation: ${r.mitigation || 'N/A'}`).join('\n')}

BLOCKERS
${roadmap.blockers?.map(b => `- ${b}`).join('\n') || 'None'}

PROGRESS HISTORY
${roadmap.progressHistory?.map(h => `- ${new Date(h.date).toLocaleDateString()}: ${h.progress}% - ${h.notes || 'No notes'}`).join('\n') || 'No history'}

ATTACHMENTS
${roadmap.attachments?.map(a => `- ${a.name} (${formatAttachmentSize(a)})`).join('\n') || 'None'}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roadmap.title.replace(/\s/g, '_')}_Roadmap.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToastMessage('Roadmap downloaded successfully', 'success');
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
      shared: 'bg-purple-100 text-purple-700',
      completed: 'bg-blue-100 text-blue-700'
    };
    return badges[status] || badges.draft;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };
    return badges[priority] || badges.medium;
  };

  const formatAttachmentSize = (attachment) => {
    if (attachment.displaySize) return attachment.displaySize;
    if (typeof attachment.size === 'number') return `${(attachment.size / (1024 * 1024)).toFixed(2)} MB`;
    return attachment.size || 'Unknown size';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">MVP Roadmap</h1>
                  <p className="text-gray-500 text-sm mt-0.5">Create, track, and manage product roadmap with progress updates</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{showForm ? 'Cancel' : 'New Roadmap'}</span>
            </button>
          </div>
        </div>

        {/* Create/Edit Form - Same as before with progress fields */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Create New MVP Roadmap</h2>
              <p className="text-purple-100 text-sm">Define milestones, features, timeline, and upload supporting documents</p>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Information - Same as before */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roadmap Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., SpaceBorn CMS MVP Roadmap"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Describe the overall roadmap goals and objectives..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Date *</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* File Attachments - Same as before */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <span>📎</span>
                  <span>Attachments</span>
                </h3>
                <div className="mb-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, Excel, Word, Images (Max 10MB)</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {uploadProgress && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{uploadProgress.fileName}</span>
                        <span>{uploadProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 rounded-full h-2 transition-all" style={{ width: `${uploadProgress.progress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                    {formData.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{formatAttachmentSize(attachment)}</p>
                          </div>
                        </div>
                        <button onClick={() => removeAttachment(attachment.id)} className="text-red-500 hover:text-red-700">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Milestones */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Milestones</span>
                </h3>
                <div className="space-y-3">
                  {formData.milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{milestone.title}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => removeItem('milestones', milestone.id)} className="text-red-500 hover:text-red-700">×</button>
                    </div>
                  ))}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Milestone title"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="date"
                      value={newMilestone.dueDate}
                      onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button onClick={handleAddMilestone} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                      Add Milestone
                    </button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <span>✨</span>
                  <span>Features</span>
                </h3>
                <div className="space-y-3">
                  {formData.features.map(feature => (
                    <div key={feature.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">{feature.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getPriorityBadge(feature.priority)}`}>
                          {feature.priority}
                        </span>
                      </div>
                      <button onClick={() => removeItem('features', feature.id)} className="text-red-500 hover:text-red-700">×</button>
                    </div>
                  ))}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Feature name"
                      value={newFeature.name}
                      onChange={(e) => setNewFeature({...newFeature, name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm col-span-2"
                    />
                    <select
                      value={newFeature.priority}
                      onChange={(e) => setNewFeature({...newFeature, priority: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                    <button onClick={handleAddFeature} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                      Add Feature
                    </button>
                  </div>
                </div>
              </div>

              {/* Risks */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>Risks & Mitigation</span>
                </h3>
                <div className="space-y-3">
                  {formData.risks.map(risk => (
                    <div key={risk.id} className="bg-gray-50 px-3 py-2 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{risk.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Impact: {risk.impact}</p>
                        </div>
                        <button onClick={() => removeItem('risks', risk.id)} className="text-red-500 hover:text-red-700">×</button>
                      </div>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Risk description"
                      value={newRisk.description}
                      onChange={(e) => setNewRisk({...newRisk, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newRisk.impact}
                        onChange={(e) => setNewRisk({...newRisk, impact: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="high">High Impact</option>
                        <option value="medium">Medium Impact</option>
                        <option value="low">Low Impact</option>
                      </select>
                      <button onClick={handleAddRisk} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                        Add Risk
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button onClick={resetForm} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Create Roadmap
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roadmaps List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Roadmaps</h2>
          
          {roadmaps.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗺️</span>
              </div>
              <p className="text-gray-500 text-lg">No roadmaps created yet</p>
              <p className="text-sm text-gray-400 mt-2">Click "New Roadmap" to get started</p>
            </div>
          ) : (
            roadmaps.map(roadmap => (
              <div key={roadmap.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{roadmap.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(roadmap.status)}`}>
                          {roadmap.status}
                        </span>
                        <span className="text-xs text-gray-400">v{roadmap.version}</span>
                      </div>
                      <p className="text-sm text-gray-600">{roadmap.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {roadmap.sharedWith && roadmap.sharedWith.length > 0 && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-lg">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-xs text-green-600">Issued</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-semibold text-purple-600">{roadmap.overallProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 rounded-full h-2.5 transition-all duration-500" 
                        style={{ width: `${roadmap.overallProgress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Start:</span>
                        <span className="ml-2 font-medium text-gray-900">{new Date(roadmap.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <span className="ml-2 font-medium text-gray-900">{new Date(roadmap.targetDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Updated:</span>
                        <span className="ml-2 text-gray-600">{new Date(roadmap.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xl font-bold text-blue-600">{roadmap.milestones.length}</p>
                      <p className="text-xs text-gray-600">Milestones</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xl font-bold text-green-600">{roadmap.features.length}</p>
                      <p className="text-xs text-gray-600">Features</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                      <p className="text-xl font-bold text-orange-600">{roadmap.risks.length}</p>
                      <p className="text-xs text-gray-600">Risks</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <p className="text-xl font-bold text-purple-600">
                        {roadmap.milestones.filter(m => m.status === 'completed').length}/{roadmap.milestones.length}
                      </p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <p className="text-xl font-bold text-yellow-600">{roadmap.blockers?.length || 0}</p>
                      <p className="text-xs text-gray-600">Blockers</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openProgressModal(roadmap)}
                      className="px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Update Progress</span>
                    </button>
                    <button
                      onClick={() => downloadRoadmap(roadmap)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download</span>
                    </button>
                    
                    {roadmap.status !== 'shared' && (
                      <button
                        onClick={() => handleShare(roadmap)}
                        className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Issue</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Progress Update Modal */}
      {showProgressModal && updatingRoadmap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Update Progress</h2>
                <p className="text-sm text-gray-500">{updatingRoadmap.title}</p>
              </div>
              <button onClick={() => setShowProgressModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Overall Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overall Progress</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressUpdate.overallProgress}
                    onChange={(e) => setProgressUpdate({...progressUpdate, overallProgress: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold text-purple-600">{progressUpdate.overallProgress}%</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${progressUpdate.overallProgress}%` }}></div>
                </div>
              </div>

              {/* Milestone Progress */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🎯 Milestone Progress</h3>
                <div className="space-y-3">
                  {updatingRoadmap.milestones.map(milestone => {
                    const update = progressUpdate.milestoneUpdates.find(u => u.id === milestone.id);
                    const progress = update ? update.progress : milestone.progress || 0;
                    return (
                      <div key={milestone.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{milestone.title}</span>
                          <span className="text-sm font-semibold text-purple-600">{progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={(e) => updateMilestoneProgress(milestone.id, parseInt(e.target.value))}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completed Features */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">✅ Completed Features</h3>
                <div className="space-y-2">
                  {updatingRoadmap.features.map(feature => (
                    <label key={feature.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={progressUpdate.completedFeatures.includes(feature.name)}
                        onChange={() => toggleFeatureCompletion(feature.name)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-700">{feature.name}</span>
                      <span className={`ml-auto px-2 py-0.5 rounded text-xs ${getPriorityBadge(feature.priority)}`}>
                        {feature.priority}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Blockers */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🚫 Blockers / Issues</h3>
                <div className="space-y-2">
                  {progressUpdate.blockers.map((blocker, index) => (
                    <div key={index} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-red-700">{blocker}</span>
                      <button onClick={() => removeBlocker(index)} className="text-red-500 hover:text-red-700">×</button>
                    </div>
                  ))}
                  <div className="flex space-x-2 mt-2">
                    <input
                      type="text"
                      value={newBlocker}
                      onChange={(e) => setNewBlocker(e.target.value)}
                      placeholder="Add a blocker or issue..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    />
                    <button onClick={addBlocker} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Progress Notes</label>
                <textarea
                  value={progressUpdate.notes}
                  onChange={(e) => setProgressUpdate({...progressUpdate, notes: e.target.value})}
                  rows="3"
                  placeholder="Describe what was accomplished this week, any challenges, etc..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProgressUpdate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {showShareModal && sharingRoadmap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Issue Roadmap</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Issue "{sharingRoadmap.title}" to Manager, CEO, and COO?
              </p>
              
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manager, CEO & COO</p>
                    <p className="text-xs text-gray-500">They will receive view-only access to this issued MVP roadmap</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={issueRoadmapToLeadership}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Issue Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MVPRoadmap;
