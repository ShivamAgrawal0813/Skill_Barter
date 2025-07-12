import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SwapRequestModal from './SwapRequestModal';

const UserCard = ({ user }) => {
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Don't show request button for own profile
  const isOwnProfile = currentUser?.id === user.id;

  // Get offered skills
  const offeredSkills = user.userSkills?.filter(skill => skill.skillType === 'OFFERED') || [];
  const wantedSkills = user.userSkills?.filter(skill => skill.skillType === 'WANTED') || [];

  const handleRequestClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start space-x-4">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </h3>
              <div className="flex items-center space-x-2">
                {user.isAvailable ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Unavailable
                  </span>
                )}
              </div>
            </div>

            {user.location && (
              <p className="text-sm text-gray-600 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {user.location}
              </p>
            )}

            {user.bio && (
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {user.bio}
              </p>
            )}

            {/* Skills */}
            <div className="space-y-2">
              {offeredSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Offers
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {offeredSkills.slice(0, 3).map((userSkill) => (
                      <span
                        key={userSkill.skill.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {userSkill.skill.name}
                        {userSkill.level > 1 && (
                          <span className="ml-1 text-blue-600">•{userSkill.level}</span>
                        )}
                      </span>
                    ))}
                    {offeredSkills.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{offeredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {wantedSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Wants
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {wantedSkills.slice(0, 3).map((userSkill) => (
                      <span
                        key={userSkill.skill.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                      >
                        {userSkill.skill.name}
                        {userSkill.level > 1 && (
                          <span className="ml-1 text-orange-600">•{userSkill.level}</span>
                        )}
                      </span>
                    ))}
                    {wantedSkills.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{wantedSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Request Button */}
            {!isOwnProfile && user.isAvailable && (
              <button
                onClick={handleRequestClick}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Request Swap</span>
              </button>
            )}

            {isOwnProfile && (
              <div className="mt-4 text-center text-sm text-gray-500">
                This is your profile
              </div>
            )}

            {!user.isAvailable && !isOwnProfile && (
              <div className="mt-4 text-center text-sm text-gray-500">
                User is currently unavailable
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swap Request Modal */}
      {showModal && (
        <SwapRequestModal
          user={user}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default UserCard; 