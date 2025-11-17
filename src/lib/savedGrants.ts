import { supabase } from './supabase';

export interface SavedGrant {
  id: string;
  user_id: string;
  grant_id: string;
  created_at: string;
}

/**
 * Fetch all saved grants for a user
 */
export const fetchSavedGrants = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_grants')
      .select('grant_id')
      .eq('user_id', userId);

    if (error) {
      console.error('[SavedGrants] Error fetching saved grants:', error);
      return [];
    }

    return data?.map(item => item.grant_id) || [];
  } catch (error) {
    console.error('[SavedGrants] Unexpected error:', error);
    return [];
  }
};

/**
 * Save a grant for a user
 * Now also stores the full grant data in saved_grants table
 */
export const saveGrant = async (userId: string, grantId: string, grantData?: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_grants')
      .insert({
        user_id: userId,
        grant_id: grantId,
        grant_data: grantData || null, // Store full grant data as JSONB
      });

    if (error) {
      console.error('[SavedGrants] Error saving grant:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[SavedGrants] Unexpected error:', error);
    return false;
  }
};

/**
 * Remove a saved grant for a user
 */
export const unsaveGrant = async (userId: string, grantId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_grants')
      .delete()
      .eq('user_id', userId)
      .eq('grant_id', grantId);

    if (error) {
      console.error('[SavedGrants] Error removing saved grant:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[SavedGrants] Unexpected error:', error);
    return false;
  }
};

/**
 * Check if a grant is saved by a user
 */
export const isGrantSaved = async (userId: string, grantId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('saved_grants')
      .select('id')
      .eq('user_id', userId)
      .eq('grant_id', grantId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('[SavedGrants] Error checking saved grant:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('[SavedGrants] Unexpected error:', error);
    return false;
  }
};
