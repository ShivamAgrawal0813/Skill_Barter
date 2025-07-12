const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createSwapRequestSchema = Joi.object({
  receiverId: Joi.string().required(),
  offeredSkillId: Joi.string().required(),
  requestedSkillId: Joi.string().required(),
  message: Joi.string().max(500).optional(),
  scheduledDate: Joi.string().optional()
});

const updateSwapStatusSchema = Joi.object({
  status: Joi.string().valid('ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED').required(),
  scheduledDate: Joi.string().optional(),
  cancelReason: Joi.string().max(500).optional()
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

// Helper function to send real-time notification
const sendNotification = (req, userId, message, data = {}) => {
  const io = req.app.get('io');
  if (io) {
    io.to(`user-${userId}`).emit('notification', {
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
};

// POST /api/swaps - Create swap request
router.post('/', validateRequest(createSwapRequestSchema), async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, offeredSkillId, requestedSkillId, message, scheduledDate } = req.body;

    // Prevent self-swap
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a swap request to yourself'
      });
    }

    // Check if receiver exists and is available
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, isAvailable: true, profileVisibility: true }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    if (!receiver.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This user is not available for swaps'
      });
    }

    if (receiver.profileVisibility === 'PRIVATE') {
      return res.status(403).json({
        success: false,
        message: 'Cannot send request to private profile'
      });
    }

    // Check if sender has the offered skill
    const senderOfferedSkill = await prisma.userSkill.findFirst({
      where: {
        userId: senderId,
        skillId: offeredSkillId,
        skillType: 'OFFERED'
      }
    });

    if (!senderOfferedSkill) {
      return res.status(400).json({
        success: false,
        message: 'You do not have this skill to offer'
      });
    }

    // Check if receiver has the requested skill
    const receiverOfferedSkill = await prisma.userSkill.findFirst({
      where: {
        userId: receiverId,
        skillId: requestedSkillId,
        skillType: 'OFFERED'
      }
    });

    if (!receiverOfferedSkill) {
      return res.status(400).json({
        success: false,
        message: 'Receiver does not offer this skill'
      });
    }

    // Check if there's already a pending request between these users
    const existingRequest = await prisma.swapRequest.findFirst({
      where: {
        OR: [
          {
            senderId,
            receiverId,
            status: 'PENDING'
          },
          {
            senderId: receiverId,
            receiverId: senderId,
            status: 'PENDING'
          }
        ]
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'There is already a pending swap request between you and this user'
      });
    }

    // Create swap request
    const swapRequest = await prisma.swapRequest.create({
      data: {
        senderId,
        receiverId,
        offeredSkillId,
        requestedSkillId,
        message,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true
          }
        },
        offeredSkill: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        requestedSkill: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    });

    // Send real-time notification to receiver
    sendNotification(req, receiverId, 'New swap request received', {
      type: 'NEW_SWAP_REQUEST',
      swapRequest: {
        id: swapRequest.id,
        sender: swapRequest.sender,
        offeredSkill: swapRequest.offeredSkill,
        requestedSkill: swapRequest.requestedSkill,
        message: swapRequest.message
      }
    });

    res.status(201).json({
      success: true,
      message: 'Swap request sent successfully',
      data: { swapRequest }
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating swap request'
    });
  }
});

// GET /api/swaps - Get user's swap requests
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type = 'all', limit = 20, offset = 0 } = req.query;

    // Build where clause
    let where = {};
    
    if (type === 'sent') {
      where.senderId = userId;
    } else if (type === 'received') {
      where.receiverId = userId;
    } else {
      where.OR = [
        { senderId: userId },
        { receiverId: userId }
      ];
    }

    if (status) {
      where.status = status;
    }

    const swapRequests = await prisma.swapRequest.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true,
            profilePhoto: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true,
            profilePhoto: true
          }
        },
        offeredSkill: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        requestedSkill: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count
    const totalCount = await prisma.swapRequest.count({ where });

    res.json({
      success: true,
      data: {
        swapRequests,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > parseInt(offset) + swapRequests.length
        }
      }
    });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap requests'
    });
  }
});

// GET /api/swaps/:id - Get specific swap request
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const swapRequest = await prisma.swapRequest.findFirst({
      where: {
        id,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true,
            profilePhoto: true,
            bio: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true,
            profilePhoto: true,
            bio: true
          }
        },
        offeredSkill: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        },
        requestedSkill: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        },
        feedback: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            giver: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    res.json({
      success: true,
      data: { swapRequest }
    });
  } catch (error) {
    console.error('Get swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap request'
    });
  }
});

// PUT /api/swaps/:id/status - Update swap request status
router.put('/:id/status', validateRequest(updateSwapStatusSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, scheduledDate, cancelReason } = req.body;

    // Find swap request
    const swapRequest = await prisma.swapRequest.findFirst({
      where: {
        id,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true,
            profilePhoto: true,
            bio: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true,
            profilePhoto: true,
            bio: true
          }
        },
        offeredSkill: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        },
        requestedSkill: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        },
        feedback: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            giver: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check permissions
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      if (swapRequest.receiverId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the receiver can accept or reject a swap request'
        });
      }
    } else if (status === 'CANCELLED') {
      if (swapRequest.senderId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the sender can cancel a swap request'
        });
      }
    } else if (status === 'COMPLETED') {
      if (swapRequest.senderId !== userId && swapRequest.receiverId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only participants can mark a swap as completed'
        });
      }
    }

    // Validate scheduled date for accepted swaps
    if (status === 'ACCEPTED' && scheduledDate) {
      const scheduledDateTime = new Date(scheduledDate);
      const now = new Date();
      
      if (scheduledDateTime <= now) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled date must be in the future'
        });
      }
    }

    // Update swap request
    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'ACCEPTED' && scheduledDate) {
      updateData.scheduledDate = new Date(scheduledDate);
    }

    const updatedSwapRequest = await prisma.swapRequest.update({
      where: { id },
      data: updateData,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true,
            profilePhoto: true,
            bio: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true,
            profilePhoto: true,
            bio: true
          }
        },
        offeredSkill: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        },
        requestedSkill: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        },
        feedback: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            giver: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Send notifications
    if (status === 'ACCEPTED') {
      sendNotification(req, swapRequest.senderId, 'Your swap request was accepted!', {
        type: 'SWAP_ACCEPTED',
        swapRequest: updatedSwapRequest
      });
    } else if (status === 'REJECTED') {
      sendNotification(req, swapRequest.senderId, 'Your swap request was rejected', {
        type: 'SWAP_REJECTED',
        swapRequest: updatedSwapRequest
      });
    } else if (status === 'CANCELLED') {
      sendNotification(req, swapRequest.receiverId, 'A swap request was cancelled', {
        type: 'SWAP_CANCELLED',
        swapRequest: updatedSwapRequest
      });
    } else if (status === 'COMPLETED') {
      const otherUserId = swapRequest.senderId === userId ? swapRequest.receiverId : swapRequest.senderId;
      sendNotification(req, otherUserId, 'A swap has been marked as completed', {
        type: 'SWAP_COMPLETED',
        swapRequest: updatedSwapRequest
      });
    }

    res.json({
      success: true,
      message: `Swap request ${status.toLowerCase()} successfully`,
      data: { swapRequest: updatedSwapRequest }
    });
  } catch (error) {
    console.error('Update swap status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating swap request status'
    });
  }
});

// DELETE /api/swaps/:id - Cancel swap request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const swapRequest = await prisma.swapRequest.findFirst({
      where: {
        id,
        senderId: userId,
        status: 'PENDING'
      }
    });

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found or cannot be cancelled'
      });
    }

    await prisma.swapRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    // Send notification to receiver
    sendNotification(req, swapRequest.receiverId, 'A swap request was cancelled', {
      type: 'SWAP_CANCELLED',
      swapRequestId: id
    });

    res.json({
      success: true,
      message: 'Swap request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling swap request'
    });
  }
});

// DELETE /api/swaps/:id/delete - Permanently delete swap request
router.delete('/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const swapRequest = await prisma.swapRequest.findFirst({
      where: {
        id,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        status: {
          in: ['COMPLETED', 'CANCELLED', 'REJECTED']
        }
      }
    });

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found or cannot be deleted'
      });
    }

    // Permanently delete the swap request
    await prisma.swapRequest.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Swap request deleted successfully'
    });
  } catch (error) {
    console.error('Delete swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting swap request'
    });
  }
});

module.exports = router; 