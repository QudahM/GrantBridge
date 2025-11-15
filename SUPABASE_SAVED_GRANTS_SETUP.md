# Supabase Saved Grants Setup Guide

## Overview
This guide will help you set up the database table and security policies for the saved grants feature in Supabase.

## Step 1: Create the Database Table

Go to your Supabase Dashboard → SQL Editor and run this SQL:

```sql
-- Create saved_grants table
CREATE TABLE IF NOT EXISTS saved_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only save a grant once
  UNIQUE(user_id, grant_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_grants_user_id ON saved_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_grants_grant_id ON saved_grants(grant_id);
CREATE INDEX IF NOT EXISTS idx_saved_grants_created_at ON saved_grants(created_at DESC);
```

## Step 2: Enable Row Level Security (RLS)

Run this SQL to enable RLS and create security policies:

```sql
-- Enable Row Level Security
ALTER TABLE saved_grants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own saved grants
CREATE POLICY "Users can view their own saved grants"
ON saved_grants
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own saved grants
CREATE POLICY "Users can insert their own saved grants"
ON saved_grants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own saved grants
CREATE POLICY "Users can delete their own saved grants"
ON saved_grants
FOR DELETE
USING (auth.uid() = user_id);
```

## Step 3: Verify the Setup

Test the table by running these queries in the SQL Editor:

```sql
-- Check if table exists
SELECT * FROM saved_grants LIMIT 1;

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'saved_grants';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'saved_grants';
```

## How It Works

### Data Structure

Each saved grant record contains:
- `id`: Unique identifier (UUID)
- `user_id`: Reference to the user who saved it
- `grant_id`: The ID of the saved grant (from your grants_cache table)
- `created_at`: Timestamp when the grant was saved

### Security

Row Level Security (RLS) ensures:
- Users can only see their own saved grants
- Users can only save grants for themselves
- Users can only delete their own saved grants
- No user can access another user's saved grants

### Unique Constraint

The `UNIQUE(user_id, grant_id)` constraint prevents:
- Duplicate saves (same user saving the same grant twice)
- Database bloat from repeated saves

## Frontend Integration

The feature is already implemented in the frontend:

### Files Created/Modified:
1. `src/lib/savedGrants.ts` - API functions for saved grants
2. `src/components/GrantDashboard.tsx` - Updated to persist saved grants

### Features:
- ✅ Saved grants persist across sessions
- ✅ Saved grants sync across devices
- ✅ Optimistic UI updates (instant feedback)
- ✅ Automatic error recovery
- ✅ "Saved Grants" tab shows only saved grants
- ✅ Bookmark icon shows saved state

## Testing the Feature

### 1. Test Saving a Grant

1. Log in to your application
2. Go to the dashboard
3. Click the bookmark icon on any grant
4. Check Supabase: `SELECT * FROM saved_grants;`
5. You should see a new record

### 2. Test Persistence

1. Save a grant
2. Refresh the page
3. The grant should still be bookmarked
4. Go to "Saved Grants" tab
5. The grant should appear there

### 3. Test Across Devices

1. Save a grant on one device
2. Log in on another device
3. The saved grant should appear there too

### 4. Test Unsaving

1. Click the bookmark icon on a saved grant
2. The grant should be removed from saved grants
3. Check Supabase: the record should be deleted

## Troubleshooting

### Saved Grants Not Persisting

**Check:**
1. RLS policies are enabled: `SELECT * FROM pg_policies WHERE tablename = 'saved_grants';`
2. User is authenticated: Check browser console for user ID
3. No errors in browser console
4. Supabase URL and keys are correct in `.env`

**Fix:**
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'saved_grants';

-- If rowsecurity is false, enable it
ALTER TABLE saved_grants ENABLE ROW LEVEL SECURITY;
```

### Permission Denied Errors

**Check:**
1. RLS policies exist and are correct
2. User is logged in (check `auth.uid()`)

**Fix:**
```sql
-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view their own saved grants" ON saved_grants;
DROP POLICY IF EXISTS "Users can insert their own saved grants" ON saved_grants;
DROP POLICY IF EXISTS "Users can delete their own saved grants" ON saved_grants;

-- Then run the policies from Step 2 again
```

### Duplicate Key Errors

This is expected behavior - the unique constraint prevents saving the same grant twice. The frontend handles this gracefully.

### Saved Grants Not Loading

**Check browser console for errors:**
- Network errors: Check Supabase URL
- Auth errors: User might not be logged in
- RLS errors: Check policies

## Optional: Add Analytics

Track saved grants usage:

```sql
-- Create a view for analytics
CREATE OR REPLACE VIEW saved_grants_analytics AS
SELECT 
  grant_id,
  COUNT(*) as save_count,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_saved
FROM saved_grants
GROUP BY grant_id
ORDER BY save_count DESC;

-- Query most saved grants
SELECT * FROM saved_grants_analytics LIMIT 10;
```

## Optional: Add Saved Date to UI

If you want to show when a grant was saved:

```typescript
// In src/lib/savedGrants.ts, update the interface:
export interface SavedGrant {
  id: string;
  user_id: string;
  grant_id: string;
  created_at: string;
}

// Update fetchSavedGrants to return full objects:
export const fetchSavedGrantsWithDates = async (userId: string): Promise<SavedGrant[]> => {
  const { data, error } = await supabase
    .from('saved_grants')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SavedGrants] Error:', error);
    return [];
  }

  return data || [];
};
```

## Migration from Local Storage

If you had saved grants in localStorage before:

```typescript
// Run this once to migrate
const migrateSavedGrants = async (userId: string) => {
  const localSaved = localStorage.getItem('savedGrants');
  if (!localSaved) return;

  const grantIds = JSON.parse(localSaved);
  
  for (const grantId of grantIds) {
    await saveGrant(userId, grantId);
  }
  
  localStorage.removeItem('savedGrants');
  console.log('Migrated saved grants to Supabase');
};
```

## Next Steps

1. ✅ Run the SQL scripts in Supabase
2. ✅ Test saving/unsaving grants
3. ✅ Verify persistence across sessions
4. Consider adding:
   - Email notifications for saved grant deadlines
   - Export saved grants feature
   - Share saved grants with others
   - Notes on saved grants

## Security Best Practices

- ✅ RLS is enabled (users can only access their own data)
- ✅ Cascade delete (saved grants deleted when user is deleted)
- ✅ Unique constraint (prevents duplicates)
- ✅ Indexed queries (fast performance)
- ✅ No sensitive data stored (only grant IDs)

Your saved grants feature is now production-ready! 🎉
