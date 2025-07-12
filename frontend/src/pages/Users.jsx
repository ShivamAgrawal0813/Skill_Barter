import React, { useEffect, useState } from 'react';
import UserCard from '../components/UserCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { userAPI, skillAPI } from '../services/api';
import { Search, Filter, X } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillType, setSkillType] = useState('OFFERED');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = { publicOnly: 'true' };
        if (filterAvailable) {
          params.available = 'true';
        }
        if (selectedSkill) {
          params.skill = selectedSkill;
          params.skillType = skillType;
        }
        const res = await userAPI.searchUsers(params);
        setUsers(res.data.data.users || []);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [filterAvailable, selectedSkill, skillType]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await skillAPI.getSkills();
        setSkills(res.data.data.skills || []);
      } catch (err) {
        console.error('Failed to load skills:', err);
      }
    };
    fetchSkills();
  }, []);

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const location = user.location?.toLowerCase() || '';
    const skills = user.userSkills?.map(us => us.skill.name.toLowerCase()).join(' ') || '';
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           location.includes(searchTerm.toLowerCase()) ||
           skills.includes(searchTerm.toLowerCase());
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Find Users</h1>
        
        {/* Search and Filter */}
        <div className="space-y-4 mb-6">
          {/* Main Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, location, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filterAvailable}
                  onChange={(e) => setFilterAvailable(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Available only</span>
              </label>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
                <button
                  onClick={() => {
                    setSelectedSkill('');
                    setSkillType('OFFERED');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill
                  </label>
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All skills</option>
                    {skills.map((skill) => (
                      <option key={skill.id} value={skill.name}>
                        {skill.name} ({skill.category})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Type
                  </label>
                  <select
                    value={skillType}
                    onChange={(e) => setSkillType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="OFFERED">Offers this skill</option>
                    <option value="WANTED">Wants to learn this skill</option>
                  </select>
                </div>
              </div>

              {selectedSkill && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Filtering by:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {selectedSkill} ({skillType === 'OFFERED' ? 'offers' : 'wants to learn'})
                  </span>
                  <button
                    onClick={() => setSelectedSkill('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'No users are currently available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Users; 