# Commit Tracking & Rankings System

## Overview
This document describes the commit tracking and contributor rankings system that allows you to monitor project contributions, track commit activity, and display top contributors with detailed statistics.

## Features Implemented

### 1. **Database Schema**
- **Commit Model** added to Prisma schema with the following fields:
  - `id`: Unique identifier
  - `projectId`: Link to project
  - `userId`: User who made the commit
  - `message`: Commit message
  - `filesChanged`: Number of files changed
  - `additions`: Lines added
  - `deletions`: Lines deleted
  - `createdAt`: Timestamp

### 2. **Backend Services** (`backend/src/services/commitService.ts`)
- `logCommit()`: Create a new commit record
- `getCommitRankings()`: Get ranked list of top contributors
- `getProjectCommitAnalytics()`: Get overall project commit stats
- `getUserCommitStats()`: Get specific user's stats
- `getCommitTimeline()`: Get commit activity timeline

### 3. **Backend Controllers** (`backend/src/controllers/commitController.ts`)
- POST `/commits/log` - Log a new commit
- GET `/projects/:projectId/commits/rankings` - Get top contributors
- GET `/projects/:projectId/commits/analytics` - Get project analytics
- GET `/projects/:projectId/commits/user/:userId` - Get user's stats
- GET `/projects/:projectId/commits/timeline` - Get commit timeline

### 4. **Backend Routes** (`backend/src/routes/commits.ts`)
All endpoints require authentication. Routes are mounted at `/commits`

### 5. **Frontend API Utilities** (`frontend/lib/api/commitApi.ts`)
- `logCommit()`: Send commit data to backend
- `getCommitRankings()`: Fetch commit rankings
- `getCommitAnalytics()`: Fetch project analytics
- `getUserCommitStats()`: Fetch user stats
- `getCommitTimeline()`: Fetch timeline data

### 6. **Frontend Component** (`frontend/components/cards/CommitRankings.tsx`)
Interactive component displaying:
- **Header Stats Card**: Total commits, contributors, average commits per person
- **Two Tabs**:
  1. **Top Contributors Tab**:
     - Medal ranking system (🥇🥈🥉)
     - Commit count
     - Files changed
     - Lines added/deleted
     - Last commit timestamp
  
  2. **Recent Activity Tab**:
     - Timeline view of recent commits
     - Commit messages
     - User info
     - Timestamps

### 7. **Integration**
- Component integrated into Project Details page
- Shows under "Contributor Commit Rankings" section
- Automatically loads analytics when project is viewed

## API Endpoints

### Log a Commit
```bash
POST /api/commits/log
Content-Type: application/json
Authorization: Bearer {token}

{
  "projectId": "project-uuid",
  "message": "Add authentication feature",
  "filesChanged": 5,
  "additions": 150,
  "deletions": 30
}

Response:
{
  "message": "Commit logged successfully",
  "commit": {
    "id": "commit-uuid",
    "projectId": "project-uuid",
    "userId": "user-uuid",
    "message": "Add authentication feature",
    "filesChanged": 5,
    "additions": 150,
    "deletions": 30,
    "createdAt": "2026-08-13T10:30:00Z"
  }
}
```

### Get Commit Rankings
```bash
GET /api/projects/:projectId/commits/rankings
Authorization: Bearer {token}

Response:
{
  "projectId": "project-uuid",
  "totalContributors": 3,
  "rankings": [
    {
      "userId": "user-uuid-1",
      "commitCount": 25,
      "additions": 450,
      "deletions": 120,
      "filesChanged": 45,
      "lastCommitDate": "2026-08-13T10:30:00Z",
      "rank": 1
    },
    // ... more contributors
  ]
}
```

### Get Project Analytics
```bash
GET /api/projects/:projectId/commits/analytics
Authorization: Bearer {token}

Response:
{
  "projectId": "project-uuid",
  "totalCommits": 75,
  "totalContributors": 3,
  "topContributors": [/* ranked list */],
  "recentCommits": [/* last 10 commits */]
}
```

### Get User Commit Stats
```bash
GET /api/projects/:projectId/commits/user/:userId
Authorization: Bearer {token}

Response:
{
  "userId": "user-uuid",
  "commitCount": 25,
  "additions": 450,
  "deletions": 120,
  "filesChanged": 45,
  "lastCommitDate": "2026-08-13T10:30:00Z",
  "rank": 1
}
```

### Get Commit Timeline
```bash
GET /api/projects/:projectId/commits/timeline?days=30
Authorization: Bearer {token}

Response:
{
  "projectId": "project-uuid",
  "days": 30,
  "commitCount": 75,
  "commits": [
    {
      "id": "commit-uuid",
      "userId": "user-uuid",
      "message": "Fix bug in API",
      "filesChanged": 3,
      "additions": 45,
      "deletions": 15,
      "createdAt": "2026-08-13T10:30:00Z"
    },
    // ... more commits
  ]
}
```

## Usage Example

### Frontend - Logging a Commit
```typescript
import { logCommit } from '@/lib/api/commitApi';

const handleCommit = async () => {
  try {
    const result = await logCommit({
      projectId: 'project-123',
      message: 'Implement user authentication',
      filesChanged: 5,
      additions: 200,
      deletions: 50
    });
    console.log('Commit logged:', result);
  } catch (error) {
    console.error('Failed to log commit:', error);
  }
};
```

### Frontend - Fetching Analytics
```typescript
import { getCommitAnalytics } from '@/lib/api/commitApi';

useEffect(() => {
  const fetchStats = async () => {
    const analytics = await getCommitAnalytics(projectId);
    console.log('Top contributors:', analytics.topContributors);
  };
  fetchStats();
}, [projectId]);
```

## Database Migration

To apply schema changes to your database:

```bash
cd backend
npx prisma migrate dev --name add_commit_model
```

This creates:
- New `commits` table
- Indexes on `projectId` and `userId` for faster queries

## Component Usage

```typescript
import CommitRankings from '@/components/cards/CommitRankings';

export default function ProjectDetails() {
  return (
    <div>
      <CommitRankings projectId={projectId} />
    </div>
  );
}
```

## Features

✅ **Commit Logging**: Track commits with detailed metadata
✅ **Contributor Rankings**: See who has made the most commits
✅ **Statistics**: View additions, deletions, files changed
✅ **Timeline View**: See recent commit activity
✅ **User-Specific Stats**: Check individual contributor stats
✅ **Responsive Design**: Works on desktop and mobile
✅ **Error Handling**: Graceful error messages and loading states

## Future Enhancements

- [ ] GitHub integration to auto-log commits
- [ ] Email notifications for top contributors
- [ ] Commit streaks and achievements
- [ ] Team performance analytics
- [ ] Export reports as PDF
- [ ] Commit frequency charts
- [ ] Integration with CI/CD pipelines

## Testing

To test the API manually:

```bash
# Test logging a commit
curl -X POST http://localhost:5000/api/commits/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-project-id",
    "message": "Test commit",
    "filesChanged": 3,
    "additions": 100,
    "deletions": 20
  }'

# Test getting rankings
curl http://localhost:5000/api/projects/test-project-id/commits/rankings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Commits not showing up
1. Ensure migration has been run: `npx prisma migrate dev`
2. Check user authentication token is valid
3. Verify projectId exists in database

### Rankings not updating
1. Clear browser cache
2. Ensure commits were logged after component mounted
3. Check browser console for API errors

### Database migration issues
```bash
# Reset database (development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

## Support
For issues or questions, contact the development team.
