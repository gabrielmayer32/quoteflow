# Cloudflare R2 Storage Setup Guide

This guide explains how to configure Cloudflare R2 for file storage in the Remote Quote application.

## Why R2?

Cloudflare R2 is an S3-compatible object storage service that offers:
- **Zero egress fees** (unlike AWS S3)
- **S3-compatible API** (easy migration)
- **Global distribution** via Cloudflare's network
- **Competitive pricing** ($0.015/GB/month for storage)
- **10GB free storage** per account

## Setup Instructions

### Step 1: Create a Cloudflare R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage** in the sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `remote-quote-uploads`)
5. Choose a location hint (optional, for performance optimization)
6. Click **Create bucket**

### Step 2: Generate API Tokens

1. In the R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Give it a name (e.g., "Remote Quote Production")
4. Set permissions:
   - **Object Read & Write** (or Admin Read & Write for full access)
5. (Optional) Scope to specific buckets if needed
6. Click **Create API Token**
7. **Important**: Copy the **Access Key ID** and **Secret Access Key** immediately
   - You won't be able to see the Secret Access Key again!

### Step 3: Get Your Account ID

Your R2 Account ID can be found in the R2 dashboard URL:
```
https://dash.cloudflare.com/<ACCOUNT_ID>/r2/overview
```

Or look for it in the **R2 Settings** page.

### Step 4: Configure Environment Variables

Update your `.env.local` file with the R2 credentials:

```env
# Cloudflare R2 Storage
R2_BUCKET_NAME="remote-quote-uploads"
R2_ACCOUNT_ID="your-account-id-here"
R2_ACCESS_KEY_ID="your-access-key-id-here"
R2_SECRET_ACCESS_KEY="your-secret-access-key-here"
R2_PUBLIC_URL="" # Optional: Custom domain (see below)
```

### Step 5: (Optional) Setup Custom Domain

For better branding and SEO, you can serve files from your own domain:

1. In your R2 bucket settings, click **Settings** → **Public Access**
2. Click **Connect Domain**
3. Enter your custom domain (e.g., `cdn.yourcompany.com`)
4. Add the required DNS records to your Cloudflare DNS
5. Wait for DNS propagation
6. Update `R2_PUBLIC_URL` in `.env.local`:
   ```env
   R2_PUBLIC_URL="https://cdn.yourcompany.com"
   ```

### Step 6: Test the Configuration

1. Restart your development server
2. Go to **Settings** in the app
3. Try uploading a logo
4. Submit a new intake form with file attachments
5. Verify files are being uploaded to R2 in your Cloudflare dashboard

## How It Works

The application automatically detects if R2 is configured:

- **When R2 is configured**: Files upload to Cloudflare R2
- **When R2 is NOT configured**: Files fall back to local storage in `/public/uploads`

### File Upload Flow

1. **Intake Form**: Client uploads photos/videos
   - Stored in R2 at `requests/<timestamp>-<random>-<filename>.ext`

2. **Logo Upload**: Business owner uploads logo
   - Stored in R2 at `logos/<businessId>-<timestamp>-<random>.ext`
   - Old logo automatically deleted when uploading new one

### Storage Structure

```
remote-quote-uploads/
├── logos/
│   └── <businessId>-<timestamp>-<random>.jpg
└── requests/
    ├── <timestamp>-<random>-photo1.jpg
    ├── <timestamp>-<random>-photo2.jpg
    └── <timestamp>-<random>-video.mp4
```

## Security Best Practices

1. **Never commit credentials** to git
   - R2 credentials are in `.env.local` which is gitignored

2. **Use separate tokens** for development and production
   - Create different API tokens for each environment

3. **Set appropriate CORS rules** if serving files directly
   - Configure CORS in R2 bucket settings if needed

4. **Rotate API tokens** periodically
   - Generate new tokens every 90 days

5. **Monitor usage** in Cloudflare dashboard
   - Set up billing alerts

## Cost Estimate

For a typical service business with 50 requests/month:

- **Storage**: ~1GB = $0.015/month
- **Class A Operations** (uploads): ~200 = $0.0009
- **Class B Operations** (downloads): ~500 = $0.0002
- **Egress**: FREE (this is R2's main advantage!)

**Total**: ~$0.02/month 🎉

Compare to AWS S3:
- Storage: $0.023/GB
- Requests: Similar
- **Egress**: $0.09/GB (this adds up quickly!)

## Migrating from Local Storage

If you already have files in `/public/uploads`, you can migrate them to R2:

1. Use the Cloudflare CLI tool `wrangler`:
   ```bash
   npx wrangler r2 object put remote-quote-uploads/uploads/file.jpg --file=./public/uploads/file.jpg
   ```

2. Update database records to point to new R2 URLs

3. Optionally delete local files after verification

## Troubleshooting

### Files not uploading?

1. Check environment variables are set correctly
2. Verify API token has write permissions
3. Check Cloudflare dashboard for error logs
4. Verify bucket name matches exactly

### Files upload but can't be accessed?

1. Check bucket public access settings
2. Verify `R2_PUBLIC_URL` if using custom domain
3. Check DNS records if using custom domain
4. Try accessing file directly via R2 URL

### Getting 403 errors?

1. Regenerate API token with correct permissions
2. Verify Account ID is correct
3. Check token hasn't expired

## Production Deployment

When deploying to Vercel/production:

1. Add R2 environment variables to Vercel dashboard
2. Use production API tokens (different from dev)
3. Consider using a custom domain for better branding
4. Set up monitoring and alerts
5. Enable lifecycle policies to auto-delete old files (optional)

## Useful Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
