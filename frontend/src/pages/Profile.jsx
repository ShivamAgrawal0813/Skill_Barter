import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, skillAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  User,
  MapPin,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Camera,
  Upload
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser, fetchUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddAvailability, setShowAddAvailability] = useState(false);
  const [skillModalMode, setSkillModalMode] = useState('select'); // 'select' or 'create'
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    location: '',
    bio: '',
    profileVisibility: 'PUBLIC',
    isAvailable: true
  });

  const [newSkill, setNewSkill] = useState({
    skillId: '',
    skillType: 'OFFERED',
    level: 1
  });

  const [newSkillData, setNewSkillData] = useState({
    name: '',
    description: ''
  });

  const [newAvailability, setNewAvailability] = useState({
    availabilityType: 'FLEXIBLE',
    startTime: '',
    endTime: '',
    daysOfWeek: []
  });

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        location: user.location || '',
        bio: user.bio || '',
        profileVisibility: user.profileVisibility || 'PUBLIC',
        isAvailable: user.isAvailable !== undefined ? user.isAvailable : true
      });
    }
  }, [user]);

  useEffect(() => {
    fetchSkills();
    fetchCategories();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillAPI.getSkills();
      setSkills(response.data.data.skills || []);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await skillAPI.getCategories();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await userAPI.updateProfile(personalInfo);
      updateUser(response.data.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.skillId) {
      toast.error('Please select a skill');
      return;
    }

    setLoading(true);
    try {
      await userAPI.addSkill(newSkill);
      await fetchUserProfile(); // Refresh user data
      setNewSkill({ skillId: '', skillType: 'OFFERED', level: 1 });
      setShowAddSkill(false);
      setSkillModalMode('select');
      toast.success('Skill added successfully!');
    } catch (error) {
      console.error('Failed to add skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!newSkillData.name) {
      toast.error('Please fill in the skill name');
      return;
    }

    setLoading(true);
    try {
      // Add default category for new skills
      const skillDataWithCategory = {
        ...newSkillData,
        category: 'Custom'
      };
      
      const response = await skillAPI.createSkill(skillDataWithCategory);
      const createdSkill = response.data.data.skill;
      
      // Add the newly created skill to the user's profile
      await userAPI.addSkill({
        skillId: createdSkill.id,
        skillType: newSkill.skillType,
        level: newSkill.level
      });
      
      await fetchUserProfile(); // Refresh user data
      await fetchSkills(); // Refresh skills list
      
      // Reset forms
      setNewSkillData({ name: '', description: '' });
      setNewSkill({ skillId: '', skillType: 'OFFERED', level: 1 });
      setShowAddSkill(false);
      setSkillModalMode('select');
      
      toast.success('New skill created and added to your profile!');
    } catch (error) {
      console.error('Failed to create skill:', error);
      toast.error('Failed to create skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;

    setLoading(true);
    try {
      await userAPI.removeSkill(skillId);
      await fetchUserProfile(); // Refresh user data
      toast.success('Skill removed successfully!');
    } catch (error) {
      console.error('Failed to remove skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await userAPI.addAvailability(newAvailability);
      await fetchUserProfile(); // Refresh user data
      setNewAvailability({
        availabilityType: 'FLEXIBLE',
        startTime: '',
        endTime: '',
        daysOfWeek: []
      });
      setShowAddAvailability(false);
      toast.success('Availability added successfully!');
    } catch (error) {
      console.error('Failed to add availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvailability = async (availabilityId) => {
    if (!confirm('Are you sure you want to remove this availability?')) return;

    setLoading(true);
    try {
      await userAPI.removeAvailability(availabilityId);
      await fetchUserProfile(); // Refresh user data
      toast.success('Availability removed successfully!');
    } catch (error) {
      console.error('Failed to remove availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setNewAvailability(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await userAPI.uploadProfilePhoto(formData);
      updateUser(response.data.data.user);
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Failed to upload photo:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;

    setUploadingPhoto(true);
    try {
      const response = await userAPI.removeProfilePhoto();
      updateUser(response.data.data.user);
      toast.success('Profile photo removed successfully!');
    } catch (error) {
      console.error('Failed to remove photo:', error);
      toast.error('Failed to remove profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const offeredSkills = user?.userSkills?.filter(skill => skill.skillType === 'OFFERED') || [];
  const wantedSkills = user?.userSkills?.filter(skill => skill.skillType === 'WANTED') || [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile, skills, and availability</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
            {user?.location && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {user.location}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {user?.profileVisibility === 'PUBLIC' ? (
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
            {user?.isAvailable ? (
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
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'personal', name: 'Personal Info', icon: User },
              { id: 'skills', name: 'Skills', icon: Edit3 },
              { id: 'availability', name: 'Availability', icon: Calendar }
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
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
              {/* Profile Photo Section */}
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-200">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Photo</h3>
                  <div className="flex space-x-3">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                    {user?.profilePhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={uploadingPhoto}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload a square image (max 5MB). JPG, PNG, or GIF formats accepted.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={personalInfo.location}
                  onChange={handlePersonalInfoChange}
                  placeholder="City, Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={personalInfo.bio}
                  onChange={handlePersonalInfoChange}
                  rows={4}
                  placeholder="Tell others about yourself..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    name="profileVisibility"
                    value={personalInfo.profileVisibility}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={personalInfo.isAvailable}
                    onChange={handlePersonalInfoChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Available for swaps
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Offered Skills */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Skills You Offer</h3>
                  <button
                    onClick={() => {
                      setShowAddSkill(true);
                      setSkillModalMode('select');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {offeredSkills.map((userSkill) => (
                    <div
                      key={userSkill.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-blue-900">{userSkill.skill.name}</p>
                        <p className="text-sm text-blue-700">Level {userSkill.level}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(userSkill.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {offeredSkills.length === 0 && (
                    <p className="text-gray-500 text-sm">No skills offered yet</p>
                  )}
                </div>
              </div>

              {/* Wanted Skills */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Skills You Want to Learn</h3>
                  <button
                    onClick={() => {
                      setNewSkill({ skillId: '', skillType: 'WANTED', level: 1 });
                      setShowAddSkill(true);
                      setSkillModalMode('select');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {wantedSkills.map((userSkill) => (
                    <div
                      key={userSkill.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-green-900">{userSkill.skill.name}</p>
                        <p className="text-sm text-green-700">Level {userSkill.level}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(userSkill.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {wantedSkills.length === 0 && (
                    <p className="text-gray-500 text-sm">No skills wanted yet</p>
                  )}
                </div>
              </div>

              {/* Add Skill Modal */}
              {showAddSkill && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Add Skill</h3>
                      <button
                        onClick={() => {
                          setShowAddSkill(false);
                          setSkillModalMode('select');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setSkillModalMode('select')}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                          skillModalMode === 'select'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Select Existing
                      </button>
                      <button
                        type="button"
                        onClick={() => setSkillModalMode('create')}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                          skillModalMode === 'create'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Create New
                      </button>
                    </div>

                    {/* Select Existing Skill Form */}
                    {skillModalMode === 'select' && (
                      <form onSubmit={handleAddSkill} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skill
                          </label>
                          <select
                            value={newSkill.skillId}
                            onChange={(e) => setNewSkill(prev => ({ ...prev, skillId: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select a skill</option>
                            {skills.map((skill) => (
                              <option key={skill.id} value={skill.id}>
                                {skill.name} ({skill.category})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                          </label>
                          <select
                            value={newSkill.skillType}
                            onChange={(e) => setNewSkill(prev => ({ ...prev, skillType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="OFFERED">I can offer this</option>
                            <option value="WANTED">I want to learn this</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Level (1-5)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={newSkill.level}
                            onChange={(e) => setNewSkill(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowAddSkill(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading ? 'Adding...' : 'Add Skill'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Create New Skill Form */}
                    {skillModalMode === 'create' && (
                      <form onSubmit={handleCreateSkill} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skill Name *
                          </label>
                          <input
                            type="text"
                            value={newSkillData.name}
                            onChange={(e) => setNewSkillData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Advanced JavaScript"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={newSkillData.description}
                            onChange={(e) => setNewSkillData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Brief description of the skill..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                          </label>
                          <select
                            value={newSkill.skillType}
                            onChange={(e) => setNewSkill(prev => ({ ...prev, skillType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="OFFERED">I can offer this</option>
                            <option value="WANTED">I want to learn this</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Level (1-5)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={newSkill.level}
                            onChange={(e) => setNewSkill(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowAddSkill(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading ? 'Creating...' : 'Create & Add Skill'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Your Availability</h3>
                <button
                  onClick={() => setShowAddAvailability(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Availability</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.availabilities?.map((availability) => (
                  <div
                    key={availability.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
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
                    <button
                      onClick={() => handleRemoveAvailability(availability.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!user?.availabilities || user.availabilities.length === 0) && (
                  <p className="text-gray-500 text-sm">No availability set yet</p>
                )}
              </div>

              {/* Add Availability Modal */}
              {showAddAvailability && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Add Availability</h3>
                      <button
                        onClick={() => setShowAddAvailability(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <form onSubmit={handleAddAvailability} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Availability Type
                        </label>
                        <select
                          value={newAvailability.availabilityType}
                          onChange={(e) => setNewAvailability(prev => ({ ...prev, availabilityType: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="FLEXIBLE">Flexible</option>
                          <option value="WEEKDAYS">Weekdays</option>
                          <option value="WEEKENDS">Weekends</option>
                          <option value="EVENINGS">Evenings</option>
                          <option value="MORNINGS">Mornings</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={newAvailability.startTime}
                            onChange={(e) => setNewAvailability(prev => ({ ...prev, startTime: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={newAvailability.endTime}
                            onChange={(e) => setNewAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Days of Week
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {daysOfWeek.map((day) => (
                            <label key={day} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newAvailability.daysOfWeek.includes(day)}
                                onChange={() => handleDayToggle(day)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 capitalize">
                                {day.slice(0, 3)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddAvailability(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? 'Adding...' : 'Add Availability'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 