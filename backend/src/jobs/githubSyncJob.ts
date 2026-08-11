import { PrismaClient } from '@prisma/client';
import { GithubService } from '../services/githubService';

const prisma = new PrismaClient();

export function startGithubSyncJob() {
  const syncTask = async () => {
    console.log('Starting automated GitHub PR sync job...');
    try {
      // Find all users who have a GitHub username linked
      const users = await prisma.user.findMany({
        where: {
          githubUsername: { not: null }
        }
      });

      console.log(`Found ${users.length} users with linked GitHub accounts.`);

      for (const user of users) {
        if (!user.githubUsername) continue;

        try {
          const prCount = await GithubService.getUserPRCount(user.githubUsername);
          const title = GithubService.getTitleFromPRCount(prCount);

          // Only update if something changed to avoid unnecessary DB writes
          if (user.githubPrCount !== prCount || user.githubTitle !== title) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                githubPrCount: prCount,
                githubTitle: title
              }
            });
            console.log(`Updated user ${user.githubUsername}: ${prCount} PRs, ${title}`);
          }

          // Slight delay to respect GitHub API rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to sync GitHub stats for user ${user.githubUsername}:`, error);
        }
      }

      console.log('Automated GitHub PR sync job completed.');
    } catch (error) {
      console.error('Error running GitHub PR sync job:', error);
    }
  };

  try {
    const cron = require('node-cron');
    cron.schedule('0 */6 * * *', syncTask);
    console.log('GitHub Sync Cron Job scheduled via node-cron (Runs every 6 hours).');
  } catch {
    // Fallback: Run every 6 hours using setInterval
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    setInterval(syncTask, SIX_HOURS);
    console.log('GitHub Sync Job scheduled via setInterval fallback (Runs every 6 hours).');
  }
}
