# Cloudflare R2 Integration

This document describes the R2 integration for media storage, replacing Sanity CDN for video and audio files.

## Overview

The integration provides:
- **Presigned URL uploads** for files < 100MB
- **Multipart uploads** for files up to 1GB
- **Migration dashboard** to transfer existing Sanity CDN assets to R2
- **Backward compatibility** - supports both Sanity CDN and R2 URLs

## Environment Variables

Add these to your `.env.local`:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=rohit-media
R2_PUBLIC_URL=https://media.yourdomain.com

# Sanity API Token (for migration write operations)
SANITY_API_TOKEN=your_sanity_api_token_here
```

## API Routes

### Upload Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/r2/presign` | POST | Get presigned URL for single file upload (< 100MB) |
| `/api/r2/multipart/init` | POST | Initialize multipart upload |
| `/api/r2/multipart/upload-part` | POST | Get presigned URL for a part |
| `/api/r2/multipart/complete` | POST | Complete multipart upload |
| `/api/r2/multipart/abort` | POST | Abort multipart upload |
| `/api/r2/delete` | DELETE | Delete a file from R2 |

### Migration Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/r2/migrate` | POST | Migrate a single file from Sanity CDN to R2 |
| `/api/r2/migrate/list` | GET | List all assets pending migration |
| `/api/r2/migrate/update-sanity` | POST | Update Sanity document with R2 URL |

## Migration Dashboard

Access the migration dashboard at `/admin/migrate` to:

1. View all videos and audio files pending migration
2. See file sizes and migration status
3. Migrate individual files or all at once
4. Automatically update Sanity documents with new R2 URLs

## How It Works

### URL Resolution

The system uses a fallback approach:
1. Check for `r2VideoUrl` / `r2TrackUrl` field in Sanity document
2. If present and valid R2 URL, use it
3. Otherwise, fall back to Sanity CDN URL (`video.asset->url` / `track.asset->url`)

### Audio Proxy

- **Sanity CDN URLs**: Proxied through `/api/proxy-audio` for CORS
- **R2 URLs**: Used directly (R2 bucket has CORS configured)

## Sanity Schema Updates

After migration, your Sanity schemas should include these optional fields:

### Projects Schema
```typescript
defineField({
  name: 'r2VideoUrl',
  title: 'R2 Video URL',
  type: 'url',
  description: 'Video URL on Cloudflare R2 (auto-populated during migration)',
})
```

### Music Schema
```typescript
defineField({
  name: 'r2TrackUrl',
  title: 'R2 Track URL',
  type: 'url',
  description: 'Audio URL on Cloudflare R2 (auto-populated during migration)',
})
```

## File Structure

```
src/
├── lib/
│   └── r2.ts                          # R2 client and helpers
├── app/
│   ├── api/
│   │   └── r2/
│   │       ├── presign/route.ts       # Single file upload
│   │       ├── delete/route.ts        # Delete files
│   │       ├── migrate/
│   │       │   ├── route.ts           # Migrate single file
│   │       │   ├── list/route.ts      # List pending migrations
│   │       │   └── update-sanity/route.ts  # Update Sanity docs
│   │       └── multipart/
│   │           ├── init/route.ts
│   │           ├── upload-part/route.ts
│   │           ├── complete/route.ts
│   │           └── abort/route.ts
│   └── admin/
│       └── migrate/
│           └── page.tsx               # Migration dashboard
```

## Migration Steps

1. **Configure R2 bucket** with proper CORS settings
2. **Add environment variables** to `.env.local`
3. **Add Sanity API token** with Editor permissions
4. **Update Sanity schemas** to include `r2VideoUrl` and `r2TrackUrl` fields
5. **Access migration dashboard** at `/admin/migrate`
6. **Migrate assets** individually or in batch
7. **Verify** media plays correctly from R2

## CORS Configuration for R2

Ensure your R2 bucket has CORS configured:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Troubleshooting

### CORS Errors
- Verify R2 bucket CORS includes your domain
- Check that `R2_PUBLIC_URL` is correctly set

### Migration Fails
- Check network connectivity
- Verify Sanity CDN URL is accessible
- Check R2 credentials are valid

### Sanity Update Fails
- Ensure `SANITY_API_TOKEN` has Editor permissions
- Verify the token is not expired

### Audio Not Playing
- R2 URLs should work directly without proxy
- Sanity CDN URLs require the proxy route
