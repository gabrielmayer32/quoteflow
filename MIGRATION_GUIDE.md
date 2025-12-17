# Database Migration Guide

## ⚠️ IMPORTANT: Never Use `db push` in Production

The `npx prisma db push` command directly modifies your database schema **without creating migrations** and can cause **data loss**. It should **NEVER** be used with production databases.

---

## Safe Migration Workflow

### 1. Local Development Setup

**First time setup:**
```bash
# Create a local PostgreSQL database
createdb quoteflow_local

# Copy environment file and update DATABASE_URL to point to local DB
cp .env.example .env.local
# Edit .env.local to use your local database URL
```

**Your `.env.local` should look like:**
```env
DATABASE_URL="postgresql://localhost:5432/quoteflow_local"
# ... other vars
```

### 2. Making Schema Changes

**Step 1:** Edit `prisma/schema.prisma`
```prisma
model Business {
  // Add your new fields here
  emailVerified Boolean @default(false)
  // ...
}
```

**Step 2:** Create a migration (LOCAL ONLY)
```bash
npm run db:migrate:dev
# This will:
# 1. Create a new migration file
# 2. Apply it to your LOCAL database
# 3. Regenerate Prisma Client
```

**Step 3:** Test locally
```bash
npm run dev
# Test your changes thoroughly
```

**Step 4:** Commit the migration
```bash
git add prisma/migrations
git commit -m "Add email verification to Business model"
git push
```

### 3. Deploying to Production

**Option A: Using Vercel/Netlify (Recommended)**
Add to your build settings or `package.json`:
```json
{
  "scripts": {
    "build": "prisma migrate deploy && prisma generate && next build"
  }
}
```

**Option B: Manual deployment**
```bash
# Set DATABASE_URL to production in environment
npx prisma migrate deploy
```

**⚠️ NEVER run these commands in production:**
- ❌ `npx prisma db push`
- ❌ `npx prisma migrate dev`
- ❌ `npx prisma migrate reset`

---

## Database Environments

### Development (.env.local)
```env
DATABASE_URL="postgresql://localhost:5432/quoteflow_local"
```
- Use for local development
- Safe to experiment with `db push` or `migrate dev`
- Can reset/wipe data without consequences

### Production (.env on Vercel)
```env
DATABASE_URL="postgresql://...neon.tech/neondb"
```
- **ONLY** use `prisma migrate deploy`
- Never run destructive commands
- Always test migrations locally first

---

## Emergency Recovery

If you accidentally ran `db push` on production and lost data:

1. **Check database backups** (Neon has automatic backups)
2. **Restore from backup:**
   ```bash
   # Contact Neon support or use their dashboard to restore
   ```

3. **If no backup available**, you'll need to:
   - Manually recreate lost data
   - Consider implementing regular backup strategy

---

## Best Practices

### ✅ DO:
- Keep production DATABASE_URL in Vercel environment variables only
- Use `.env.local` for local development with a local database
- Always create migrations with `npm run db:migrate:dev` locally
- Test migrations on a staging database before production
- Commit migration files to git
- Use `prisma migrate deploy` for production deployments

### ❌ DON'T:
- Never put production DATABASE_URL in `.env` file locally
- Never use `db push` on production
- Never run `migrate dev` or `migrate reset` on production
- Never skip testing migrations locally
- Never delete migration files from git

---

## Quick Reference

| Command | Use Case | Safe for Production? |
|---------|----------|---------------------|
| `prisma migrate dev` | Create new migration locally | ❌ No |
| `prisma migrate deploy` | Apply migrations to production | ✅ Yes |
| `prisma db push` | Quick prototyping (local only) | ❌ NEVER |
| `prisma migrate reset` | Reset local database | ❌ NEVER |
| `prisma studio` | Browse database | ✅ Yes (read-only) |
| `prisma generate` | Regenerate Prisma Client | ✅ Yes |

---

## Setting Up Separate Environments

### Local Development Database

**Option 1: Local PostgreSQL**
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
# or use Docker
docker run --name quoteflow-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Create database
createdb quoteflow_local

# Update .env.local
DATABASE_URL="postgresql://localhost:5432/quoteflow_local"
```

**Option 2: Neon Branch (Recommended)**
```bash
# Create a development branch in Neon dashboard
# Use the branch URL in .env.local
DATABASE_URL="postgresql://...neon.tech/neondb?options=endpoint%3Ddev-branch"
```

### Staging Environment (Optional)
- Create a separate Neon database for staging
- Deploy to staging Vercel project first
- Test migrations before production

---

## Migration Checklist

Before deploying schema changes:

- [ ] Schema changes made in `prisma/schema.prisma`
- [ ] Migration created with `npm run db:migrate:dev`
- [ ] Migration tested locally
- [ ] All tests passing
- [ ] Migration files committed to git
- [ ] Reviewed migration SQL for safety
- [ ] Staging deployment successful (if applicable)
- [ ] Production deployment planned during low-traffic window
- [ ] Backup verified before production deployment

---

## Need Help?

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Neon Branching](https://neon.tech/docs/guides/branching)
- [Production Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
