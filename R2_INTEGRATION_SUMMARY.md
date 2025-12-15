# R2 Integration Summary

## ✅ Completed Integration

The Cloudflare R2 storage is now fully integrated with signed URL support for private buckets.

## Configuration

### Environment Variables (.env.local)
```env
R2_ENDPOINT="https://31a8686f2686559c691fef188e4e30b6.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="5763bddb7ac0efa2041d19810787dd99"
R2_SECRET_ACCESS_KEY="dfa1884317bda0bdf43890dc08c91b7eea34901c87fa8b125c65c09d88fb5317"
R2_BUCKET="flowquote"
R2_ACCOUNT_ID="31a8686f2686559c691fef188e4e30b6"
R2_USE_SIGNED_URLS=true
```

## Architecture

### Storage Pattern: `r2:key` Prefix

Instead of storing full URLs in the database, we store R2 keys with the `r2:` prefix:

**Database stores:**
- `r2:logos/1234567890-abc-logo.png`
- `r2:requests/1234567890-xyz-photo.jpg`

**Benefits:**
- Works with private buckets (signed URLs)
- Easy migration between storage backends
- No hardcoded URLs in database
- Supports URL expiration and rotation

### URL Resolution Flow

```
Client Request
    ↓
Database (r2:key)
    ↓
POST /api/media-url { refs: ["r2:key1", "r2:key2"] }
    ↓
Generate Signed URLs (10min expiration)
    ↓
Return URLs to Client
    ↓
Client displays images
```

## Components Updated

### 1. lib/r2.ts
- `isR2Configured()` - Check if R2 env vars are set
- `getR2Client()` - Lazy S3 client initialization
- `uploadToR2AndReturnKey()` - Upload and return key only
- `getSignedR2Url()` - Generate signed URL (10min default)
- `getPublicR2Url()` - Generate public URL (for public buckets)
- `deleteFromR2()` - Delete object by key
- `generateFileKey()` - Generate unique key with prefix

### 2. app/api/media-url/route.ts
**New endpoint for batch URL resolution**
- Accepts array of refs: `["r2:key1", "/uploads/local.jpg"]`
- Returns array of URLs (signed or public based on `R2_USE_SIGNED_URLS`)
- Maintains index alignment for efficient batch processing
- Pass-through for local files (backward compatibility)

### 3. app/api/intake/route.ts
**Updated to store R2 keys**
- Uploads files to R2
- Stores `r2:key` in database (not full URL)
- Falls back to local storage if R2 not configured

### 4. app/api/business/logo/route.ts
**Updated for logo uploads**
- POST: Upload logo, store `r2:key` reference
- DELETE: Extract key from `r2:` prefix and delete from R2
- Handles old logo cleanup

### 5. components/requests/MediaGallery.tsx
**Client-side URL resolution**
- Detects `r2:` prefix in mediaUrls array
- Batch resolves URLs via `/api/media-url`
- Caches resolved URLs in state
- Handles mixed local/R2 references

### 6. lib/hooks/useMediaUrl.ts
**New React hook for single URL resolution**
- `useMediaUrl(ref)` - Resolves `r2:key` to signed URL
- Used by Header component for logo display
- Automatic re-resolution when ref changes
- Handles loading and error states

### 7. components/layout/Header.tsx
**Updated to use useMediaUrl hook**
- Resolves logo URL before displaying
- Shows fallback while loading
- Works with both R2 and local logos

## File Storage Structure

```
R2 Bucket: flowquote/
├── logos/
│   └── <timestamp>-<random>-<sanitized-name>.ext
└── requests/
    └── <timestamp>-<random>-<sanitized-name>.ext
```

## Security Features

1. **Private Bucket Support**
   - Files not publicly accessible
   - Access via signed URLs only
   - 10-minute expiration (configurable)

2. **Secure Credentials**
   - Never exposed to client
   - Server-side only
   - In `.env.local` (gitignored)

3. **Automatic Cleanup**
   - Old logos deleted when uploading new ones
   - No orphaned files in R2

## Backward Compatibility

The system supports mixed storage:
- **R2 files**: `r2:key` format
- **Local files**: `/uploads/path` format
- Both work seamlessly in same database

## Testing R2 Integration

### 1. Upload Logo
```bash
# Settings page → Upload Logo
# Check database: logoUrl should be "r2:logos/..."
# Check R2 dashboard: File should appear in flowquote bucket
```

### 2. Submit Intake Form
```bash
# /intake/[businessId] → Upload photos
# Check database: mediaUrls should contain ["r2:requests/..."]
# Check R2 dashboard: Files should appear
```

### 3. View Media
```bash
# View request detail page
# Photos should load from R2 via signed URLs
# Check Network tab: URLs should be .r2.cloudflarestorage.com with signature
```

## Performance Considerations

1. **Batch URL Resolution**
   - MediaGallery resolves all URLs in one API call
   - Reduces number of requests
   - Better performance for galleries with many images

2. **URL Caching**
   - Signed URLs cached client-side
   - Valid for 10 minutes
   - Automatically re-resolved when expired

3. **Lazy Client Initialization**
   - S3 client created only when needed
   - Avoids initialization overhead
   - Better cold start performance

## Migration from Local Storage

If you have existing local files:

1. **Keep existing data**
   - Local `/uploads/*` paths continue to work
   - No migration required for old data

2. **New uploads use R2**
   - All new files go to R2 automatically
   - Gradual migration as users upload new content

3. **Optional bulk migration**
   ```bash
   # Use wrangler CLI or custom script to upload existing files
   # Update database records to r2:key format
   ```

## Cost Estimate

With R2_USE_SIGNED_URLS=true and flowquote bucket:

- **Storage**: ~$0.015/GB/month
- **Class A (uploads)**: ~$0.0045/million
- **Class B (signed URL generation)**: ~$0.0002/million
- **Egress**: FREE (Cloudflare R2 advantage!)

For 100 requests/month with 5 photos each:
- Storage: ~0.5GB = $0.0075/month
- Operations: ~500 uploads + 2500 signed URLs ≈ $0.001/month
- **Total: ~$0.01/month** 🎉

## Troubleshooting

### Files not uploading?
1. Check `R2_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` are set
2. Verify bucket name matches exactly ("flowquote")
3. Check Cloudflare dashboard for errors

### Images not loading?
1. Check `R2_USE_SIGNED_URLS=true` is set
2. Verify signed URLs are being generated (check Network tab)
3. Check signed URL hasn't expired (10min default)

### Getting 403 errors?
1. Regenerate API token with Object Read & Write permissions
2. Verify token hasn't expired
3. Check bucket permissions in Cloudflare dashboard

## Next Steps

1. ✅ R2 integration complete
2. ⏳ Monitor usage in Cloudflare dashboard
3. ⏳ Consider setting up custom domain for branding
4. ⏳ Optionally migrate existing local files to R2
5. ⏳ Set up lifecycle policies for auto-cleanup (optional)

## Production Checklist

- [ ] Verify R2 credentials in production environment
- [ ] Set `R2_USE_SIGNED_URLS=true` in production
- [ ] Monitor R2 usage and costs
- [ ] Set up billing alerts
- [ ] Consider custom domain for better performance
- [ ] Test file upload/download end-to-end
- [ ] Verify old logo cleanup works correctly
