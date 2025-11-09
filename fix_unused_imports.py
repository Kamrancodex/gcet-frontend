#!/usr/bin/env python3
import re

# Define files and their unused imports to remove
fixes = {
    "src/components/dashboard/DashboardWidgets.tsx": ["MoreVertical", "Maximize2", "Minimize2"],
    "src/components/dashboard/NoticeModal.tsx": ["LinkIcon", "Calendar", "Users", "AlertCircle", "FileText"],
    "src/components/dashboard/OpenAdmissionModal.tsx": ["Calendar", "DollarSign", "Clock"],
    "src/components/dashboard/RegistrationDetailsModal.tsx": ["FileText", "MapPin"],
    "src/components/dashboard/widgets/index.tsx": ["Clock"],
    "src/components/NoticesSection.tsx": [],  # Has PriorityColors const to remove
    "src/components/NoticeViewModal.tsx": [],  # Has handleDownload function to remove
    "src/components/payment/PaymentMethodSelector.tsx": [],  # Has handleBack function to remove
    "src/components/registration/LibraryNOCModal.tsx": ["DollarSign"],
    "src/components/social/NotificationPanel.tsx": ["Heart"],
    "src/components/social/SocialSidebar.tsx": ["MessageCircle"],
    "src/pages/dashboard/Admissions.tsx": ["Filter", "FileText"],
    "src/pages/dashboard/LibraryNOC.tsx": ["Clock"],
    "src/pages/dashboard/LibraryStudents.tsx": ["Phone"],
    "src/pages/dashboard/Notices.tsx": ["Eye"],
    "src/pages/dashboard/OutstandingBooks.tsx": ["Filter", "Phone"],
    "src/pages/dashboard/SemesterRegistration.tsx": ["Filter", "FileText"],
    "src/pages/social/LostFound.tsx": ["Filter", "MapPin", "Calendar", "User", "ArrowUp", "MessageCircle", "Eye", "Clock"],
}

def remove_imports_from_line(line, imports_to_remove):
    """Remove specific imports from an import line"""
    for imp in imports_to_remove:
        # Remove the import and any trailing comma/whitespace
        line = re.sub(rf'\s*{re.escape(imp)},?\s*', '', line)
    return line

def fix_file(filepath, imports_to_remove):
    """Remove unused imports from a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        modified = False
        new_lines = []
        in_import_block = False
        
        for i, line in enumerate(lines):
            if 'from "lucide-react"' in line or 'from \'lucide-react\'' in line:
                in_import_block = False
            
            if in_import_block or ('{' in line and i > 0 and 'import' in lines[i-1]):
                in_import_block = True
                new_line = remove_imports_from_line(line, imports_to_remove)
                if new_line != line:
                    modified = True
                new_lines.append(new_line)
            else:
                new_lines.append(line)
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"✅ Fixed {filepath}")
        else:
            print(f"⏭️  Skipped {filepath} (no changes needed)")
            
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")

# Apply fixes
for filepath, imports in fixes.items():
    if imports:
        fix_file(filepath, imports)

print("\n✅ All unused imports removed!")

