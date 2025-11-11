# Gatherwise Web App - Vercel Deployment Guide

## Pre-Deployment Checklist

### 1. Database Setup

This app uses **Prisma Postgres with Accelerate** for optimal performance on Vercel.

#### Create Prisma Postgres Database

1. Go to [Prisma Data Platform](https://console.prisma.io/)
2. Create a new project
3. Create a new Postgres database
4. Enable Accelerate for connection pooling
5. Copy both connection strings:
   - `DATABASE_URL` (Accelerate connection - starts with `prisma+postgres://`)
   - `DIRECT_DATABASE_URL` (Direct connection for migrations)

### 2. Environment Variables Setup

Configure these environment variables in Vercel:

#### Required Database Variables:
```bash
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY
DIRECT_DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

#### Required Auth Variables:
```bash
# Generate a secure secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-app-domain.vercel.app
```

#### Application URLs:
```bash
GW_WEB_APP_URL=https://your-app-domain.vercel.app
NEXT_PUBLIC_GW_WEB_APP_URL=https://your-app-domain.vercel.app
```

#### Optional OAuth (if using Google auth):
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Vercel Deployment Steps

#### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build`
   - **Install Command**: `npm install && npx prisma generate`
   - **Output Directory**: `.next`
5. Add all environment variables (see section 2)
6. Click "Deploy"

### 4. Database Migration

After first deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma db push

# Or via Vercel dashboard
# Set up a one-time command in Vercel project settings
```

**Important**: Use `prisma db push` instead of `prisma migrate` when working with existing data.

### 5. Post-Deployment Configuration

#### Update OAuth Redirect URIs (if using Google auth)
Add your Vercel domain to Google Cloud Console:
- Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`

#### Test Critical Flows
1. User registration at `/test/register`
2. Login flow at `/login`
3. Onboarding process at `/onboarding`
4. Campus management
5. Dashboard access

### 6. Build Configuration

The project is configured to:
- Auto-generate Prisma Client before build
- Use Turbopack for faster builds (dev mode)
- Optimize images with AVIF/WebP formats
- Add security headers
- Enable compression

### 7. Monitoring & Debugging

#### View Logs
```bash
# Real-time logs
vercel logs

# Production logs
vercel logs --prod
```

#### Check Build Output
- Go to Vercel Dashboard → Deployments → Select deployment → View logs

#### Database Monitoring
- Monitor query performance in Prisma Accelerate dashboard
- Check connection pool usage
- Review slow queries

### 8. Performance Optimizations

Already configured:
- ✅ Prisma Accelerate for connection pooling
- ✅ Image optimization (AVIF/WebP)
- ✅ Compression enabled
- ✅ Security headers
- ✅ Turbopack for fast builds

### 9. Security Checklist

- [ ] Generate unique `NEXTAUTH_SECRET` (don't use example value)
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Verify database connection strings are secure
- [ ] Enable 2FA on Vercel account
- [ ] Restrict database access to Vercel IPs (optional)
- [ ] Review and update CORS policies if needed

### 10. Troubleshooting

#### Build Fails
- Check Prisma schema is valid: `npx prisma validate`
- Ensure all dependencies in package.json
- Review build logs for specific errors

#### Database Connection Issues
- Verify `DATABASE_URL` is using Accelerate endpoint
- Check `DIRECT_DATABASE_URL` for migrations
- Ensure database is accessible from Vercel region

#### Authentication Not Working
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Review NextAuth configuration in `/src/app/api/auth/[...nextauth]/route.ts`

#### Missing Environment Variables
- Ensure all variables are set in correct environment (Production/Preview)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

## Quick Reference

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### View Environment Variables
```bash
vercel env ls
```

### Pull Production Variables Locally
```bash
vercel env pull .env.production
```

### Run Migrations
```bash
npx prisma db push
```

### Seed Database (if needed)
```bash
npx tsx prisma/seed.ts
```

## Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Accelerate Docs](https://www.prisma.io/docs/accelerate)
- [NextAuth.js Docs](https://next-auth.js.org/)
