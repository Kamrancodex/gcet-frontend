#!/bin/bash

# Script to fix common frontend TypeScript build errors

echo "🔧 Fixing Frontend Build Errors..."

# Fix unused React imports
echo "1. Removing unused React imports..."
find src -name "*.tsx" -type f -exec sed -i 's/^import React, { /import { /g' {} \;
find src -name "*.tsx" -type f -exec sed -i '/^import React from "react";$/d' {} \;

# Run ESLint auto-fix
echo "2. Running ESLint auto-fix..."
npm run lint -- --fix 2>/dev/null || true

# Build with detailed errors
echo "3. Building frontend..."
npm run build

echo "✅ Done! Check output above for any remaining errors."

