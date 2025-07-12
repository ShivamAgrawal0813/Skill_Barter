import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { swapAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Send,
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  Ban,
  CheckSquare,
  XSquare,
  Award,
  CalendarDays,
  Clock3,
  Users,
  BookOpen,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';

const Swaps = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, limit: 12, offset: 0 });
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSwap, setExpandedSwap] = useState(null);

  useEffect(() => {
    fetchSwaps();
  }, [activeTab, statusFilter, page]);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const params = {
        type: activeTab === 'all' ? undefined : activeTab,
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit
      };
      const response = await swapAPI.getSwapRequests(params);
      setSwaps(response.data.data.swapRequests || response.data.data.swaps || []);
      if (response.data.data.pagination) {
        setPagination(response.data.data.pagination);
        setTotalPages(Math.ceil(response.data.data.pagination.total / response.data.data.pagination.limit));
      }
    } catch (error) {
      console.error('Failed to fetch swaps:', error);
      toast.error('Failed to load swaps');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (swapId, newStatus) => {
    setRefreshing(true);
    try {
      await swapAPI.updateSwapStatus(swapId, { status: newStatus });
      await fetchSwaps(); // Refresh the list
      toast.success(`Swap ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Failed to update swap status:', error);
      toast.error('Failed to update swap status');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelSwap = async (swapId) => {
    setRefreshing(true);
    try {
      await swapAPI.cancelSwapRequest(swapId);
      await fetchSwaps(); // Refresh the list
      toast.success('Swap request cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel swap:', error);
      toast.error('Failed to cancel swap request');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteSwap = async (swapId) => {
    setRefreshing(true);
    try {
      await swapAPI.deleteSwapRequest(swapId);
      await fetchSwaps(); // Refresh the list
      toast.success('Swap request deleted successfully');
    } catch (error) {
      console.error('Failed to delete swap:', error);
      toast.error('Failed to delete swap request');
    } finally {
      setRefreshing(false);
    }
  };

  const handleConfirmAction = (swap, action, actionName) => {
    setSelectedSwap(swap);
    setConfirmAction({ action, actionName });
    setShowConfirmDialog(true);
  };

  const executeConfirmedAction = async () => {
    if (!selectedSwap || !confirmAction) return;

    const { action, actionName } = confirmAction;
    
    try {
      if (action === 'accept') {
        await handleStatusUpdate(selectedSwap.id, 'ACCEPTED');
      } else if (action === 'reject') {
        await handleStatusUpdate(selectedSwap.id, 'REJECTED');
      } else if (action === 'cancel') {
        await handleCancelSwap(selectedSwap.id);
      } else if (action === 'delete') {
        await handleDeleteSwap(selectedSwap.id);
      } else if (action === 'complete') {
        await handleStatusUpdate(selectedSwap.id, 'COMPLETED');
      }
    } catch (error) {
      console.error(`Failed to ${actionName}:`, error);
    } finally {
      setShowConfirmDialog(false);
      setSelectedSwap(null);
      setConfirmAction(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'CANCELLED':
        return <Ban className="w-4 h-4 text-gray-600" />;
      case 'COMPLETED':
        return <Award className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
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
        return 'Waiting for response';
      case 'ACCEPTED':
        return 'Swap accepted - schedule your session';
      case 'REJECTED':
        return 'Swap was declined';
      case 'CANCELLED':
        return 'Swap was cancelled';
      case 'COMPLETED':
        return 'Swap completed successfully';
      default:
        return 'Unknown status';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const isSender = (swap) => user?.id === swap.senderId;
  const otherUser = (swap) => isSender(swap) ? swap.receiver : swap.sender;

  const filteredSwaps = swaps.filter(swap => {
    if (searchTerm) {
      const otherUserName = `${otherUser(swap).firstName} ${otherUser(swap).lastName}`.toLowerCase();
      const offeredSkill = swap.offeredSkill.name.toLowerCase();
      const requestedSkill = swap.requestedSkill.name.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return otherUserName.includes(searchLower) || 
             offeredSkill.includes(searchLower) || 
             requestedSkill.includes(searchLower);
    }
    return true;
  });

  const getStats = () => {
    const stats = {
      total: swaps.length,
      pending: swaps.filter(s => s.status === 'PENDING').length,
      accepted: swaps.filter(s => s.status === 'ACCEPTED').length,
      completed: swaps.filter(s => s.status === 'COMPLETED').length,
      cancelled: swaps.filter(s => s.status === 'CANCELLED' || s.status === 'REJECTED').length
    };
    return stats;
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading swaps...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Swaps</h1>
            <p className="text-gray-600 mt-1">Manage your skill exchange requests</p>
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
              onClick={fetchSwaps}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <Ban className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Cancelled</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Swaps</option>
                  <option value="sent">Sent Requests</option>
                  <option value="received">Received Requests</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Swaps', count: stats.total },
              { key: 'sent', label: 'Sent', count: swaps.filter(s => s.senderId === user?.id).length },
              { key: 'received', label: 'Received', count: swaps.filter(s => s.receiverId === user?.id).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Swaps List */}
      {filteredSwaps.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps found</h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'sent' ? 'You haven\'t sent any swap requests yet.' :
             activeTab === 'received' ? 'You haven\'t received any swap requests yet.' :
             'No swaps match your current filters.'}
          </p>
          <Link
            to="/users"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Find Users to Swap With
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSwaps.map((swap) => (
            <div key={swap.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {otherUser(swap).firstName.charAt(0)}{otherUser(swap).lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {otherUser(swap).firstName} {otherUser(swap).lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isSender(swap) ? 'You sent this request' : 'You received this request'}
                      </p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(swap.status)}`}>
                    {getStatusIcon(swap.status)}
                    <span className="ml-1">{swap.status}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Offering</span>
                    </div>
                    <p className="font-semibold text-gray-900">{swap.offeredSkill.name}</p>
                    <p className="text-xs text-gray-600">{swap.offeredSkill.category}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-900">Requesting</span>
                    </div>
                    <p className="font-semibold text-gray-900">{swap.requestedSkill.name}</p>
                    <p className="text-xs text-gray-600">{swap.requestedSkill.category}</p>
                  </div>
                </div>

                {/* Message */}
                {swap.message && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{swap.message}</p>
                  </div>
                )}

                {/* Scheduled Date */}
                {swap.scheduledDate && (
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    <span>Scheduled: {formatDate(swap.scheduledDate)} at {formatTime(swap.scheduledDate)}</span>
                  </div>
                )}

                {/* Timestamps */}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {formatDate(swap.createdAt)}</span>
                  {swap.updatedAt !== swap.createdAt && (
                    <span>Updated: {formatDate(swap.updatedAt)}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      to={`/swaps/${swap.id}`}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>
                    <Link
                      to={`/users/${otherUser(swap).id}`}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Profile</span>
                    </Link>
                  </div>

                  {/* Status-specific actions */}
                  <div className="flex space-x-2">
                    {!isSender(swap) && swap.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleConfirmAction(swap, 'accept', 'accept')}
                          disabled={refreshing}
                          className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                        >
                          <CheckSquare className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleConfirmAction(swap, 'reject', 'reject')}
                          disabled={refreshing}
                          className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        >
                          <XSquare className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {swap.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleConfirmAction(swap, 'complete', 'complete')}
                        disabled={refreshing}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Award className="w-4 h-4" />
                        <span>Complete</span>
                      </button>
                    )}

                    {(swap.status === 'PENDING' || swap.status === 'ACCEPTED') && (
                      <button
                        onClick={() => handleConfirmAction(swap, 'cancel', 'cancel')}
                        disabled={refreshing}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}

                    {(swap.status === 'COMPLETED' || swap.status === 'CANCELLED' || swap.status === 'REJECTED') && (
                      <button
                        onClick={() => handleConfirmAction(swap, 'delete', 'delete')}
                        disabled={refreshing}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setPage(idx + 1)}
                className={`px-3 py-2 border rounded-md text-sm font-medium ${
                  page === idx + 1
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedSwap && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {confirmAction.actionName} this swap request?
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swaps; 