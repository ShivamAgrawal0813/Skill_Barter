import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { swapAPI, feedbackAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import FeedbackModal from '../components/FeedbackModal';
import FeedbackDisplay from '../components/FeedbackDisplay';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
  MapPin,
  Star,
  Edit3,
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  Info,
  Shield,
  Award,
  CalendarDays,
  Clock3,
  Users,
  BookOpen,
  CheckSquare,
  XSquare,
  AlertTriangle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const SwapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [swapFeedback, setSwapFeedback] = useState([]);
  const [canGiveFeedback, setCanGiveFeedback] = useState(false);

  useEffect(() => {
    fetchSwapDetail();
    if (swap?.status === 'COMPLETED') {
      fetchSwapFeedback();
    }
  }, [id, swap?.status]);

  const fetchSwapDetail = async () => {
    try {
      setLoading(true);
      const response = await swapAPI.getSwapRequest(id);
      console.log('Swap API response:', response.data); // Debug log
      
      // Handle both possible response structures
      const swapData = response.data.data.swapRequest || response.data.data.swap;
      if (!swapData) {
        throw new Error('Swap data not found');
      }
      
      console.log('Swap data:', swapData); // Debug log
      setSwap(swapData);
    } catch (error) {
      console.error('Failed to fetch swap detail:', error);
      toast.error('Failed to load swap details');
      navigate('/swaps');
    } finally {
      setLoading(false);
    }
  };

  const fetchSwapFeedback = async () => {
    try {
      const response = await feedbackAPI.getSwapFeedback(id);
      const feedbackData = response.data.data.feedback || [];
      setSwapFeedback(Array.isArray(feedbackData) ? feedbackData : [feedbackData]);
      
      // Check if current user can give feedback
      if (swap?.status === 'COMPLETED' && user) {
        const userFeedback = feedbackData.find(f => f.giverId === user.id);
        setCanGiveFeedback(!userFeedback);
      }
    } catch (error) {
      console.error('Failed to fetch swap feedback:', error);
      setSwapFeedback([]);
      setCanGiveFeedback(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const updateData = { status: newStatus };
      
      if (newStatus === 'ACCEPTED' && scheduledDate && scheduledTime) {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        updateData.scheduledDate = scheduledDateTime.toISOString();
      }
      
      await swapAPI.updateSwapStatus(id, updateData);
      await fetchSwapDetail();
      setShowScheduleModal(false);
      toast.success(`Swap ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Failed to update swap status:', error);
      toast.error('Failed to update swap status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelSwap = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setUpdating(true);
    try {
      await swapAPI.cancelSwapRequest(id);
      toast.success('Swap request cancelled successfully');
      navigate('/swaps');
    } catch (error) {
      console.error('Failed to cancel swap:', error);
      toast.error('Failed to cancel swap request');
    } finally {
      setUpdating(false);
      setShowCancelModal(false);
    }
  };

  const handleFeedbackSuccess = async () => {
    await fetchSwapFeedback();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'COMPLETED':
        return <Award className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Waiting for response from the other user';
      case 'ACCEPTED':
        return 'Swap has been accepted and is ready to proceed';
      case 'REJECTED':
        return 'Swap request was declined';
      case 'CANCELLED':
        return 'Swap request was cancelled';
      case 'COMPLETED':
        return 'Skill exchange has been completed';
      default:
        return 'Unknown status';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSender = user?.id === swap?.senderId;
  const otherUser = isSender ? swap?.receiver : swap?.sender;
  const canEdit = swap?.status === 'PENDING' || swap?.status === 'ACCEPTED';
  const canComplete = swap?.status === 'ACCEPTED';
  const canCancel = swap?.status === 'PENDING' || swap?.status === 'ACCEPTED';
  const canProvideFeedback = canGiveFeedback;

  // Early return if swap is not loaded yet
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading swap details...</p>
        </div>
      </div>
    );
  }

  // Early return if swap is not found
  if (!swap) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Swap not found</h3>
          <p className="text-gray-600 mb-4">The swap request you're looking for doesn't exist.</p>
          <Link
            to="/swaps"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Swaps
          </Link>
        </div>
      </div>
    );
  }

  // Safety check for required swap properties
  if (!swap.sender || !swap.receiver || !swap.offeredSkill || !swap.requestedSkill) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid swap data</h3>
          <p className="text-gray-600 mb-4">The swap data is incomplete or corrupted.</p>
          <Link
            to="/swaps"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Swaps
          </Link>
        </div>
      </div>
    );
  }



  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/swaps')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Swap Details</h1>
              <p className="text-gray-600 mt-1">{getStatusDescription(swap.status)}</p>
            </div>
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(swap.status)}`}>
            {getStatusIcon(swap.status)}
            <span className="ml-2">{swap.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Swap Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Swap Information</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <CalendarDays className="w-4 h-4" />
                <span>Created {formatDate(swap.createdAt)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-3">
                  <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">You're offering:</h3>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="font-semibold text-gray-900 text-lg">{swap.offeredSkill.name}</p>
                  <p className="text-sm text-gray-600 mb-2">{swap.offeredSkill.category}</p>
                  {swap.offeredSkill.description && (
                    <p className="text-sm text-gray-700">{swap.offeredSkill.description}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center mb-3">
                  <BookOpen className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-green-900">You're requesting:</h3>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="font-semibold text-gray-900 text-lg">{swap.requestedSkill.name}</p>
                  <p className="text-sm text-gray-600 mb-2">{swap.requestedSkill.category}</p>
                  {swap.requestedSkill.description && (
                    <p className="text-sm text-gray-700">{swap.requestedSkill.description}</p>
                  )}
                </div>
              </div>
            </div>

            {swap.message && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
                  Message from {isSender ? 'you' : (otherUser?.firstName || 'the other user')}:
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-800">{swap.message}</p>
                </div>
              </div>
            )}

            {swap.scheduledDate && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                  Scheduled Session:
                </h3>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-purple-900">
                        {formatDate(swap.scheduledDate)}
                      </p>
                      <p className="text-sm text-purple-700">
                        {formatTime(swap.scheduledDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-600">Scheduled</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isSender && swap.status === 'PENDING' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Respond to Request</h2>
              <p className="text-gray-600 mb-6">
                Review the swap request and decide whether to accept or reject it. 
                If you accept, you can schedule a session time.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <CheckSquare className="w-5 h-5 mr-2" />
                  Accept & Schedule
                </button>
                <button
                  onClick={() => handleStatusUpdate('REJECTED')}
                  disabled={updating}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <XSquare className="w-5 h-5 mr-2" />
                  Reject Request
                </button>
              </div>
            </div>
          )}

          {canComplete && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Swap</h2>
              <p className="text-gray-600 mb-6">
                Once you've completed the skill exchange session, mark it as completed. 
                You'll be able to provide feedback after completion.
              </p>
              <button
                onClick={() => handleStatusUpdate('COMPLETED')}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                <Award className="w-5 h-5 mr-2" />
                Mark as Completed
              </button>
            </div>
          )}

          {/* Feedback Section */}
          {swap?.status === 'COMPLETED' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Feedback</h2>
                {canGiveFeedback && (
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Leave Feedback</span>
                  </button>
                )}
              </div>
              
              {swapFeedback.length > 0 ? (
                <FeedbackDisplay 
                  feedback={swapFeedback}
                  showUserInfo={true}
                  showSwapInfo={false}
                  showActions={false}
                />
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-4">
                    No feedback has been provided yet for this swap.
                  </p>
                  {canGiveFeedback && (
                    <p className="text-sm text-gray-500">
                      Be the first to share your experience!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {canCancel && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cancel Swap</h2>
              <p className="text-gray-600 mb-6">
                You can cancel this swap request at any time. Please provide a reason for cancellation.
              </p>
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={updating}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Cancel Swap
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Other User Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-gray-600" />
              {isSender ? 'Recipient' : 'Sender'}
            </h2>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {otherUser?.firstName?.charAt(0) || 'U'}{otherUser?.lastName?.charAt(0) || 'S'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {otherUser?.firstName || 'Unknown'} {otherUser?.lastName || 'User'}
                </h3>
                {otherUser?.location && (
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {otherUser.location}
                  </div>
                )}
              </div>
            </div>
            {otherUser?.bio && (
              <p className="text-gray-700 text-sm mb-4">{otherUser.bio}</p>
            )}
            <div className="space-y-2">
              {otherUser?.id && (
                <Link
                  to={`/users/${otherUser.id}`}
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  View Profile
                </Link>
              )}
            </div>
          </div>

          {/* Swap Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock3 className="w-5 h-5 mr-2 text-gray-600" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Swap Request Created</p>
                  <p className="text-sm text-gray-600">{formatDate(swap.createdAt)}</p>
                </div>
              </div>
              {swap.status !== 'PENDING' && (
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    swap.status === 'ACCEPTED' ? 'bg-green-600' :
                    swap.status === 'REJECTED' ? 'bg-red-600' :
                    swap.status === 'CANCELLED' ? 'bg-gray-600' : 'bg-blue-600'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {swap.status === 'ACCEPTED' ? 'Request Accepted' : 
                       swap.status === 'REJECTED' ? 'Request Rejected' : 
                       swap.status === 'CANCELLED' ? 'Request Cancelled' : 'Request Completed'}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate(swap.updatedAt)}</p>
                  </div>
                </div>
              )}
              {swap.scheduledDate && (
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Session Scheduled</p>
                    <p className="text-sm text-gray-600">{formatDate(swap.scheduledDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/swaps"
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Back to All Swaps
              </Link>
              <Link
                to="/users"
                className="block w-full text-center bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Find More Users
              </Link>
              <Link
                to="/skills"
                className="block w-full text-center bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Browse Skills
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate('ACCEPTED')}
                disabled={!scheduledDate || !scheduledTime || updating}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                Accept & Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Swap</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide a reason for cancelling this swap..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Keep Swap
              </button>
              <button
                onClick={handleCancelSwap}
                disabled={!cancelReason.trim() || updating}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                Cancel Swap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        swap={swap}
        onSuccess={handleFeedbackSuccess}
        currentUser={user}
      />
    </div>
  );
};

export default SwapDetail; 