import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  BookOpen,
  MessageSquare,
  Star,
  Plus,
  ArrowRight,
  Calendar,
  MapPin,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Skills Offered',
      value: user?.userSkills?.filter(s => s.skillType === 'OFFERED').length || 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Skills Wanted',
      value: user?.userSkills?.filter(s => s.skillType === 'WANTED').length || 0,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Active Swaps',
      value: 0, // This would come from API
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Average Rating',
      value: '4.5', // This would come from API
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const quickActions = [
    {
      name: 'Add Skills',
      description: 'Add skills you can offer or want to learn',
      icon: Plus,
      href: '/profile',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Find Users',
      description: 'Discover people to swap skills with',
      icon: Users,
      href: '/users',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'View Swaps',
      description: 'Check your current and past swaps',
      icon: MessageSquare,
      href: '/swaps',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Browse Skills',
      description: 'Explore available skills on the platform',
      icon: BookOpen,
      href: '/skills',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="w-full">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-primary-100">
          Ready to learn something new or share your expertise?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Get started with these common tasks
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className={`p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors ${action.bgColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${action.bgColor}`}>
                        <Icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{action.name}</p>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm">Start by adding skills or finding users to swap with</p>
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Profile Summary</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-gray-600">{user?.email}</p>
              {user?.location && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user.location}
                </div>
              )}
            </div>
            <Link
              to="/profile"
              className="btn-outline"
            >
              Edit Profile
            </Link>
          </div>
          
          {user?.bio && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{user.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 