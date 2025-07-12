const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  location: Joi.string().max(100).optional(),
  bio: Joi.string().max(500).optional(),
  profileVisibility: Joi.string().valid('PUBLIC', 'PRIVATE').optional(),
  isAvailable: Joi.boolean().optional()
});

const addUserSkillSchema = Joi.object({
  skillId: Joi.string().required(),
  skillType: Joi.string().valid('OFFERED', 'WANTED').required(),
  level: Joi.number().min(1).max(5).default(1)
});

const updateAvailabilitySchema = Joi.object({
  availabilityType: Joi.string().valid('WEEKDAYS', 'WEEKENDS', 'EVENINGS', 'MORNINGS', 'FLEXIBLE').required(),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  daysOfWeek: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')).optional()
});

// Helper function to validate request body
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// GET /api/users/profile - Get current user's profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        location: true,
        bio: true,
        profilePhoto: true,
        profileVisibility: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
        userSkills: {
          select: {
            id: true,
            skillType: true,
            level: true,
            skill: {
              select: {
                id: true,
                name: true,
                category: true,
                description: true
              }
            }
          }
        },
        availabilities: {
          select: {
            id: true,
            availabilityType: true,
            startTime: true,
            endTime: true,
            daysOfWeek: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// PUT /api/users/profile - Update current user's profile
router.put('/profile', validateRequest(updateProfileSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        location: true,
        bio: true,
        profilePhoto: true,
        profileVisibility: true,
        isAvailable: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// GET /api/users/search - Search users by skills
router.get('/search', async (req, res) => {
  try {
    const { 
      skill, 
      skillType, 
      location, 
      available, 
      limit = 20, 
      offset = 0 
    } = req.query;

    // Build where clause
    const where = {
      profileVisibility: 'PUBLIC'
    };

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (available === 'true') {
      where.isAvailable = true;
    }

    // Get users with their skills
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        location: true,
        bio: true,
        profilePhoto: true,
        isAvailable: true,
        createdAt: true,
        userSkills: {
          where: skillType ? { skillType } : undefined,
          select: {
            skillType: true,
            level: true,
            skill: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        }
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' }
    });

    // Filter by skill if provided
    let filteredUsers = users;
    if (skill) {
      filteredUsers = users.filter(user => 
        user.userSkills.some(userSkill => 
          userSkill.skill.name.toLowerCase().includes(skill.toLowerCase())
        )
      );
    }

    // Get total count
    const totalCount = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users: filteredUsers,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > parseInt(offset) + filteredUsers.length
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users'
    });
  }
});

// GET /api/users/:id - Get public user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Check if user is viewing their own profile
    const isOwnProfile = id === currentUserId;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        location: true,
        bio: true,
        profilePhoto: true,
        profileVisibility: true,
        isAvailable: true,
        createdAt: true,
        userSkills: {
          select: {
            skillType: true,
            level: true,
            skill: {
              select: {
                id: true,
                name: true,
                category: true,
                description: true
              }
            }
          }
        },
        availabilities: {
          select: {
            availabilityType: true,
            startTime: true,
            endTime: true,
            daysOfWeek: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is private and not own profile
    if (user.profileVisibility === 'PRIVATE' && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// POST /api/users/skills - Add skill to user
router.post('/skills', validateRequest(addUserSkillSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId, skillType, level } = req.body;

    // Check if skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skillId }
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if user already has this skill with this type
    const existingUserSkill = await prisma.userSkill.findFirst({
      where: {
        userId,
        skillId,
        skillType
      }
    });

    if (existingUserSkill) {
      return res.status(400).json({
        success: false,
        message: 'You already have this skill with this type'
      });
    }

    // Add skill to user
    const userSkill = await prisma.userSkill.create({
      data: {
        userId,
        skillId,
        skillType,
        level
      },
      select: {
        id: true,
        skillType: true,
        level: true,
        skill: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: { userSkill }
    });
  } catch (error) {
    console.error('Add user skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding skill'
    });
  }
});

// DELETE /api/users/skills/:id - Remove skill from user
router.delete('/skills/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if user skill exists and belongs to user
    const userSkill = await prisma.userSkill.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!userSkill) {
      return res.status(404).json({
        success: false,
        message: 'User skill not found'
      });
    }

    // Delete user skill
    await prisma.userSkill.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Skill removed successfully'
    });
  } catch (error) {
    console.error('Remove user skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing skill'
    });
  }
});

// POST /api/users/availability - Add availability
router.post('/availability', validateRequest(updateAvailabilitySchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const availabilityData = req.body;

    const availability = await prisma.userAvailability.create({
      data: {
        userId,
        ...availabilityData
      },
      select: {
        id: true,
        availabilityType: true,
        startTime: true,
        endTime: true,
        daysOfWeek: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Availability added successfully',
      data: { availability }
    });
  } catch (error) {
    console.error('Add availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding availability'
    });
  }
});

// DELETE /api/users/availability/:id - Remove availability
router.delete('/availability/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if availability exists and belongs to user
    const availability = await prisma.userAvailability.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability not found'
      });
    }

    // Delete availability
    await prisma.userAvailability.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Availability removed successfully'
    });
  } catch (error) {
    console.error('Remove availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing availability'
    });
  }
});

module.exports = router; 