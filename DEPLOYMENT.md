# Deployment Guide - Remote Quote MVP

## Prerequisites

Before deploying to Vercel, ensure you have:
- A Vercel account
- A PostgreSQL database (Neon, Supabase, or Railway recommended)
- Cloudflare R2 bucket configured
- All environment variables ready

## Environment Variables

### Required for Production

Create these environment variables in your Vercel project settings:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.vercel.app"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# Cloudflare R2
R2_ENDPOINT="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET="your_bucket_name"
R2_ACCOUNT_ID="your_account_id"
R2_USE_SIGNED_URLS="true"

# Email (Resend)
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="Remote Quote <notifications@yourdomain.com>"
RESEND_REPLY_TO="support@yourdomain.com"
```

> Resend powers the transactional emails. Make sure your sender domain is verified inside Resend before going live, otherwise messages will be blocked.

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Database Setup

### Option 1: Neon (Recommended - Free Tier Available)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to Vercel as `DATABASE_URL`

### Option 2: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use "connection pooling" mode)
5. Add to Vercel as `DATABASE_URL`

### Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Add to Vercel as `DATABASE_URL`

## Vercel Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add environment variables (from section above)
6. Click **Deploy**

### 3. Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
# ... add all other env vars
```

## Post-Deployment Steps

### 1. Run Database Migrations

After first deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production.local
npx prisma migrate deploy
```

Or connect to your production database locally:

```bash
# Update .env with production DATABASE_URL temporarily
npx prisma migrate deploy
```

### 2. Verify Deployment

Test these critical flows:

1. **Signup**: Create a business account
2. **Login**: Sign in with credentials
3. **Intake Form**: Submit a test request (use your public intake URL)
4. **Dashboard**: Verify stats and recent requests display
5. **Quote Creation**: Create a quote for a request
6. **PDF Generation**: Download a quote PDF
7. **Quote Approval**: Test the public approval flow
8. **R2 Upload**: Upload a logo and verify it displays
9. **Mobile**: Test all flows on mobile device

### 3. Configure Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update `NEXTAUTH_URL` environment variable to use custom domain
5. Redeploy

## Database Migration Strategy

### Initial Deployment

```bash
npx prisma migrate deploy
```

### Future Updates

When you add new migrations:

```bash
# 1. Create migration locally
npx prisma migrate dev --name your_migration_name

# 2. Commit migration files
git add prisma/migrations
git commit -m "Add migration: your_migration_name"

# 3. Push to GitHub (triggers Vercel deployment)
git push

# 4. After deployment, run migration
vercel env pull .env.production.local
npx prisma migrate deploy
```

## Troubleshooting

### Build Failures

**Issue**: Prisma client generation fails
```bash
# Solution: Ensure postinstall script runs
# In package.json:
"scripts": {
  "postinstall": "prisma generate"
}
```

**Issue**: Type errors during build
```bash
# Solution: Run build locally first
npm run build

# Fix any type errors, then redeploy
```

### Runtime Errors

**Issue**: Database connection fails
- Verify `DATABASE_URL` is correct
- Ensure database accepts connections from Vercel IPs
- Use connection pooling for better performance

**Issue**: NextAuth errors
- Verify `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your domain
- Check browser cookies are enabled

**Issue**: R2 files not loading
- Verify all R2 environment variables are set
- Check `R2_USE_SIGNED_URLS=true` is set
- Verify R2 API token has read/write permissions
- Check CORS settings in Cloudflare R2

### Performance Optimization

1. **Enable Edge Caching**
   - Vercel automatically caches static assets
   - API routes use serverless functions

2. **Database Connection Pooling**
   - Use PgBouncer or Supabase connection pooling
   - Prevents connection limit issues

3. **Image Optimization**
   - Next.js automatically optimizes images
   - R2 serves files efficiently with signed URLs

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
1. Go to your project
2. Navigate to **Analytics**
3. Enable **Web Analytics**

### Error Tracking

Recommended tools:
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and logging
- **Vercel Logs**: Built-in logging

## Scaling Considerations

### Database

- **Neon**: Auto-scales, branching for dev/staging
- **Supabase**: Scalable PostgreSQL with connection pooling
- **Railway**: Easy vertical scaling

### File Storage (R2)

- Automatically scales
- No egress fees (major cost advantage over S3)
- Consider CDN if serving many large files

### Serverless Functions

- Vercel automatically scales
- Monitor function execution time
- Keep functions under 10s execution time (Hobby plan)

## Security Checklist

- [ ] All environment variables set in Vercel
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] Database requires SSL connections
- [ ] R2 bucket is private with signed URLs
- [ ] No sensitive data in repository
- [ ] `.env` files in `.gitignore`
- [ ] API routes validate input
- [ ] File uploads have size limits

## Backup Strategy

### Database Backups

- **Neon**: Automatic backups included
- **Supabase**: Daily backups on paid plans
- **Railway**: Automated backups available

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup-YYYYMMDD.sql
```

### R2 Backups

Use `wrangler` CLI:

```bash
# Install wrangler
npm install -g wrangler

# Configure
wrangler r2 bucket download <bucket-name> --output ./r2-backup
```

## Cost Estimates

### Hobby Deployment (Free Tier)

- **Vercel**: Free (100GB bandwidth, 1000 serverless executions/day)
- **Neon**: Free (0.5GB storage, 3GB data transfer)
- **Cloudflare R2**: ~$0.01/month (100 requests, minimal storage)
- **Total**: ~$0-5/month

### Production (Paid Tiers)

- **Vercel Pro**: $20/month (1TB bandwidth, unlimited functions)
- **Neon Scale**: $19/month (10GB storage, pooling)
- **R2**: ~$1-10/month (depends on usage)
- **Total**: ~$40-50/month for moderate traffic

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Neon: [neon.tech/docs](https://neon.tech/docs)
- Cloudflare: [developers.cloudflare.com](https://developers.cloudflare.com)

## Quick Deploy Button (Optional)

Add to README.md:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/remote-quote)
```
