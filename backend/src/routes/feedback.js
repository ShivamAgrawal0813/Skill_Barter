const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createFeedbackSchema = Joi.object({
  swapRequestId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).optional()
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

// POST /api/feedback - Create feedback for a completed swap
router.post('/', validateRequest(createFeedbackSchema), async (req, res) => {
  try {
    const giverId = req.user.id;
    const { swapRequestId, rating, comment } = req.body;

    // Check if swap request exists and is completed
    const swapRequest = await prisma.swapRequest.findFirst({
      where: {
        id: swapRequestId,
        status: 'COMPLETED',
        OR: [
          { senderId: giverId },
          { receiverId: giverId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found or not completed'
      });
    }

    // Determine the receiver (the person being rated)
    const receiverId = swapRequest.senderId === giverId ? swapRequest.receiverId : swapRequest.senderId;

    // Check if feedback already exists from this user for this swap
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        swapRequestId,
        giverId
      }
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already provided feedback for this swap'
      });
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        swapRequestId,
        giverId,
        receiverId,
        rating,
        comment
      },
      include: {
        giver: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        swapRequest: {
          select: {
            id: true,
            offeredSkill: {
              select: {
                name: true,
                category: true
              }
            },
            requestedSkill: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedback }
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating feedback'
    });
  }
});

// GET /api/feedback/user/:userId - Get feedback for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, profileVisibility: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is private and not own profile
    const currentUserId = req.user.id;
    if (user.profileVisibility === 'PRIVATE' && userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    // Get feedback received by the user
    const feedback = await prisma.feedback.findMany({
      where: { receiverId: userId },
      include: {
        giver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true
          }
        },
        swapRequest: {
          select: {
            offeredSkill: {
              select: {
                name: true,
                category: true
              }
            },
            requestedSkill: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count
    const totalCount = await prisma.feedback.count({
      where: { receiverId: userId }
    });

    // Calculate average rating
    const averageRating = await prisma.feedback.aggregate({
      where: { receiverId: userId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > parseInt(offset) + feedback.length
        },
        stats: {
          averageRating: averageRating._avg.rating || 0,
          totalReviews: averageRating._count.rating || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user feedback'
    });
  }
});

// GET /api/feedback/swap/:swapRequestId - Get feedback for a specific swap
router.get('/swap/:swapRequestId', async (req, res) => {
  try {
    const { swapRequestId } = req.params;
    const userId = req.user.id;

    // Check if user is part of this swap
    const swapRequest = await prisma.swapRequest.findFirst({
      where: {
        id: swapRequestId,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Get feedback for this swap
    const feedback = await prisma.feedback.findMany({
      where: { swapRequestId },
      include: {
        giver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { feedback }
    });
  } catch (error) {
    console.error('Get swap feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap feedback'
    });
  }
});

// GET /api/feedback/my - Get current user's feedback history
router.get('/my', async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'all', limit = 10, offset = 0 } = req.query;

    // Build where clause
    let where = {};
    
    if (type === 'given') {
      where.giverId = userId;
    } else if (type === 'received') {
      where.receiverId = userId;
    } else {
      where.OR = [
        { giverId: userId },
        { receiverId: userId }
      ];
    }

    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        giver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true
          }
        },
        swapRequest: {
          select: {
            id: true,
            offeredSkill: {
              select: {
                name: true,
                category: true
              }
            },
            requestedSkill: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count
    const totalCount = await prisma.feedback.count({ where });

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > parseInt(offset) + feedback.length
        }
      }
    });
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback history'
    });
  }
});

// PUT /api/feedback/:id - Update feedback (only within 24 hours)
router.put('/:id', validateRequest(createFeedbackSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Find feedback
    const feedback = await prisma.feedback.findFirst({
      where: {
        id,
        giverId: userId
      }
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if feedback is within 24 hours
    const hoursSinceCreation = (new Date() - feedback.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be updated within 24 hours of creation'
      });
    }

    // Update feedback
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        rating,
        comment
      },
      include: {
        giver: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: { feedback: updatedFeedback }
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback'
    });
  }
});

// DELETE /api/feedback/:id - Delete feedback (only within 24 hours)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find feedback
    const feedback = await prisma.feedback.findFirst({
      where: {
        id,
        giverId: userId
      }
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if feedback is within 24 hours
    const hoursSinceCreation = (new Date() - feedback.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be deleted within 24 hours of creation'
      });
    }

    // Delete feedback
    await prisma.feedback.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback'
    });
  }
});

module.exports = router; 