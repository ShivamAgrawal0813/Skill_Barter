import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { swapAPI } from '../services/api';
import { toast } from 'react-hot-toast';
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
  Star
} from 'lucide-react';

const SwapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSwapDetail();
  }, [id]);

  const fetchSwapDetail = async () => {
    try {
      setLoading(true);
      const response = await swapAPI.getSwapRequest(id);
      setSwap(response.data.data.swap);
    } catch (error) {
      console.error('Failed to fetch swap detail:', error);
      toast.error('Failed to load swap details');
      navigate('/swaps');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await swapAPI.updateSwapStatus(id, { status: newStatus });
      await fetchSwapDetail(); // Refresh the data
      toast.success(`Swap ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Failed to update swap status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelSwap = async () => {
    if (!confirm('Are you sure you want to cancel this swap request?')) return;

    setUpdating(true);
    try {
      await swapAPI.cancelSwapRequest(id);
      toast.success('Swap request cancelled successfully');
      navigate('/swaps');
    } catch (error) {
      console.error('Failed to cancel swap:', error);
    } finally {
      setUpdating(false);
    }
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
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSender = user?.id === swap?.senderId;
  const otherUser = isSender ? swap?.receiver : swap?.sender;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading swap details...</p>
        </div>
      </div>
    );
  }

  if (!swap) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/swaps')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Swap Details</h1>
              <p className="text-gray-600 mt-1">View and manage this swap request</p>
            </div>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(swap.status)}`}>
            {getStatusIcon(swap.status)}
            <span className="ml-2">{swap.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Swap Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Swap Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">You're offering:</h3>
                <div className="bg-white rounded p-3">
                  <p className="font-semibold text-gray-900">{swap.offeredSkill.name}</p>
                  <p className="text-sm text-gray-600">{swap.offeredSkill.category}</p>
                  {swap.offeredSkill.description && (
                    <p className="text-sm text-gray-700 mt-2">{swap.offeredSkill.description}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">You're requesting:</h3>
                <div className="bg-white rounded p-3">
                  <p className="font-semibold text-gray-900">{swap.requestedSkill.name}</p>
                  <p className="text-sm text-gray-600">{swap.requestedSkill.category}</p>
                  {swap.requestedSkill.description && (
                    <p className="text-sm text-gray-700 mt-2">{swap.requestedSkill.description}</p>
                  )}
                </div>
              </div>
            </div>

            {swap.message && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Message:</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800">{swap.message}</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Created: {formatDate(swap.createdAt)}</span>
              </div>
              {swap.scheduledDate && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Scheduled: {formatDate(swap.scheduledDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isSender && swap.status === 'PENDING' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Respond to Request</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleStatusUpdate('ACCEPTED')}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
                >
                  Accept Request
                </button>
                <button
                  onClick={() => handleStatusUpdate('REJECTED')}
                  disabled={updating}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
                >
                  Reject Request
                </button>
              </div>
            </div>
          )}

          {swap.status === 'ACCEPTED' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Swap</h2>
              <p className="text-gray-600 mb-4">
                Once you've completed the skill exchange, mark it as completed.
              </p>
              <button
                onClick={() => handleStatusUpdate('COMPLETED')}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
              >
                Mark as Completed
              </button>
            </div>
          )}

          {(swap.status === 'PENDING' || swap.status === 'ACCEPTED') && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cancel Swap</h2>
              <p className="text-gray-600 mb-4">
                You can cancel this swap request at any time.
              </p>
              <button
                onClick={handleCancelSwap}
                disabled={updating}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
              >
                Cancel Swap
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Other User Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {isSender ? 'Recipient' : 'Sender'}
            </h2>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {otherUser?.firstName?.charAt(0)}{otherUser?.lastName?.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {otherUser?.firstName} {otherUser?.lastName}
                </h3>
                {otherUser?.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {otherUser.location}
                  </div>
                )}
              </div>
            </div>
            {otherUser?.bio && (
              <p className="text-gray-700 text-sm">{otherUser.bio}</p>
            )}
            <Link
              to={`/users/${otherUser?.id}`}
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              View Profile
            </Link>
          </div>

          {/* Swap Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Swap Request Created</p>
                  <p className="text-sm text-gray-600">{formatDate(swap.createdAt)}</p>
                </div>
              </div>
              {swap.status !== 'PENDING' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {swap.status === 'ACCEPTED' ? 'Request Accepted' : 
                       swap.status === 'REJECTED' ? 'Request Rejected' : 
                       swap.status === 'CANCELLED' ? 'Request Cancelled' : 'Request Completed'}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate(swap.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/swaps"
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
              >
                Back to All Swaps
              </Link>
              <Link
                to="/users"
                className="block w-full text-center bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md text-sm"
              >
                Find More Users
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapDetail; 