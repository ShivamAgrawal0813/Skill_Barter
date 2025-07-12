import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { feedbackAPI, swapAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Star,
  MessageSquare,
  Calendar,
  User,
  BookOpen,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Award,
  TrendingUp,
  Users,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BarChart3,
  Heart,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

const Feedback = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalGiven: 0,
    averageRating: 0,
    totalSwaps: 0
  });

  useEffect(() => {
    fetchFeedback();
    fetchPendingFeedback();
    fetchStats();
  }, [activeTab]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const type = activeTab === 'received' ? 'received' : 'given';
      const response = await feedbackAPI.getMyFeedback({ type });
      setFeedback(response.data.data.feedback || []);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingFeedback = async () => {
    try {
      const response = await swapAPI.getSwapRequests({ 
        status: 'COMPLETED',
        type: 'all'
      });
      const completedSwaps = response.data.data.swapRequests || response.data.data.swaps || [];
      
      // Filter swaps where user hasn't given feedback yet
      const pending = completedSwaps.filter(swap => {
        const isParticipant = swap.senderId === user?.id || swap.receiverId === user?.id;
        const hasFeedback = swap.feedback && swap.feedback.length > 0;
        const isGiver = swap.feedback && swap.feedback.some(f => f.giverId === user?.id);
        return isParticipant && (!hasFeedback || !isGiver);
      });
      
      setPendingFeedback(pending);
    } catch (error) {
      console.error('Failed to fetch pending feedback:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [receivedResponse, givenResponse] = await Promise.all([
        feedbackAPI.getMyFeedback({ type: 'received' }),
        feedbackAPI.getMyFeedback({ type: 'given' })
      ]);

      const receivedFeedback = receivedResponse.data.data.feedback || [];
      const givenFeedback = givenResponse.data.data.feedback || [];

      const totalReceived = receivedFeedback.length;
      const totalGiven = givenFeedback.length;
      const averageRating = totalReceived > 0 
        ? receivedFeedback.reduce((sum, f) => sum + f.rating, 0) / totalReceived 
        : 0;

      setStats({
        totalReceived,
        totalGiven,
        averageRating: Math.round(averageRating * 10) / 10,
        totalSwaps: totalReceived + totalGiven
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSwap || !feedbackForm.comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackAPI.createFeedback({
        swapRequestId: selectedSwap.id,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment
      });
      
      toast.success('Feedback submitted successfully');
      setShowFeedbackModal(false);
      setSelectedSwap(null);
      setFeedbackForm({ rating: 5, comment: '' });
      
      // Refresh data
      await Promise.all([fetchFeedback(), fetchPendingFeedback(), fetchStats()]);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      await feedbackAPI.deleteFeedback(feedbackId);
      toast.success('Feedback deleted successfully');
      await Promise.all([fetchFeedback(), fetchStats()]);
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

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

  const filteredFeedback = feedback.filter(item => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const otherUserName = activeTab === 'received' 
        ? `${item.giver?.firstName || ''} ${item.giver?.lastName || ''}`.toLowerCase()
        : `${item.receiver?.firstName || ''} ${item.receiver?.lastName || ''}`.toLowerCase();
      
      return otherUserName.includes(searchLower);
    }
    if (ratingFilter !== 'all') {
      return item.rating === parseInt(ratingFilter);
    }
    return true;
  });

  const filteredPendingFeedback = pendingFeedback.filter(swap => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const otherUser = swap.senderId === user?.id ? swap.receiver : swap.sender;
      const otherUserName = `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.toLowerCase();
      return otherUserName.includes(searchLower);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
            <p className="text-gray-600 mt-1">Manage your feedback and reviews</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => Promise.all([fetchFeedback(), fetchPendingFeedback(), fetchStats()])}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Total Received</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReceived}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Average Rating</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Given</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalGiven}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{filteredPendingFeedback.length}</p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'received', label: 'Received Feedback', count: filteredFeedback.length, icon: Award },
              { key: 'given', label: 'Given Feedback', count: filteredFeedback.length, icon: Star },
              { key: 'pending', label: 'Pending Feedback', count: filteredPendingFeedback.length, icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        // Pending Feedback
        <div className="space-y-6">
          {filteredPendingFeedback.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending feedback</h3>
              <p className="text-gray-600 mb-4">You have no completed swaps waiting for feedback.</p>
              <Link
                to="/swaps"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                View Your Swaps
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPendingFeedback.map((swap) => {
                const otherUser = swap.senderId === user?.id ? swap.receiver : swap.sender;
                const isSender = swap.senderId === user?.id;
                
                return (
                  <div key={swap.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {otherUser?.firstName?.charAt(0) || 'U'}{otherUser?.lastName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {otherUser?.firstName || 'Unknown'} {otherUser?.lastName || 'User'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {isSender ? 'You sent this request' : 'You received this request'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Completed</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(swap.updatedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-900">You offered</span>
                          </div>
                          <p className="font-semibold text-gray-900">{swap.offeredSkill.name}</p>
                          <p className="text-xs text-gray-600">{swap.offeredSkill.category}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <BookOpen className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-900">You learned</span>
                          </div>
                          <p className="font-semibold text-gray-900">{swap.requestedSkill.name}</p>
                          <p className="text-xs text-gray-600">{swap.requestedSkill.category}</p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setSelectedSwap(swap);
                            setShowFeedbackModal(true);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Give Feedback
                        </button>
                        <Link
                          to={`/swaps/${swap.id}`}
                          className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Received/Given Feedback
        <div className="space-y-6">
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} feedback
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'received' 
                  ? 'You haven\'t received any feedback yet.' 
                  : 'You haven\'t given any feedback yet.'}
              </p>
              <Link
                to="/swaps"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                View Your Swaps
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFeedback.map((item) => {
                const otherUser = activeTab === 'received' ? item.giver : item.receiver;
                
                return (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {otherUser?.firstName?.charAt(0) || 'U'}{otherUser?.lastName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {otherUser?.firstName || 'Unknown'} {otherUser?.lastName || 'User'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {activeTab === 'received' ? 'Gave you feedback' : 'You gave feedback'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center mb-4">
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
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-gray-800">{item.comment}</p>
                        </div>
                      )}

                      {/* Swap Info */}
                      {item.swapRequest && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-600 mb-1">Swap Details:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Offered:</span> {item.swapRequest.offeredSkill.name}
                            </div>
                            <div>
                              <span className="font-medium">Requested:</span> {item.swapRequest.requestedSkill.name}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        {activeTab === 'given' && (
                          <button
                            onClick={() => handleDeleteFeedback(item.id)}
                            className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        )}
                        {otherUser?.id && (
                          <Link
                            to={`/users/${otherUser.id}`}
                            className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View Profile</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSwap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Give Feedback</h3>
            
            {/* Swap Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Swap with:</p>
              <p className="font-semibold text-gray-900">
                {selectedSwap.senderId === user?.id 
                  ? `${selectedSwap.receiver?.firstName || 'Unknown'} ${selectedSwap.receiver?.lastName || 'User'}`
                  : `${selectedSwap.sender?.firstName || 'Unknown'} ${selectedSwap.sender?.lastName || 'User'}`
                }
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      className="text-2xl"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= feedbackForm.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {feedbackForm.rating === 5 && 'Excellent experience!'}
                  {feedbackForm.rating === 4 && 'Great experience!'}
                  {feedbackForm.rating === 3 && 'Good experience'}
                  {feedbackForm.rating === 2 && 'Fair experience'}
                  {feedbackForm.rating === 1 && 'Poor experience'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience with this skill exchange..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedSwap(null);
                  setFeedbackForm({ rating: 5, comment: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackForm.comment.trim() || submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback; 