# Vercel Deployment - Quick Start

## ✅ Project Ready for Deployment

The gatherwise-web-app is configured and ready to deploy to Vercel.

## 🚀 Deploy Now

### Option 1: Vercel CLI (Recommended)

```bash
cd /Users/owenscorey/Documents/Gatherwise/gatherwise-web-app
npx vercel
```

### Option 2: Vercel Dashboard

1. Visit [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js
4. Add environment variables (see below)
5. Click "Deploy"

## 🔐 Required Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Database (from Prisma Postgres)
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY
DIRECT_DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

# Application URLs
GW_WEB_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_GW_WEB_APP_URL=https://your-app.vercel.app

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 📋 Post-Deployment Steps

1. **Run Database Migration**

   ```bash
   # Pull production env vars
   npx vercel env pull .env.production

   # Push database schema
   npx prisma db push
   ```

2. **Verify Deployment**
   - Visit your deployed URL
   - Test registration at `/test/register`
   - Test login at `/login`
   - Complete onboarding flow

## 📚 Documentation

For detailed instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## ✨ Build Successfully Tested

```
✓ Build completed successfully
✓ All TypeScript checks passed
✓ 25 routes generated
✓ Ready for production deployment
```
