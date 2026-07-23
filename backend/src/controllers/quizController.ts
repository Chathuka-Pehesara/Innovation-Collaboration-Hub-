import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock question bank for testing the flow
const MOCK_QUESTIONS: Record<string, any[]> = {
  default: [
    { question: "What is a key benefit of this skill?", options: ["Speed", "Cost", "Security", "All of the above"], answer: 3 },
    { question: "Which tool is most commonly associated with this?", options: ["Hammer", "IDE", "Browser", "None"], answer: 1 },
    { question: "Is this skill used in frontend or backend?", options: ["Frontend", "Backend", "Both", "Neither"], answer: 2 },
    { question: "What is the primary language used?", options: ["Python", "JavaScript", "C++", "Varies"], answer: 3 },
    { question: "How do you define a variable?", options: ["var", "let", "const", "Depends on language"], answer: 3 }
  ]
};

export const generateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skillName } = req.body;
    if (!skillName) {
      res.status(400).json({ error: 'skillName is required' });
      return;
    }
    
    // For Phase 1 MVP, we return mock questions to ensure the gamification loop works.
    const questions = MOCK_QUESTIONS[skillName.toLowerCase()] || MOCK_QUESTIONS.default;
    
    // We don't send the answer index to the frontend for security
    res.json({ questions: questions.map((q: any) => ({ question: q.question, options: q.options })) });
  } catch (error) {
    next(error);
  }
};

export const evaluateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userId = user.id || user.userId;

    const { skillName, answers } = req.body;
    if (!skillName || !Array.isArray(answers)) {
      res.status(400).json({ error: 'skillName and answers array are required' });
      return;
    }
    
    // Find or create skill
    let skill = await prisma.skill.findUnique({
      where: { name: skillName.trim() }
    });
    
    if (!skill) {
      skill = await prisma.skill.create({
        data: { name: skillName.trim() }
      });
    }
    
    const skillId = skill.id;
    
    const questions = MOCK_QUESTIONS[skillName.toLowerCase()] || MOCK_QUESTIONS.default;
    
    let correctCount = 0;
    answers.forEach((ans: number, index: number) => {
      if (questions[index] && questions[index].answer === ans) {
        correctCount++;
      }
    });

    const score = correctCount; // 0 to 5
    const passed = score >= 3;

    // Save assessment
    const assessment = await prisma.skillAssessment.create({
      data: {
        userId,
        skillId,
        score,
        passed
      }
    });

    // Update UserSkill score
    let newScore = score * 10;
    const userSkill = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId, skillId } }
    });

    if (userSkill) {
      newScore = userSkill.score;
      if (passed) {
        newScore += (score * 10);
      } else {
        newScore = Math.max(0, newScore - 10);
      }

      await prisma.userSkill.update({
        where: { id: userSkill.id },
        data: { score: newScore }
      });
    } else {
      if (passed) {
        await prisma.userSkill.create({
          data: {
            userId,
            skillId,
            level: 'Beginner',
            score: newScore
          }
        });
      }
    }

    // Award Badges based on newScore
    const badgeEarned = [];
    if (passed) {
      const tiers = [
        { tier: 'Platinum', threshold: 100, icon: 'Award' },
        { tier: 'Gold', threshold: 75, icon: 'Star' },
        { tier: 'Silver', threshold: 50, icon: 'Shield' },
        { tier: 'Bronze', threshold: 25, icon: 'Medal' }
      ];

      for (const t of tiers) {
        if (newScore >= t.threshold) {
          const badgeName = `${skill.name} ${t.tier}`;
          let badge = await prisma.badge.findUnique({ where: { name: badgeName } });
          if (!badge) {
            badge = await prisma.badge.create({
              data: {
                name: badgeName,
                tier: t.tier,
                description: `Achieved ${t.tier} level in ${skill.name}`,
                icon: t.icon
              }
            });
          }

          const existingUserBadge = await prisma.userBadge.findUnique({
            where: { userId_badgeId: { userId, badgeId: badge.id } }
          });

          if (!existingUserBadge) {
            await prisma.userBadge.create({
              data: { userId, badgeId: badge.id }
            });
            badgeEarned.push(badge);
          }
        }
      }
    }

    res.json({ passed, score, correctCount, total: questions.length, skill, badgesEarned: badgeEarned });
  } catch (error) {
    next(error);
  }
};
