import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const { title, description, categoryId, teamSize } = req.body;
    const parsedTeamSize = parseInt(teamSize);
    const project = await prisma.project.create({
      data: {
        title,
        description,
        categoryId: categoryId || null,
        ownerId: user.id,
        teamSize: !isNaN(parsedTeamSize) ? parsedTeamSize : 1
      }
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, tag, status, search, page = '1', limit = '10' } = req.query;
    
    let whereClause: any = {};
    if (category) whereClause.categoryId = category;
    if (status) whereClause.status = status;
    if (search) {
      whereClause.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }
    if (tag) {
      whereClause.tags = {
        some: {
          tag: { name: tag as string }
        }
      };
    }

    const parsedPage = parseInt(page as string);
    const parsedLimit = parseInt(limit as string);
    const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit;
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          category: true,
          tags: { include: { tag: true } },
          skills: { include: { skill: true } }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count({ where: whereClause })
    ]);

    res.json({
      data: projects,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        tags: { include: { tag: true } },
        skills: { include: { skill: true } },
        aiResult: true
      }
    });
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id;
    const existingProject = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const { title, description, categoryId, teamSize } = req.body;
    const parsedTeamSize = teamSize ? parseInt(teamSize) : undefined;
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { 
        title, 
        description, 
        categoryId: categoryId === undefined ? undefined : (categoryId || null),
        teamSize: parsedTeamSize !== undefined && !isNaN(parsedTeamSize) ? parsedTeamSize : undefined
      }
    });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id;
    const existingProject = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.project.delete({
      where: { id: projectId }
    });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const addTagsToProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags } = req.body; 
    if (!tags || !Array.isArray(tags)) {
      res.status(400).json({ error: 'Tags array required' });
      return;
    }

    const projectId = req.params.id;
    
    // Ensure the project exists before adding tags
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    for (const tagName of tags) {
      let tag = await prisma.tag.findUnique({ where: { name: tagName } });
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName } });
      }
      
      await prisma.projectTag.upsert({
        where: {
          projectId_tagId: { projectId, tagId: tag.id }
        },
        create: { projectId, tagId: tag.id },
        update: {}
      });
    }

    res.json({ message: 'Tags added successfully' });
  } catch (error) {
    next(error);
  }
};

export const addSkillsToProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skills } = req.body; 
    if (!skills || !Array.isArray(skills)) {
      res.status(400).json({ error: 'Skills array required' });
      return;
    }

    const projectId = req.params.id;
    
    // Ensure the project exists before adding skills
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    for (const skillName of skills) {
      let skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (!skill) {
        skill = await prisma.skill.create({ data: { name: skillName } });
      }
      
      await prisma.projectSkill.upsert({
        where: {
          projectId_skillId: { projectId, skillId: skill.id }
        },
        create: { projectId, skillId: skill.id },
        update: {}
      });
    }

    res.json({ message: 'Skills added successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateProjectStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id;
    const existingProject = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const { status } = req.body;
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status }
    });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const receiveAIResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { score, suggestions } = req.body;
    const projectId = req.params.id;

    const result = await prisma.aIResult.upsert({
      where: { projectId },
      update: { score, suggestions: JSON.stringify(suggestions) },
      create: { projectId, score, suggestions: JSON.stringify(suggestions) }
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};
