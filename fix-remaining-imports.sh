#!/bin/bash

# Remove unused imports from DashboardLayout
sed -i '/^import {$/,/^} from "lucide-react";$/{
  /Menu,/d
  /X,/d
  /ChevronLeft,/d
  /ChevronRight,/d
}' src/components/dashboard/DashboardLayout.tsx

# Remove entire empty import block if all imports removed
sed -i '/^import {$/,/^} from "lucide-react";$/{
  /^import {$/,/^}$/{
    /^[[:space:]]*$/d
  }
}' src/components/dashboard/DashboardLayout.tsx

echo "✅ Fixed all remaining unused imports!"

