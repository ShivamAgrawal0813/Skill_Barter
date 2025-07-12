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
  RefreshCw
} from 'lucide-react';

const Swaps = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });

  useEffect(() => {
    fetchSwaps();
  }, [activeTab, statusFilter, page]);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const params = {
        type: activeTab === 'sent' ? 'sent' : 'received',
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
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelSwap = async (swapId) => {
    if (!confirm('Are you sure you want to cancel this swap request?')) return;

    setRefreshing(true);
    try {
      await swapAPI.cancelSwapRequest(swapId);
      await fetchSwaps(); // Refresh the list
      toast.success('Swap request cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel swap:', error);
    } finally {
      setRefreshing(false);
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
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getSwapStats = () => {
    const stats = {
      pending: swaps.filter(s => s.status === 'PENDING').length,
      accepted: swaps.filter(s => s.status === 'ACCEPTED').length,
      completed: swaps.filter(s => s.status === 'COMPLETED').length,
      total: swaps.length
    };
    return stats;
  };

  const stats = getSwapStats();

  if (loading && swaps.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading swaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
            <p className="text-gray-600 mt-2">Manage your skill swap requests</p>
          </div>
          <button
            onClick={fetchSwaps}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'received', name: 'Received', icon: Inbox },
                  { id: 'sent', name: 'Sent', icon: Send }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="flex items-center space-x-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {swaps.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} swap requests
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'sent' 
                    ? 'You haven\'t sent any swap requests yet' 
                    : 'You haven\'t received any swap requests yet'
                  }
                </p>
                {activeTab === 'sent' && (
                  <Link
                    to="/users"
                    className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Find Users to Swap With
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {swaps.map((swap) => (
                    <div
                      key={swap.id}
                      className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {activeTab === 'sent' ? swap.receiver.firstName : swap.sender.firstName}{' '}
                              {activeTab === 'sent' ? swap.receiver.lastName : swap.sender.lastName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                              {getStatusIcon(swap.status)}
                              <span className="ml-1">{swap.status}</span>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">You're offering:</p>
                              <p className="text-gray-900">{swap.offeredSkill.name}</p>
                              <p className="text-xs text-gray-500">{swap.offeredSkill.category}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">You're requesting:</p>
                              <p className="text-gray-900">{swap.requestedSkill.name}</p>
                              <p className="text-xs text-gray-500">{swap.requestedSkill.category}</p>
                            </div>
                          </div>

                          {swap.message && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-4">
                              <p className="text-sm text-blue-800">{swap.message}</p>
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Created: {formatDate(swap.createdAt)}</span>
                            </div>
                            {swap.scheduledDate && (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>Scheduled: {formatDate(swap.scheduledDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2 ml-4">
                          {activeTab === 'received' && swap.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(swap.id, 'ACCEPTED')}
                                disabled={refreshing}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(swap.id, 'REJECTED')}
                                disabled={refreshing}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {swap.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleStatusUpdate(swap.id, 'COMPLETED')}
                              disabled={refreshing}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              Mark Complete
                            </button>
                          )}

                          {(swap.status === 'PENDING' || swap.status === 'ACCEPTED') && (
                            <button
                              onClick={() => handleCancelSwap(swap.id)}
                              disabled={refreshing}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}

                          <Link
                            to={`/swaps/${swap.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm text-center"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setPage(idx + 1)}
                        className={`px-3 py-1 rounded ${page === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swaps; 