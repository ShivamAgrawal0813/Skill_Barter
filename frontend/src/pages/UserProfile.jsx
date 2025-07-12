import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import SwapRequestModal from '../components/SwapRequestModal';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  MessageSquare,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUser(id);
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast.error('Failed to load user profile');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUser?.id === user?.id;
  const offeredSkills = user?.userSkills?.filter(skill => skill.skillType === 'OFFERED') || [];
  const wantedSkills = user?.userSkills?.filter(skill => skill.skillType === 'WANTED') || [];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-600 mb-4">The user profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/users')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/users')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
            <p className="text-gray-600 mt-1">View user's skills and information</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <div className="flex items-center space-x-2">
                    {user.profileVisibility === 'PUBLIC' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Eye className="w-3 h-3 mr-1" />
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Private
                      </span>
                    )}
                    {user.isAvailable ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
                
                {user.location && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    {user.location}
                  </div>
                )}
                
                {user.bio && (
                  <p className="text-gray-700 mb-4">{user.bio}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Skills</h3>
            
            {/* Offered Skills */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-blue-600" />
                Skills Offered ({offeredSkills.length})
              </h4>
              {offeredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {offeredSkills.map((userSkill) => (
                    <div
                      key={userSkill.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-blue-900">{userSkill.skill.name}</p>
                        <p className="text-sm text-blue-700">Level {userSkill.level}</p>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {userSkill.skill.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No skills offered yet</p>
              )}
            </div>

            {/* Wanted Skills */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                Skills Wanted ({wantedSkills.length})
              </h4>
              {wantedSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {wantedSkills.map((userSkill) => (
                    <div
                      key={userSkill.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-green-900">{userSkill.skill.name}</p>
                        <p className="text-sm text-green-700">Level {userSkill.level}</p>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        {userSkill.skill.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No skills wanted yet</p>
              )}
            </div>
          </div>

          {/* Availability Section */}
          {user.availabilities && user.availabilities.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-600" />
                Availability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.availabilities.map((availability) => (
                  <div
                    key={availability.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {availability.availabilityType.toLowerCase().replace('_', ' ')}
                      </p>
                      {availability.startTime && availability.endTime && (
                        <p className="text-sm text-gray-600">
                          {availability.startTime} - {availability.endTime}
                        </p>
                      )}
                      {availability.daysOfWeek?.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {availability.daysOfWeek.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          {!isOwnProfile && user.isAvailable && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Swap</h3>
              <p className="text-gray-600 mb-4">
                Interested in swapping skills with {user.firstName}? Send them a request!
              </p>
              <button
                onClick={() => setShowSwapModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Request Swap</span>
              </button>
            </div>
          )}

          {isOwnProfile && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
              <p className="text-gray-600 mb-4">
                This is your own profile. You can edit it from your profile settings.
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Edit Profile
              </button>
            </div>
          )}

          {!user.isAvailable && !isOwnProfile && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Unavailable</h3>
              <p className="text-gray-600">
                {user.firstName} is currently not available for swaps.
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Skills Offered:</span>
                <span className="font-medium">{offeredSkills.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skills Wanted:</span>
                <span className="font-medium">{wantedSkills.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Availability:</span>
                <span className="font-medium">{user.availabilities?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/users')}
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
              >
                Back to Users
              </button>
              <button
                onClick={() => navigate('/swaps')}
                className="block w-full text-center bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md text-sm"
              >
                View My Swaps
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Request Modal */}
      {showSwapModal && (
        <SwapRequestModal
          user={user}
          onClose={() => setShowSwapModal(false)}
        />
      )}
    </div>
  );
};

export default UserProfile; 