/**
 * @file        COMMIT_SYSTEM_EXAMPLES.md
 * @description Practical examples for using the commit tracking system
 */

# Commit Tracking System - Practical Examples

## Example 1: Manual Commit Logging (Frontend)

```typescript
// In a React component
import { logCommit } from '@/lib/api/commitApi';
import { useState } from 'react';

export function CommitLogForm({ projectId }) {
  const [loading, setLoading] = useState(false);

  const handleLogCommit = async () => {
    setLoading(true);
    try {
      await logCommit({
        projectId,
        message: 'Implement user authentication',
        filesChanged: 5,
        additions: 250,
        deletions: 45
      });
      alert('✅ Commit logged successfully!');
    } catch (error) {
      alert('❌ Failed to log commit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLogCommit} disabled={loading}>
      {loading ? 'Logging...' : '📝 Log Commit'}
    </button>
  );
}
```

## Example 2: Getting and Displaying Rankings (Frontend)

```typescript
import { getCommitRankings } from '@/lib/api/commitApi';
import { useEffect, useState } from 'react';

export function CommitLeaderboard({ projectId }) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    const fetchRankings = async () => {
      const data = await getCommitRankings(projectId);
      setRankings(data.rankings);
    };
    fetchRankings();
  }, [projectId]);

  return (
    <div className="leaderboard">
      {rankings.map((contributor, idx) => (
        <div key={contributor.userId} className="rank-item">
          <span className="medal">
            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
          </span>
          <span className="name">User {contributor.userId.slice(0, 8)}</span>
          <span className="commits">{contributor.commitCount} commits</span>
          <span className="additions">+{contributor.additions}</span>
          <span className="deletions">-{contributor.deletions}</span>
        </div>
      ))}
    </div>
  );
}
```

## Example 3: GitHub Integration (Backend)

```typescript
// backend/src/services/githubCommitSync.ts
import { logCommit } from './commitService';
import axios from 'axios';

export const syncGitHubCommits = async (projectId: string, repoOwner: string, repoName: string) => {
  const token = process.env.GITHUB_TOKEN;
  
  try {
    // Fetch commits from GitHub
    const response = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/commits`,
      { headers: { Authorization: `token ${token}` } }
    );

    // Log each commit
    for (const commit of response.data) {
      await logCommit(
        projectId,
        commit.commit.committer.name, // Will need to map to userId
        commit.commit.message,
        1, // Would need to get actual file count from commit details
        commit.stats?.additions || 0,
        commit.stats?.deletions || 0
      );
    }

    console.log(`✅ Synced ${response.data.length} commits from GitHub`);
  } catch (error) {
    console.error('❌ Failed to sync GitHub commits:', error);
  }
};
```

## Example 4: Automated Commit Logging (CI/CD Pipeline)

```yaml
# .github/workflows/log-commit.yml
name: Log Commit

on: [push]

jobs:
  log-commit:
    runs-on: ubuntu-latest
    steps:
      - name: Log commit to Innovation Hub
        run: |
          curl -X POST https://your-domain.com/api/commits/log \
            -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "projectId": "${{ secrets.PROJECT_ID }}",
              "message": "${{ github.event.head_commit.message }}",
              "filesChanged": 10,
              "additions": ${{ env.ADDITIONS }},
              "deletions": ${{ env.DELETIONS }}
            }'
```

## Example 5: Get Weekly Activity Report

```typescript
// backend/src/routes/commitReports.ts
export const getWeeklyReport = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  
  // Get commits from last 7 days
  const timeline = await getCommitTimeline(projectId, 7);
  
  // Group by user
  const userCommits = {};
  timeline.forEach(commit => {
    if (!userCommits[commit.userId]) {
      userCommits[commit.userId] = [];
    }
    userCommits[commit.userId].push(commit);
  });

  // Generate report
  const report = Object.entries(userCommits).map(([userId, commits]) => ({
    userId,
    weeklyCommits: commits.length,
    totalAdditions: commits.reduce((sum, c) => sum + c.additions, 0),
    totalDeletions: commits.reduce((sum, c) => sum + c.deletions, 0),
    lastActive: commits[commits.length - 1].createdAt
  }));

  res.json({
    projectId,
    period: 'Last 7 days',
    report: report.sort((a, b) => b.weeklyCommits - a.weeklyCommits)
  });
};
```

## Example 6: Display Commit Streaks

```typescript
// frontend/components/CommitStreak.tsx
import { getCommitTimeline } from '@/lib/api/commitApi';

export async function CommitStreak({ projectId, userId }) {
  const data = await getCommitTimeline(projectId, 365);
  
  // Find consecutive days with commits
  const userCommits = data.commits.filter(c => c.userId === userId);
  const dates = new Set(userCommits.map(c => new Date(c.createdAt).toDateString()));
  
  let maxStreak = 0;
  let currentStreak = 0;
  let currentDate = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toDateString();
    if (dates.has(dateStr)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return (
    <div className="streak-card">
      🔥 Longest Streak: <strong>{maxStreak}</strong> days
    </div>
  );
}
```

## Example 7: Real-time Commit Notifications

```typescript
// backend/src/services/commitNotification.ts
import { getCommitRankings } from './commitService';

export const checkAndNotifyTopContributor = async (projectId: string) => {
  const rankings = await getCommitRankings(projectId);
  
  if (rankings.length > 0) {
    const topContributor = rankings[0];
    
    // Check if they just became #1
    if (topContributor.rank === 1 && topContributor.commitCount % 10 === 0) {
      // Send notification
      await notificationService.send({
        userId: topContributor.userId,
        title: '🏆 Milestone Achievement!',
        message: `You've reached ${topContributor.commitCount} commits on this project!`
      });
    }
  }
};
```

## Example 8: Commit Statistics Dashboard

```typescript
// frontend/app/projects/[id]/analytics/page.tsx
import { getCommitAnalytics } from '@/lib/api/commitApi';

export default async function CommitAnalytics({ params }) {
  const analytics = await getCommitAnalytics(params.id);

  const stats = {
    avgCommitSize: Math.round(
      analytics.topContributors.reduce((sum, c) => sum + c.additions, 0) /
      analytics.totalCommits
    ),
    mostActive: analytics.topContributors[0],
    engagementRate: `${Math.round((analytics.totalContributors / 10) * 100)}%`,
    velocityTrend: 'Trending Up ↗️'
  };

  return (
    <div className="analytics-grid">
      <Card title="Most Active">
        <p>{stats.mostActive.commitCount} commits</p>
      </Card>
      <Card title="Avg Lines Per Commit">
        <p>+{stats.avgCommitSize}</p>
      </Card>
      <Card title="Team Engagement">
        <p>{stats.engagementRate}</p>
      </Card>
      <Card title="Velocity">
        <p>{stats.velocityTrend}</p>
      </Card>
    </div>
  );
}
```

## Example 9: Testing the API

```bash
#!/bin/bash
# test-commit-api.sh

PROJECT_ID="your-project-id"
TOKEN="your-jwt-token"
BASE_URL="http://localhost:5000/api"

# Test 1: Log a commit
echo "📝 Logging a commit..."
curl -X POST $BASE_URL/commits/log \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "message": "Add new feature",
    "filesChanged": 3,
    "additions": 100,
    "deletions": 20
  }'

echo "\n✅ Commit logged!"

# Test 2: Get rankings
echo "\n🏆 Fetching rankings..."
curl $BASE_URL/projects/$PROJECT_ID/commits/rankings \
  -H "Authorization: Bearer $TOKEN"

echo "\n📊 Rankings fetched!"

# Test 3: Get analytics
echo "\n📈 Fetching analytics..."
curl $BASE_URL/projects/$PROJECT_ID/commits/analytics \
  -H "Authorization: Bearer $TOKEN"

echo "\n✨ Done!"
```

## Example 10: Production Deployment Checklist

- [ ] Run database migration: `npx prisma migrate deploy`
- [ ] Set environment variables for API token
- [ ] Configure GitHub integration (if using)
- [ ] Set up CI/CD pipeline webhooks
- [ ] Create sample commits to test
- [ ] Verify rankings display correctly
- [ ] Monitor database performance with indexes
- [ ] Set up analytics alerts/thresholds
- [ ] Document team guidelines for commit logging
- [ ] Train team on new feature

---

## Quick Copy-Paste Examples

### Log a commit (cURL)
```bash
curl -X POST http://localhost:5000/api/commits/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"PROJ_ID","message":"Fix bug","filesChanged":2,"additions":50,"deletions":10}'
```

### Get top 5 contributors (cURL)
```bash
curl http://localhost:5000/api/projects/PROJ_ID/commits/rankings \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.rankings[0:5]'
```

### Get recent activity (cURL)
```bash
curl "http://localhost:5000/api/projects/PROJ_ID/commits/timeline?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
