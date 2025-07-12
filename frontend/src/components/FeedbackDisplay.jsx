import React from 'react';
import { Star, User, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Smile, Meh, Frown } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeedbackDisplay = ({ 
  feedback, 
  showUserInfo = true, 
  showSwapInfo = true, 
  showActions = false,
  onDelete,
  currentUserId 
}) => {
  if (!feedback || feedback.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600">No feedback available</p>
      </div>
    );
  }

  const getRatingIcon = (rating) => {
    if (rating >= 4) return <Smile className="w-4 h-4 text-green-600" />;
    if (rating >= 3) return <Meh className="w-4 h-4 text-yellow-600" />;
    return <Frown className="w-4 h-4 text-red-600" />;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canDelete = (feedbackItem) => {
    return showActions && 
           currentUserId && 
           feedbackItem.giverId === currentUserId &&
           (new Date() - new Date(feedbackItem.createdAt)) < 24 * 60 * 60 * 1000; // 24 hours
  };

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          {/* User Info */}
          {showUserInfo && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {item.giver?.firstName?.charAt(0) || 'U'}{item.giver?.lastName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {item.giver?.firstName || 'Unknown'} {item.giver?.lastName || 'User'}
                  </h4>
                  <p className="text-sm text-gray-600">Gave feedback</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < item.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">({item.rating}/5)</span>
            <div className="ml-2">
              {getRatingIcon(item.rating)}
            </div>
          </div>

          {/* Comment */}
          {item.comment && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-gray-800 text-sm leading-relaxed">{item.comment}</p>
            </div>
          )}

          {/* Swap Info */}
          {showSwapInfo && item.swapRequest && (
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-600 mb-2">Swap Details:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-blue-900">Offered:</span>
                  <p className="text-gray-800">{item.swapRequest.offeredSkill?.name}</p>
                </div>
                <div>
                  <span className="font-medium text-green-900">Requested:</span>
                  <p className="text-gray-800">{item.swapRequest.requestedSkill?.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex space-x-2">
                {item.giver?.id && (
                  <Link
                    to={`/users/${item.giver.id}`}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </Link>
                )}
              </div>
              
              {canDelete(item) && (
                <button
                  onClick={() => onDelete?.(item.id)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FeedbackDisplay; 