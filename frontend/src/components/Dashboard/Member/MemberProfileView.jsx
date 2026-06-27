// src/components/Dashboard/Member/MemberProfileView.jsx
import React, { useState } from 'react';
import authService from '../../../services/authService';

const MemberProfileView = ({ userData, onUpdate }) => {
  const [formData, setFormData] = useState(userData);
  const [originalData] = useState(userData);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(userData?.profilePhoto || null);
  const [changes, setChanges] = useState({});

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Track changes
    if (value !== originalData[field]) {
      setChanges({ ...changes, [field]: { old: originalData[field], new: value } });
    } else {
      const newChanges = { ...changes };
      delete newChanges[field];
      setChanges(newChanges);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Profile photo must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
        setChanges({ ...changes, profilePhoto: { old: 'Previous Photo', new: 'Updated Photo' } });
      };
      reader.readAsDataURL(file);
    }
  };

  const sendNotificationToManager = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      const changeList = Object.entries(changes).map(([field, data]) => {
        const fieldNames = {
          name: 'Full Name',
          email: 'Email Address',
          phone: 'Phone Number',
          profilePhoto: 'Profile Photo'
        };
        return `• ${fieldNames[field]}: "${data.old}" → "${data.new}"`;
      }).join('\n');

      const notificationData = {
        employeeName: formData.name,
        employeeId: formData.employeeId,
        department: formData.department,
        role: formData.role,
        changes: changes,
        changeList: changeList,
        timestamp: new Date().toLocaleString()
      };

      // Store in localStorage for manager to see
      const existingNotifications = JSON.parse(localStorage.getItem('managerNotifications') || '[]');
      existingNotifications.unshift({
        id: Date.now(),
        type: 'profile_update',
        ...notificationData,
        read: false
      });
      localStorage.setItem('managerNotifications', JSON.stringify(existingNotifications));
      
      console.log('Notification sent to manager:', notificationData);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleSave = async () => {
    if (formData.phone && !/^[+]?[\d\s-]{10,15}$/.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const updateData = {
        ...formData,
        profilePhoto: profilePhotoPreview,
        updatedAt: new Date().toISOString()
      };

      await onUpdate(updateData);
      
      if (Object.keys(changes).length > 0) {
        await sendNotificationToManager();
      }
      
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setProfilePhotoPreview(originalData?.profilePhoto);
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">My Profile</h2>
          <p className="text-purple-100 text-sm">View and edit your personal information</p>
        </div>
        
        <div className="p-6">
          {saved && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center space-x-2 border border-green-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Profile updated successfully! Your manager has been notified.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2 border border-red-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Profile Photo */}
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
            <div className="relative">
              {profilePhotoPreview ? (
                <img 
                  src={profilePhotoPreview} 
                  alt={formData?.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-600"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {formData?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoChange} />
                </label>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{formData?.name}</h3>
              <p className="text-gray-500">{formData?.role} · {formData?.department}</p>
              <p className="text-sm text-gray-400">Employee ID: {formData?.employeeId}</p>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-gray-900">{formData?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-gray-900">{formData?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-gray-900">{formData?.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <p className="text-gray-900">{formData?.role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <p className="text-gray-900">{formData?.department}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <p className="text-gray-900">{formData?.joinDate || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {formData?.status || 'Active'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <p className="text-gray-900">{formData?.manager || 'N/A'}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </>
            ) : null}
          </div>

          {isEditing && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Your manager will be notified of any changes made to your profile.</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberProfileView;