const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const searchSkillsSchema = Joi.object({
  query: Joi.string().min(1).max(100).required(),
  category: Joi.string().optional()
});

const createSkillSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  category: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).optional()
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

// GET /api/skills - Get all skills with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;

    // Build where clause
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get skills
    const skills = await prisma.skill.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        isCustom: true,
        createdAt: true,
        _count: {
          select: {
            userSkills: true
          }
        }
      },
      orderBy: [
        { isCustom: 'asc' }, // Predefined skills first
        { name: 'asc' }
      ],
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count for pagination
    const totalCount = await prisma.skill.count({ where });

    // Get unique categories
    const categories = await prisma.skill.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    res.json({
      success: true,
      data: {
        skills,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > parseInt(offset) + skills.length
        },
        categories: categories.map(c => c.category)
      }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skills'
    });
  }
});

// GET /api/skills/search - Search skills
router.get('/search', validateRequest(searchSkillsSchema), async (req, res) => {
  try {
    const { query, category } = req.body;

    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (category) {
      where.category = category;
    }

    const skills = await prisma.skill.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        isCustom: true,
        _count: {
          select: {
            userSkills: true
          }
        }
      },
      orderBy: [
        { isCustom: 'asc' },
        { name: 'asc' }
      ],
      take: 20
    });

    res.json({
      success: true,
      data: { skills }
    });
  } catch (error) {
    console.error('Search skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching skills'
    });
  }
});

// GET /api/skills/categories - Get all skill categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.skill.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    res.json({
      success: true,
      data: {
        categories: categories.map(c => c.category)
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// GET /api/skills/:id - Get specific skill
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await prisma.skill.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        isCustom: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            userSkills: true
          }
        }
      }
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: { skill }
    });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skill'
    });
  }
});

// POST /api/skills - Create custom skill (requires authentication)
router.post('/', validateRequest(createSkillSchema), async (req, res) => {
  try {
    const { name, category, description } = req.body;

    // Check if skill already exists
    const existingSkill = await prisma.skill.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' }
      }
    });

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'A skill with this name already exists'
      });
    }

    // Create custom skill
    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        description,
        isCustom: true
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        isCustom: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Custom skill created successfully',
      data: { skill }
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating skill'
    });
  }
});

// GET /api/skills/popular - Get most popular skills
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularSkills = await prisma.skill.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        isCustom: true,
        _count: {
          select: {
            userSkills: true
          }
        }
      },
      orderBy: {
        userSkills: {
          _count: 'desc'
        }
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: { skills: popularSkills }
    });
  } catch (error) {
    console.error('Get popular skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular skills'
    });
  }
});

module.exports = router; 