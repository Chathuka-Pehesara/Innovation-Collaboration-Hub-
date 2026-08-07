import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { GithubService } from '../services/githubService';

const prisma = new PrismaClient();

export function startGithubSyncJob() {
  // Run this job every 6 hours (at minute 0 past every 6th hour)
  cron.schedule('0 */6 * * *', async () => {
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
  });

  console.log('GitHub Sync Cron Job scheduled (Runs every 6 hours).');
}
