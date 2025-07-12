import React, { useState } from 'react';
import { Star, X, MessageSquare, User, BookOpen, Calendar } from 'lucide-react';
import { feedbackAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  swap, 
  onSuccess,
  currentUser 
}) => {
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !swap) return null;

  const handleSubmit = async () => {
    if (!feedbackForm.comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackAPI.createFeedback({
        swapRequestId: swap.id,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment
      });
      
      toast.success('Feedback submitted successfully');
      setFeedbackForm({ rating: 5, comment: '' });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedbackForm({ rating: 5, comment: '' });
    onClose();
  };

  const otherUser = swap.senderId === currentUser?.id ? swap.receiver : swap.sender;
  const isSender = swap.senderId === currentUser?.id;

  const getRatingText = (rating) => {
    switch (rating) {
      case 5: return 'Excellent experience!';
      case 4: return 'Great experience!';
      case 3: return 'Good experience';
      case 2: return 'Fair experience';
      case 1: return 'Poor experience';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Give Feedback</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Swap Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {otherUser?.firstName?.charAt(0) || 'U'}{otherUser?.lastName?.charAt(0) || 'S'}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {otherUser?.firstName || 'Unknown'} {otherUser?.lastName || 'User'}
              </h4>
              <p className="text-sm text-gray-600">
                {isSender ? 'You sent this request' : 'You received this request'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <BookOpen className="w-3 h-3 text-blue-600 mr-1" />
                <span className="text-xs font-medium text-blue-900">You offered</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{swap.offeredSkill?.name}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <BookOpen className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs font-medium text-green-900">You learned</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{swap.requestedSkill?.name}</p>
            </div>
          </div>

          {swap.completedAt && (
            <div className="flex items-center mt-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Completed on {new Date(swap.completedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Feedback Form */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate this experience?
              </label>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= feedbackForm.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {getRatingText(feedbackForm.rating)}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share your experience
              </label>
              <textarea
                value={feedbackForm.comment}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about your experience with this skill exchange. What went well? What could be improved?"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Your feedback helps improve the community
                </p>
                <span className="text-xs text-gray-500">
                  {feedbackForm.comment.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!feedbackForm.comment.trim() || submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal; 