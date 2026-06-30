# Profile Management Implementation

## Overview
This document describes the complete Profile Management system implemented for the Innovation Collaboration Hub. The system includes student profile pages, profile editing, avatar uploads, skills management, portfolio showcase, availability settings, and student search functionality.

---

## Backend Implementation

### Database Models (Prisma Schema)
Located in: `backend/prisma/schema.prisma`

#### 1. User Model
Stores user profile information including:
- `id` (UUID): Primary identifier
- `email` (String, unique): User email
- `name` (String): Full name
- `role` (String): User role (student, mentor, admin)
- `password` (String): Encrypted password
- `bio` (String, optional): User biography
- `specialization` (String, optional): AI, IT, Cybersecurity, Networking, Other
- `avatarUrl` (String, optional): Profile picture URL
- Social links: `githubUrl`, `linkedinUrl`, `portfolioUrl`, `twitterUrl`
- `availableHours` (Int): Weekly hours available for collaboration
- `availableDays` (String): JSON array of available days
- `xp` (Int): Experience points
- `level` (Int): User level
- `createdAt`, `updatedAt`: Timestamps
- Relations: `skills`, `portfolioItems`

#### 2. UserSkill Model
Junction table linking users to skills with proficiency levels:
- `id` (UUID): Primary identifier
- `userId` (String, FK): Reference to User
- `skillId` (String, FK): Reference to Skill
- `level` (String): Proficiency level (Beginner, Intermediate, Advanced)
- `addedAt` (DateTime): When skill was added
- Unique constraint on (userId, skillId)

#### 3. PortfolioItem Model
Stores portfolio/project information:
- `id` (UUID): Primary identifier
- `userId` (String, FK): Reference to User
- `title` (String): Project title
- `description` (String, optional): Project description
- `url` (String, optional): Project URL
- `imageUrl` (String, optional): Project image/screenshot URL
- `tags` (String): JSON array of tags
- `createdAt`, `updatedAt`: Timestamps

### Backend Routes
Located in: `backend/src/routes/users.ts`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile/:id` | Get public profile | Public |
| PUT | `/profile/:id` | Update profile fields | Required |
| POST | `/profile/:id/avatar` | Upload avatar | Required |
| GET | `/profile/:id/skills` | Get skills list | Public |
| POST | `/profile/:id/skills` | Add skill | Required |
| DELETE | `/profile/:id/skills/:skillId` | Remove skill | Required |
| GET | `/profile/:id/portfolio` | Get portfolio items | Public |
| POST | `/profile/:id/portfolio` | Add portfolio item | Required |
| DELETE | `/profile/:id/portfolio/:itemId` | Remove portfolio item | Required |
| PUT | `/profile/:id/availability` | Update availability | Required |
| GET | `/students/search` | Search students by name/skill | Public |

### Controllers
Located in: `backend/src/controllers/userController.ts`

- `getProfile()`: Fetch public profile
- `updateProfile()`: Update profile fields (name, bio, social links, etc.)
- `uploadAvatar()`: Upload avatar image to Cloudinary
- `getSkills()`: Get user's skills list
- `addSkill()`: Add new skill with proficiency level
- `removeSkill()`: Remove skill from profile
- `getPortfolio()`: Get portfolio items
- `addPortfolioItem()`: Add new portfolio item
- `removePortfolioItem()`: Delete portfolio item
- `updateAvailability()`: Update availability settings
- `searchStudents()`: Search students with pagination

### Validators
Located in: `backend/src/validators/userValidator.ts`

- `updateProfileSchema`: Validates profile update data
- `addSkillSchema`: Validates skill addition
- `addPortfolioItemSchema`: Validates portfolio item
- `updateAvailabilitySchema`: Validates availability settings

---

## Frontend Implementation

### API Service
Located in: `frontend/lib/api/profileApi.ts`

Provides TypeScript-typed functions for all profile endpoints:
- `getProfile(userId)`
- `updateProfile(userId, data)`
- `uploadAvatar(userId, file)`
- `getProfileSkills(userId)`
- `addSkill(userId, data)`
- `removeSkill(userId, skillId)`
- `getPortfolio(userId)`
- `addPortfolioItem(userId, data)`
- `removePortfolioItem(userId, itemId)`
- `updateAvailability(userId, data)`
- `searchStudents(query, skill, page, limit)`

### Components

#### 1. **StudentProfilePage.tsx**
Public student profile page displaying:
- Avatar and basic info
- Bio and specialization
- XP and level
- Social media links
- Skills list with proficiency levels
- Portfolio items with images and tags
- Availability information
- Member since date

**Usage:**
```tsx
<StudentProfilePage userId={studentId} />
```

#### 2. **EditProfileForm.tsx**
Form to edit profile information:
- Name (2-80 characters)
- Bio (max 500 characters)
- Specialization dropdown
- Social links (GitHub, LinkedIn, Portfolio, Twitter)
- Form validation with Zod
- Toast notifications

**Usage:**
```tsx
<EditProfileForm 
  profile={profile} 
  userId={userId}
  onSuccess={(updated) => setProfile(updated)}
/>
```

#### 3. **AvatarUpload.tsx**
Avatar upload component:
- File selection and preview
- Drag-and-drop support
- File type validation (JPEG, PNG, WebP)
- 5 MB size limit
- Upload to Cloudinary
- Progress indication

**Usage:**
```tsx
<AvatarUpload 
  userId={userId}
  currentAvatarUrl={profile.avatarUrl}
  onSuccess={(url) => setProfile({...profile, avatarUrl: url})}
/>
```

#### 4. **SkillsManager.tsx**
Skills management component:
- Add skills with autocomplete suggestions
- Select proficiency level (Beginner/Intermediate/Advanced)
- Remove skills
- Common skills suggestions
- List of current skills with levels

**Usage:**
```tsx
<SkillsManager 
  userId={userId}
  onSkillsUpdate={(skills) => setProfile({...profile, skills})}
/>
```

#### 5. **PortfolioManager.tsx**
Portfolio management component:
- Add portfolio items with form
- Title, description, URL, image URL, and tags
- View projects grid
- Remove portfolio items
- Image display for each project
- Tag management

**Usage:**
```tsx
<PortfolioManager 
  userId={userId}
  onItemsUpdate={(items) => setProfile({...profile, portfolioItems: items})}
/>
```

#### 6. **AvailabilitySettings.tsx**
Availability configuration component:
- Set weekly available hours (0-168)
- Quick select buttons (0, 5, 10, 15, 20, 30, 40 hours)
- Select available days of week
- Select All / Clear All buttons
- Summary display

**Usage:**
```tsx
<AvailabilitySettings 
  userId={userId}
  initialHours={profile.availableHours}
  initialDays={profile.availableDays}
  onSuccess={(hours, days) => {...}}
/>
```

#### 7. **ProfileDashboard.tsx**
Complete dashboard combining all components:
- Tabbed interface for navigation
- Overview tab (profile summary, stats, social links)
- Edit Profile tab
- Avatar upload tab
- Skills management tab
- Portfolio management tab
- Availability settings tab
- Header with profile info
- Responsive design

**Usage:**
```tsx
<ProfileDashboard userId={userId} />
```

#### 8. **StudentSearchPage.tsx**
Search interface for finding students:
- Search by name
- Filter by skill
- Display results in grid
- Pagination support
- Student cards with:
  - Avatar and name
  - Specialization
  - Bio snippet
  - XP and available hours
  - Top skills
  - Link to profile

**Usage:**
```tsx
<StudentSearchPage />
```

---

## Feature Details

### 1. Profile Management
- **Public Viewing**: Anyone can view student profiles without authentication
- **Owner Editing**: Only profile owners and admins can edit profiles
- **Fields**: Name, bio, specialization, social links
- **Validation**: Zod schema validation on both frontend and backend

### 2. Avatar Upload
- **Service**: Cloudinary image hosting
- **Storage**: Automatic file optimization and cropping (400x400px)
- **Path**: `innovation-hub/avatars/avatar_{userId}`
- **Formats**: JPEG, PNG, WebP (5 MB max)

### 3. Skills Management
- **Proficiency Levels**: Beginner, Intermediate, Advanced
- **Autocomplete**: Common skills suggestions
- **Custom Skills**: Users can add any custom skill
- **Duplicate Prevention**: Can't add same skill twice

### 4. Portfolio Items
- **Rich Information**: Title, description, URL, image, tags
- **Media**: Optional project screenshots/images
- **Organization**: Grid display with newest first
- **Tags**: Up to 10 tags per item

### 5. Availability Settings
- **Hours**: 0-168 hours per week (0 = limited availability)
- **Days**: Select specific days of the week
- **Quick Select**: Preset hour options
- **Bulk Actions**: Select All / Clear All for days

### 6. Student Search
- **Search Criteria**: Name and skill
- **Filters**: Independent name and skill search
- **Pagination**: 12 results per page
- **Sorting**: By XP (highest first)

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Database Migration

To apply the schema changes, run:

```bash
cd backend
npx prisma migrate dev --name add_profile_management
npx prisma generate
```

---

## API Response Examples

### Get Profile Response
```json
{
  "profile": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Full-stack developer interested in AI",
    "specialization": "AI",
    "avatarUrl": "https://cloudinary.com/...",
    "xp": 1250,
    "level": 5,
    "availableHours": 20,
    "availableDays": ["Monday", "Wednesday", "Friday"],
    "skills": [
      {
        "id": "skill-uuid",
        "name": "React",
        "level": "Advanced"
      }
    ],
    "portfolioItems": [
      {
        "id": "item-uuid",
        "title": "E-commerce Platform",
        "description": "Full-stack e-commerce with React and Node.js",
        "url": "https://project.com",
        "imageUrl": "https://...",
        "tags": ["React", "Node.js", "MongoDB"]
      }
    ]
  }
}
```

### Search Students Response
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "Alice Smith",
      "specialization": "IT",
      "avatarUrl": "https://...",
      "bio": "Backend developer",
      "availableHours": 15,
      "xp": 800,
      "level": 3,
      "skills": [
        {"id": "uuid", "name": "Node.js", "level": "Intermediate"}
      ]
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 12,
    "totalPages": 4
  }
}
```

---

## Integration Points

### With AI Service
- Student skills are used for project team matching
- Endpoint: `GET /profile/:id/skills`

### With Chat/Messaging
- Student profiles accessible from messages
- Profile link in team member lists

### With Project Management
- Student availability considered for team formation
- Skills used for team composition

---

## Security Considerations

1. **Authentication**: All mutation endpoints require JWT authentication
2. **Authorization**: Users can only edit their own profiles
3. **Input Validation**: Zod schemas on backend and frontend
4. **File Upload**: MIME type validation, file size limits
5. **Image Processing**: Cloudinary handles image security
6. **Data Sanitization**: No XSS vulnerabilities in profile display

---

## Performance Optimizations

1. **Pagination**: Student search returns 12 results per page
2. **Caching**: Frontend caches profile data using React state
3. **Image Optimization**: Next.js Image component for lazy loading
4. **Database Queries**: Selective fields in API responses
5. **Cloudinary**: CDN delivery for avatar images

---

## Testing Endpoints

### Quick Test Commands

```bash
# Get a profile
curl http://localhost:5000/api/profile/{userId}

# Update profile (requires auth token)
curl -X PUT http://localhost:5000/api/profile/{userId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","bio":"New bio"}'

# Add skill
curl -X POST http://localhost:5000/api/profile/{userId}/skills \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"skillName":"React","level":"Advanced"}'

# Search students
curl "http://localhost:5000/api/students/search?q=alice&skill=React&page=1&limit=12"
```

---

## Future Enhancements

1. **Image Cropping**: Frontend image crop tool before upload
2. **Skill Endorsements**: Peer skill verification/endorsement system
3. **Portfolio Comments**: Comments/reviews on portfolio items
4. **Achievement Badges**: Gamification with achievement badges
5. **Profile Analytics**: View count, profile visits tracking
6. **Profile Export**: PDF profile generation
7. **Bulk Actions**: Bulk skill import from CSV
8. **Profile Templates**: Pre-filled profile templates by specialization

---

## Files Modified/Created

### Backend
- `backend/prisma/schema.prisma` - Added User, UserSkill, PortfolioItem models
- `backend/src/controllers/userController.ts` - Profile management endpoints
- `backend/src/validators/userValidator.ts` - Zod validation schemas
- `backend/src/routes/users.ts` - Profile routes
- `backend/src/routes/index.ts` - Registered profile routes

### Frontend
- `frontend/lib/api/profileApi.ts` - API service layer (NEW)
- `frontend/components/profile/StudentProfilePage.tsx` - Public profile view (NEW)
- `frontend/components/profile/EditProfileForm.tsx` - Profile editor (NEW)
- `frontend/components/profile/AvatarUpload.tsx` - Avatar upload (NEW)
- `frontend/components/profile/SkillsManager.tsx` - Skills management (NEW)
- `frontend/components/profile/PortfolioManager.tsx` - Portfolio management (NEW)
- `frontend/components/profile/AvailabilitySettings.tsx` - Availability config (NEW)
- `frontend/components/profile/ProfileDashboard.tsx` - Full dashboard (NEW)
- `frontend/components/profile/StudentSearchPage.tsx` - Student search (NEW)

---

## Support & Troubleshooting

### Common Issues

**Avatar Upload Fails**
- Verify Cloudinary credentials in .env
- Check file size (max 5 MB)
- Verify file format (JPEG, PNG, WebP)

**Profile Not Found**
- Check user ID is valid UUID
- Verify user exists in database
- Check database connection

**Skills Not Showing**
- Verify skills are added with POST endpoint
- Check database for UserSkill records
- Verify skill relations in Prisma schema

**Search Returns Empty**
- Ensure students have role='student'
- Try removing filters (q and skill params)
- Check pagination parameters
- Verify database has student records

---

## Contact & Support

For questions or issues with Profile Management, contact the IT Team.
