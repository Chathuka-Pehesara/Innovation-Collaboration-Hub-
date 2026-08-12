import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Helper to log team activity
async function logActivity(teamId: string, action: string, userId: string) {
  await prisma.activity.create({
    data: { teamId, action, userId }
  });
}

// Create a new team linked to a project
export const createTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    // Check if team already exists
    const existingTeam = await prisma.team.findUnique({ where: { projectId } });
    if (existingTeam) {
        res.status(400).json({ error: 'Team already exists for this project' });
        return;
    }

    const team = await prisma.team.create({
      data: { projectId }
    });

    // Make the creator the LEAD
    await prisma.teamMember.create({
      data: { teamId: team.id, userId, role: 'LEAD' }
    });

    await logActivity(team.id, 'Team Created', userId);

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

// Get team details, members, invites, and activity
export const getTeamDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        members: true,
        invites: true,
        tasks: true,
        resources: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        project: true
      }
    });
    if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
    }
    res.json(team);
  } catch (error) {
    next(error);
  }
};

// Send an invite to a user
export const sendInvite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const actorId = req.user?.userId;
    if (!actorId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }
    
    const invite = await prisma.teamInvite.create({
      data: {
        teamId: req.params.id,
        userId,
        type: 'INVITE',
        status: 'PENDING'
      }
    });

    await logActivity(req.params.id, `Invited ${userId} to join the team`, actorId);
    res.status(201).json(invite);
  } catch (error: any) {
    if (error.code === 'P2002') {
        res.status(400).json({ error: 'Invite already exists' });
        return;
    }
    next(error);
  }
};

export const applyToTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const actorId = req.user?.userId;
    if (!actorId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }
    
    const existing = await prisma.teamInvite.findUnique({
      where: {
        teamId_userId: { teamId: req.params.id, userId: actorId }
      }
    });

    if (existing) {
      if (existing.status === 'PENDING') {
        res.status(400).json({ error: 'Application already exists' });
        return;
      } else if (existing.status === 'ACCEPTED') {
        res.status(400).json({ error: 'You are already a member' });
        return;
      } else if (existing.status === 'DECLINED') {
        const updated = await prisma.teamInvite.update({
          where: { id: existing.id },
          data: { status: 'PENDING', type: 'APPLICATION' }
        });
        await logActivity(req.params.id, `${actorId} requested to join the team again`, actorId);
        res.status(200).json(updated);
        return;
      }
    }

    const application = await prisma.teamInvite.create({
      data: {
        teamId: req.params.id,
        userId: actorId,
        type: 'APPLICATION',
        status: 'PENDING'
      }
    });

    await logActivity(req.params.id, `${actorId} requested to join the team`, actorId);
    res.status(201).json(application);
  } catch (error: any) {
    if (error.code === 'P2002') {
        res.status(400).json({ error: 'Application already exists' });
        return;
    }
    next(error);
  }
};

// Accept or decline an invite
export const respondToInvite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body; // ACCEPTED or DECLINED
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }
    const inviteId = req.params.inviteId;

    const invite = await prisma.teamInvite.update({
      where: { id: inviteId },
      data: { status }
    });

    if (status === 'ACCEPTED') {
      await prisma.teamMember.create({
        data: { teamId: invite.teamId, userId: invite.userId, role: 'MEMBER' }
      });
      await logActivity(invite.teamId, `User ${invite.userId} joined the team`, invite.userId);
    } else {
      await logActivity(invite.teamId, `User ${invite.userId} declined the invite`, invite.userId);
    }

    res.json(invite);
  } catch (error) {
    next(error);
  }
};

// Manage Kanban Tasks
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, assigneeId } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const task = await prisma.task.create({
      data: { teamId: req.params.id, title, description, assigneeId }
    });

    await logActivity(req.params.id, `Created task: ${title}`, userId);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, assigneeId, title, description } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data: { status, assigneeId, title, description }
    });

    await logActivity(task.teamId, `Updated task: ${task.title}`, userId);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }
    const task = await prisma.task.delete({
      where: { id: req.params.taskId }
    });
    
    await logActivity(task.teamId, `Deleted task: ${task.title}`, userId);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// Upload resource (Local storage placeholder)
export const uploadResource = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!(req as any).file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }
    // req.file path is provided by multer middleware
    const fileUrl = `/uploads/${(req as any).file.filename}`;

    const resource = await prisma.resource.create({
      data: {
        teamId: req.params.id,
        fileName: (req as any).file.originalname,
        fileUrl,
        uploadedBy: userId
      }
    });

    await logActivity(req.params.id, `Uploaded resource: ${(req as any).file.originalname}`, userId);
    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
};

// Get Team by Project ID (convenience helper)
export const getTeamByProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const team = await prisma.team.findUnique({
      where: { projectId: req.params.projectId },
      include: {
        members: true,
        invites: true,
        tasks: true,
        resources: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 50 },
        project: true
      }
    });
    // Don't error out, just return null if no team yet
    res.json(team);
  } catch (error) {
    next(error);
  }
};

// Manage Team Members (Lead only)
export const updateMemberRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const actorId = req.user?.userId;
    if (!actorId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const member = await prisma.teamMember.update({
      where: { 
        teamId_userId: { teamId: req.params.id, userId: req.params.userId } 
      },
      data: { role }
    });

    await logActivity(req.params.id, `Updated ${req.params.userId}'s role to ${role}`, actorId);
    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const actorId = req.user?.userId;
    if (!actorId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    await prisma.teamMember.delete({
      where: { 
        teamId_userId: { teamId: req.params.id, userId: req.params.userId } 
      }
    });

    // Also delete any existing team invite/application so they can apply again later
    await prisma.teamInvite.deleteMany({
      where: { teamId: req.params.id, userId: req.params.userId }
    });

    await logActivity(req.params.id, `Removed ${req.params.userId} from the team`, actorId);
    res.json({ message: 'Member removed' });
  } catch (error) {
    next(error);
  }
};
