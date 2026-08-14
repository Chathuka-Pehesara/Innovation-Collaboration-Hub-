# 🌿 Git Workflow & Collaboration Guidelines

To maintain code quality, avoid branch messiness, and prevent merge conflicts across multidisciplinary contributors, follow this Git workflow.

---

## 🔀 1. Branch Naming Standards

Create descriptive branch names prefixed with the category:
- `feature/<name>` (e.g. `feature/leaderboard-filters`, `feature/network-map`)
- `fix/<name>` (e.g. `fix/oauth-redirect-loop`, `fix/import-paths`)
- `chore/<name>` (e.g. `chore/update-readme`, `chore/package-deps`)

---

## 🔄 2. Recommended Feature Workflow

### Step 1: Sync with Latest `main` Before Starting
```bash
git checkout main
git pull origin main
git checkout -b feature/my-new-feature
```

### Step 2: Keep Branch Up to Date
Before opening a Pull Request, regularly pull updates from `main` to catch conflicts early:
```bash
git fetch origin main
git merge origin/main
```

### Step 3: Run Local Verifications Before Pushing
```bash
# Verify Frontend Production Build
npm run build:frontend

# Push Database Changes if Schema Was Modified
npm run db:push
```

### Step 4: Open a Pull Request on GitHub
- Select `base: main` <- `compare: feature/my-new-feature`.
- Write a clear PR title and list key changes.
- Ensure GitHub Actions CI workflows pass all tests.

---

## 📝 3. Pull Request Review Checklist

Before approving or merging a Pull Request:
- [ ] No relative path resolution errors (e.g., use `@/lib/api` or `../api`, avoid `./api` from subfolders).
- [ ] No regression on previous bug fixes (e.g., preserve `suppressHydrationWarning` and `sizes` props on Next.js images).
- [ ] All CI workflows (`ci-frontend.yml`, `ci-backend.yml`, `ci-docker.yml`) pass with green checkmarks.
- [ ] Database schema changes include Prisma migrations or verified with `npm run db:push`.
