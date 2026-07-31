/**
 * @file        adminController.ts
 * @owner       IT Team
 * @description System administration and analytics controllers.
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * GET /api/analytics/dashboard
 * Aggregates system-wide statistics for Admin Analytics Dashboard.
 */
export const getDashboardAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      studentCount,
      mentorCount,
      adminCount,
      verifiedCount,
      totalProjects,
      projectsByStatus,
      totalTeams,
      totalMembers,
      topSkillsRaw,
      recentUsers,
      recentProjects,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'mentor' } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.project.count(),
      prisma.project.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.team.count(),
      prisma.teamMember.count(),
      prisma.skill.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          _count: {
            select: { users: true, projects: true },
          },
        },
        orderBy: {
          users: { _count: 'desc' },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true, avatarUrl: true },
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, status: true, createdAt: true, ownerId: true },
      }),
    ]);

    const projectStatusMap: Record<string, number> = {};
    projectsByStatus.forEach((item) => {
      projectStatusMap[item.status] = item._count.id;
    });

    const topSkills = topSkillsRaw.map((s) => ({
      id: s.id,
      name: s.name,
      userCount: s._count.users,
      projectCount: s._count.projects,
    }));

    return res.status(200).json({
      users: {
        total: totalUsers,
        students: studentCount,
        mentors: mentorCount,
        admins: adminCount,
        verified: verifiedCount,
      },
      projects: {
        total: totalProjects,
        byStatus: projectStatusMap,
      },
      teams: {
        totalTeams,
        totalMembers,
      },
      topSkills,
      recentActivity: {
        users: recentUsers,
        projects: recentProjects,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/admin/all
 * Retrieves paginated users for admin management table.
 */
export const getAllUsersAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q = '', role = '', page = '1', limit = '15' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const where: any = {
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role }),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          specialization: true,
          avatarUrl: true,
          xp: true,
          level: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: { skills: true, portfolioItems: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      users: users.map((u) => ({
        ...u,
        skillsCount: u._count.skills,
        portfolioCount: u._count.portfolioItems,
      })),
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/admin/:id/role
 * Updates a user's role (student, mentor, admin).
 */
export const updateUserRoleAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const VALID_ROLES = ['student', 'mentor', 'admin'];
    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be student, mentor, or admin.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(200).json({
      message: `User role updated to ${role}.`,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/admin/:id/verify
 * Toggles or updates user verification status (isVerified).
 */
export const toggleUserVerificationAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { isVerified: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const newStatus = typeof isVerified === 'boolean' ? isVerified : !existingUser.isVerified;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isVerified: newStatus },
      select: { id: true, name: true, email: true, isVerified: true },
    });

    return res.status(200).json({
      message: `User verification status set to ${newStatus}.`,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};
