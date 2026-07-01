# Profile Management Implementation Guide

## Quick Start

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install cloudinary multer
npm install -D @types/multer
```

#### Configure Environment Variables
Create/update `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost:5432/innovation_hub
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Run Migrations
```bash
npx prisma migrate dev --name add_profile_management
npx prisma generate
npx prisma db seed # Optional: seed with sample data
```

#### Verify Backend Setup
```bash
# Start backend server
npm run dev

# Test endpoints
curl http://localhost:5000/api/status
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install axios react-hook-form @hookform/resolvers zod
```

#### Configure Environment Variables
Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Verify Frontend Setup
```bash
npm run dev
# Navigate to http://localhost:3000/students
```

---

## Component Integration

### Route Integration Examples

#### 1. Student Profile Page
File: `app/profile/[id]/page.tsx`

```tsx
'use client';
import StudentProfilePage from '@/components/profile/StudentProfilePage';
import { useParams } from 'next/navigation';

export default function ProfilePage() {
  const params = useParams();
  return <StudentProfilePage userId={params.id as string} />;
}
```

**Route:** `/profile/[userId]`
**Public:** Yes

---

#### 2. Profile Settings Dashboard
File: `app/settings/page.tsx`

```tsx
'use client';
import ProfileDashboard from '@/components/profile/ProfileDashboard';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();
  
  if (!user) redirect('/login');
  
  return <ProfileDashboard userId={user.id} />;
}
```

**Route:** `/settings`
**Public:** No (Requires authentication)

---

#### 3. Student Search & Discovery
File: `app/students/page.tsx`

```tsx
'use client';
import StudentSearchPage from '@/components/profile/StudentSearchPage';

export default function StudentsPage() {
  return <StudentSearchPage />;
}
```

**Route:** `/students`
**Public:** Yes

---

### Navigation Integration

#### Update Navigation Menu
File: `components/layout/Navigation.tsx`

```tsx
<nav>
  {/* ... existing links ... */}
  
  {/* Add profile links */}
  {isLoggedIn && (
    <>
      <Link href="/settings">Settings</Link>
      <Link href={`/profile/${userId}`}>My Profile</Link>
    </>
  )}
  
  <Link href="/students">Find Students</Link>
</nav>
```

---

### Auth Context Integration

#### Update Auth Store
File: `lib/store/authStore.ts`

```tsx
interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  // ... other fields
}

// After login, store user ID
const setUser = (user: AuthState['user']) => {
  set({ user });
  if (user) {
    localStorage.setItem('userId', user.id);
  }
};
```

---

## Component Usage Examples

### 1. Standalone Profile Viewer
```tsx
import StudentProfilePage from '@/components/profile/StudentProfilePage';

export default function ViewProfile({ userId }: { userId: string }) {
  return <StudentProfilePage userId={userId} />;
}
```

### 2. Edit Profile Only
```tsx
import EditProfileForm from '@/components/profile/EditProfileForm';
import { getProfile } from '@/lib/api/profileApi';
import { useState, useEffect } from 'react';

export default function EditMyProfile() {
  const [profile, setProfile] = useState(null);
  const userId = 'current-user-id';

  useEffect(() => {
    getProfile(userId).then(setProfile);
  }, [userId]);

  if (!profile) return <div>Loading...</div>;

  return (
    <EditProfileForm
      profile={profile}
      userId={userId}
      onSuccess={(updated) => setProfile(updated)}
    />
  );
}
```

### 3. Skills Widget in Project Form
```tsx
import SkillsManager from '@/components/profile/SkillsManager';

export default function ProjectFormWithSkills() {
  const [selectedSkills, setSelectedSkills] = useState([]);

  return (
    <div>
      <h3>Project Skills</h3>
      <SkillsManager
        userId={userId}
        onSkillsUpdate={setSelectedSkills}
      />
      {/* Rest of form */}
    </div>
  );
}
```

### 4. Portfolio Preview in Team Page
```tsx
import StudentProfilePage from '@/components/profile/StudentProfilePage';

export default function TeamMemberProfile({ memberId }: { memberId: string }) {
  return (
    <div className="modal">
      <StudentProfilePage userId={memberId} />
    </div>
  );
}
```

---

## API Usage Examples

### TypeScript
```tsx
import {
  getProfile,
  updateProfile,
  addSkill,
  searchStudents,
  uploadAvatar
} from '@/lib/api/profileApi';

// Get profile
const profile = await getProfile(userId);

// Update profile
const updated = await updateProfile(userId, {
  name: 'New Name',
  bio: 'Updated bio'
});

// Add skill
const skill = await addSkill(userId, {
  skillName: 'React',
  level: 'Advanced'
});

// Search students
const { students, pagination } = await searchStudents('john', 'React', 1, 12);

// Upload avatar
const { avatarUrl } = await uploadAvatar(userId, file);
```

### REST API (cURL)
```bash
# Get profile
curl http://localhost:5000/api/profile/{userId}

# Update profile
curl -X PUT http://localhost:5000/api/profile/{userId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","bio":"Full-stack dev"}'

# Upload avatar
curl -X POST http://localhost:5000/api/profile/{userId}/avatar \
  -H "Authorization: Bearer {token}" \
  -F "avatar=@profile.jpg"

# Add skill
curl -X POST http://localhost:5000/api/profile/{userId}/skills \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"skillName":"React","level":"Advanced"}'

# Add portfolio item
curl -X POST http://localhost:5000/api/profile/{userId}/portfolio \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"E-commerce App",
    "description":"Full-stack e-commerce platform",
    "url":"https://project.com",
    "tags":["React","Node.js"]
  }'

# Search students
curl 'http://localhost:5000/api/students/search?q=alice&skill=React&page=1&limit=12'

# Update availability
curl -X PUT http://localhost:5000/api/profile/{userId}/availability \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "availableHours":20,
    "availableDays":["Monday","Wednesday","Friday"]
  }'
```

---

## Styling & Customization

### Color Scheme
The components use Tailwind CSS with the following color palette:
- Primary: Blue (`blue-600`)
- Success: Green (`green-600`)
- Error: Red (`red-600`)
- Neutral: Slate (`slate-900`, `slate-600`)

### Customizing Colors
```tsx
// In component or global style
const COLORS = {
  primary: 'blue-600',
  secondary: 'purple-600',
  success: 'green-600',
  error: 'red-600'
};

// Update className
className="bg-blue-600" // Change to desired color
```

### Dark Mode Support
Components are compatible with Tailwind's dark mode. Add to `tailwind.config.ts`:
```ts
export default {
  darkMode: 'class',
  // ...
}
```

---

## Security Checklist

- [x] JWT authentication on protected endpoints
- [x] Authorization checks (owner-only edits)
- [x] Input validation (Zod + backend)
- [x] File type/size validation
- [x] HTTPS in production
- [x] CORS properly configured
- [x] No sensitive data in localStorage
- [x] Environment variables in .env (not committed)

---

## Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image';

// Use Next.js Image for optimization
<Image
  src={avatarUrl}
  alt="Avatar"
  width={120}
  height={120}
  priority={false}
/>
```

### Data Caching
```tsx
// Cache profile in React state
const [profile, setProfile] = useState(null);

// Only fetch when userId changes
useEffect(() => {
  getProfile(userId).then(setProfile);
}, [userId]);
```

### Pagination
- Search results limited to 12 per page
- Implement lazy loading for large lists
- Use virtual scrolling for 100+ items

---

## Testing

### Unit Tests Example
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import StudentProfilePage from '@/components/profile/StudentProfilePage';

describe('StudentProfilePage', () => {
  it('should display profile information', async () => {
    render(<StudentProfilePage userId="test-id" />);
    
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });
});
```

### API Tests Example
```bash
# Test get profile endpoint
curl -i http://localhost:5000/api/profile/test-user-id

# Expected: 200 OK with profile data
# Or 404 Not Found if user doesn't exist
```

---

## Troubleshooting

### Common Issues

#### 1. Avatar Upload Fails
**Error:** "Cloudinary configuration error"
- [ ] Verify CLOUDINARY_CLOUD_NAME in .env
- [ ] Verify CLOUDINARY_API_KEY in .env
- [ ] Verify CLOUDINARY_API_SECRET in .env
- [ ] Restart backend server

**Error:** "File size exceeds limit"
- [ ] Max file size is 5 MB
- [ ] Compress image before upload
- [ ] Use PNG or JPEG format

---

#### 2. Profile Not Found
**Error:** 404 Profile not found
- [ ] Verify user ID format (should be UUID)
- [ ] Verify user exists in database
- [ ] Check database connection
- [ ] Run migrations: `npx prisma migrate dev`

---

#### 3. Search Returns No Results
**Error:** Empty search results
- [ ] Ensure search term is not empty
- [ ] Verify students exist with `role='student'`
- [ ] Check pagination: `?page=1&limit=12`
- [ ] Try without skill filter first

---

#### 4. Skills Not Showing
**Error:** Skills list is empty
- [ ] Verify skills were added with POST endpoint
- [ ] Check UserSkill records in database
- [ ] Verify Skill model has `users` relation

---

## Database Queries

### Useful Queries for Testing

```sql
-- View all users
SELECT id, name, email, role, created_at FROM "User" LIMIT 10;

-- View user skills
SELECT us.id, us."userId", s.name, us.level 
FROM "UserSkill" us
JOIN "Skill" s ON us."skillId" = s.id
WHERE us."userId" = 'user-id-here';

-- View portfolio items
SELECT * FROM "PortfolioItem" 
WHERE "userId" = 'user-id-here'
ORDER BY "createdAt" DESC;

-- Count students
SELECT COUNT(*) FROM "User" WHERE role = 'student';

-- Search students by name
SELECT * FROM "User" 
WHERE role = 'student' 
AND name ILIKE '%search-term%'
LIMIT 10;
```

---

## Deployment Checklist

### Backend
- [ ] Update `DATABASE_URL` for production database
- [ ] Update Cloudinary credentials (production account)
- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS for frontend domain
- [ ] Set up database backups
- [ ] Enable logging/monitoring
- [ ] Test all endpoints in production

### Frontend
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend
- [ ] Build frontend: `npm run build`
- [ ] Test build locally: `npm run start`
- [ ] Configure CDN for static assets
- [ ] Set up image optimization
- [ ] Enable analytics tracking

---

## Support & Documentation

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/get-started)
- [Zod Validation](https://zod.dev/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

## Feedback & Updates

For issues, feature requests, or updates to this implementation:
1. Check existing documentation
2. Review error logs
3. Contact IT Team for support
4. Document findings for future reference
