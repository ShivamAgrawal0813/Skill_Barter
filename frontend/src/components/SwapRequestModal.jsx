import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { swapAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const SwapRequestModal = ({ user, onClose }) => {
  const { user: currentUser, fetchUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    offeredSkillId: '',
    requestedSkillId: '',
    message: '',
    scheduledDate: ''
  });

  // Get current user's offered skills and target user's offered skills
  const currentUserOfferedSkills = currentUser?.userSkills?.filter(skill => skill.skillType === 'OFFERED') || [];
  const targetUserOfferedSkills = user?.userSkills?.filter(skill => skill.skillType === 'OFFERED') || [];

  useEffect(() => {
    // Fetch user profile if skills are not available
    if (!currentUser?.userSkills && fetchUserProfile) {
      fetchUserProfile();
    }
  }, [currentUser, fetchUserProfile]);

  useEffect(() => {
    // Auto-select first available skills if only one option
    if (currentUserOfferedSkills.length === 1 && targetUserOfferedSkills.length === 1) {
      setFormData(prev => ({
        ...prev,
        offeredSkillId: currentUserOfferedSkills[0].skill.id,
        requestedSkillId: targetUserOfferedSkills[0].skill.id
      }));
    }
  }, [currentUserOfferedSkills, targetUserOfferedSkills]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.offeredSkillId || !formData.requestedSkillId) {
      toast.error('Please select both skills for the swap');
      return;
    }

    setLoading(true);
    try {
      await swapAPI.createSwapRequest({
        receiverId: user.id,
        offeredSkillId: formData.offeredSkillId,
        requestedSkillId: formData.requestedSkillId,
        message: formData.message,
        scheduledDate: formData.scheduledDate || undefined
      });

      toast.success('Swap request sent successfully!');
      onClose();
    } catch (error) {
      // Error handling is done by the API interceptor
      console.error('Error creating swap request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Request Swap with {user.firstName}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* What you're offering */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What you're offering
            </label>
            <select
              name="offeredSkillId"
              value={formData.offeredSkillId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a skill you can offer</option>
              {currentUserOfferedSkills.map((userSkill) => (
                <option key={userSkill.skill.id} value={userSkill.skill.id}>
                  {userSkill.skill.name} (Level {userSkill.level})
                </option>
              ))}
            </select>
            {currentUserOfferedSkills.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                You need to add skills to your profile first
              </p>
            )}
          </div>

          {/* What you're requesting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What you're requesting from {user.firstName}
            </label>
            <select
              name="requestedSkillId"
              value={formData.requestedSkillId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a skill {user.firstName} offers</option>
              {targetUserOfferedSkills.map((userSkill) => (
                <option key={userSkill.skill.id} value={userSkill.skill.id}>
                  {userSkill.skill.name} (Level {userSkill.level})
                </option>
              ))}
            </select>
            {targetUserOfferedSkills.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                {user.firstName} hasn't added any skills to offer
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={3}
              maxLength={500}
              placeholder="Add a personal message to your swap request..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length}/500 characters
            </p>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date (optional)
            </label>
            <input
              type="datetime-local"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleInputChange}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.offeredSkillId || !formData.requestedSkillId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapRequestModal; 