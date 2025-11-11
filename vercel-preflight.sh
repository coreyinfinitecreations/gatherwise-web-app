#!/bin/bash

echo "🔍 Vercel Deployment Pre-Flight Check - Gatherwise Web App"
echo "============================================================"

# Check if required files exist
echo ""
echo "📁 Checking required files..."
files=("package.json" "next.config.ts" "vercel.json" ".env.example" "prisma/schema.prisma")
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file missing"
  fi
done

# Check environment variables
echo ""
echo "🔐 Checking environment variables..."
if [ -f ".env.local" ]; then
  echo "✅ .env.local exists (local development)"
  
  vars=("DATABASE_URL" "DIRECT_DATABASE_URL" "NEXTAUTH_URL" "NEXTAUTH_SECRET")
  for var in "${vars[@]}"; do
    if grep -q "^$var=" .env.local; then
      echo "✅ $var is set"
    else
      echo "⚠️  $var not found in .env.local"
    fi
  done
else
  echo "⚠️  .env.local not found (make sure to set vars in Vercel)"
fi

# Check package.json scripts
echo ""
echo "📦 Checking build scripts..."
if grep -q '"build":' package.json; then
  echo "✅ Build script exists"
  grep '"build":' package.json
else
  echo "❌ Build script missing"
fi

if grep -q '"postinstall":' package.json; then
  echo "✅ Postinstall script exists (Prisma generate)"
else
  echo "⚠️  Postinstall script missing"
fi

# Check dependencies
echo ""
echo "📚 Checking key dependencies..."
deps=("next" "react" "react-dom" "@prisma/client" "prisma" "next-auth")
for dep in "${deps[@]}"; do
  if grep -q "\"$dep\":" package.json; then
    echo "✅ $dep installed"
  else
    echo "❌ $dep missing"
  fi
done

# Check Prisma setup
echo ""
echo "🗄️  Checking Prisma configuration..."
if [ -f "prisma/schema.prisma" ]; then
  echo "✅ Prisma schema exists"
  
  if grep -q 'provider = "postgresql"' prisma/schema.prisma; then
    echo "✅ PostgreSQL provider configured"
  fi
  
  if grep -q 'directUrl' prisma/schema.prisma; then
    echo "✅ Direct URL configured for migrations"
  fi
else
  echo "❌ Prisma schema missing"
fi

# Check Node version
echo ""
echo "🔧 System Information..."
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"

# Try Prisma validation
echo ""
echo "🔍 Validating Prisma schema..."
npx prisma validate
if [ $? -eq 0 ]; then
  echo "✅ Prisma schema is valid"
else
  echo "❌ Prisma schema has errors"
fi

# Try a test build
echo ""
echo "🏗️  Testing build process..."
read -p "Run test build? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm run build
  if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
  else
    echo "❌ Build failed - check errors above"
  fi
fi

echo ""
echo "============================================================"
echo "✨ Pre-flight check complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Review VERCEL_DEPLOYMENT.md for detailed setup"
echo "3. Deploy using 'vercel' command or Vercel dashboard"
echo "4. Run 'npx prisma db push' after first deployment"
