# Bulk Delete Users Feature

## Summary
Added bulk delete functionality to the User Management page, allowing admins to select and delete multiple users at once.

## Changes Made

### Frontend (React)

**src/pages/Users.jsx**
- Added `selectedUserIds` state (Set) to track selected user checkboxes
- Added `showBulkDeleteConfirm` state for confirmation dialog
- Added `toggleUserSelection(userId)` function to handle checkbox toggle
- Added `toggleSelectAll()` function for "Select All" / "Deselect All"
- Added `handleBulkDeleteClick()` to initiate bulk delete
- Added `handleBulkDeleteConfirm()` to execute bulk delete API call
- Updated header to show selected count and bulk delete button (red)
- Added "Select All" button in filter section (orange when active)
- Updated user rows with:
  - Checkbox input (disabled for current user)
  - Selected state styling (orange background when selected)
- Added bulk delete confirmation dialog showing count of users to delete

**src/services/sheets.js**
- Added `bulkDeleteUsersInSheet(token, userIds)` function
- POST request to Google Apps Script with action='bulkDeleteUsers'
- Automatically invalidates users cache after deletion
- Uses request queue and retry logic (2 retries, 1s backoff)

### Backend (Google Apps Script)

**docs/appscript/crud.js**
- Added `handleBulkDeleteUsers(params)` function
- Parameters: {token, userIds}
- Admin token verification
- Prevents deleting own account
- Deletes multiple users by ID from Users sheet
- Returns: {status, message, deleted: count}

**docs/appscript/main_handlers.js**
- Added POST case for 'bulkDeleteUsers'
- Routes to `handleBulkDeleteUsers(params)`

## Features
✅ Select individual users with checkboxes
✅ Select/deselect all visible (paginated) users
✅ Prevents selecting own account
✅ Shows count of selected users in header
✅ Bulk delete button appears only when users are selected
✅ Confirmation dialog before deletion
✅ Admin-only operation with token verification
✅ Automatic reload of users list after deletion
✅ Toast notifications for success/error

## UI Elements
- **Select All Button**: Orange when active, appears in filter section
- **Bulk Delete Button**: Red danger color, shows count
- **Selected Rows**: Orange background highlight
- **Checkbox**: Disabled for current logged-in user
- **Confirmation Dialog**: Shows count of users to delete

## Safety Features
- Only admins can bulk delete
- Cannot delete own account
- Confirmation dialog required
- 1.5s delay before reload to ensure backend processing
- Cache invalidation for fresh data
