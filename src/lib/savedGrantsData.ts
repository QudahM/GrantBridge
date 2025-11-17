import { supabase } from './supabase';
import { Grant } from './types';

/**
 * Fetch full grant data for saved grants
 * This fetches the actual grant details from grants_cache table
 */
export const fetchSavedGrantsData = async (userId: string): Promise<Grant[]> => {
  try {
    // Fetch saved grants with their stored data
    const { data: savedGrants, error: savedError } = await supabase
      .from('saved_grants')
      .select('grant_id, grant_data')
      .eq('user_id', userId);

    if (savedError) {
      console.error('[SavedGrantsData] Error fetching saved grants:', savedError);
      return [];
    }

    if (!savedGrants || savedGrants.length === 0) {
      console.log('[SavedGrantsData] No saved grants found');
      return [];
    }

    console.log('[SavedGrantsData] Found saved grants:', savedGrants.length);

    // Use stored grant_data if available, otherwise try to fetch from grants_cache
    const grants: Grant[] = [];
    const idsToFetchFromCache: string[] = [];

    for (const saved of savedGrants) {
      if (saved.grant_data) {
        // Use stored data
        grants.push(saved.grant_data as Grant);
      } else {
        // Need to fetch from cache
        idsToFetchFromCache.push(saved.grant_id);
      }
    }

    // Fetch any grants that don't have stored data from grants_cache
    if (idsToFetchFromCache.length > 0) {
      console.log('[SavedGrantsData] Fetching from cache for IDs:', idsToFetchFromCache);
      const { data: cachedGrants, error: cacheError } = await supabase
        .from('grants_cache')
        .select('*')
        .in('id', idsToFetchFromCache);

      if (cacheError) {
        console.error('[SavedGrantsData] Error fetching from cache:', cacheError);
      } else if (cachedGrants) {
        grants.push(...cachedGrants.map((grant: any) => ({
          id: grant.id,
          title: grant.title || 'Untitled Grant',
          organization: grant.organization || 'Unknown Organization',
          amount: grant.amount || '$0',
          deadline: grant.deadline || 'No deadline',
          eligibility: Array.isArray(grant.eligibility) ? grant.eligibility : [],
          requirements: Array.isArray(grant.requirements) ? grant.requirements : [],
          description: grant.description || '',
          tags: Array.isArray(grant.tags) ? grant.tags : [],
          difficulty: (grant.difficulty as "Easy" | "Medium" | "Hard") || 'Medium',
          link: grant.link || '',
        })));
      }
    }

    console.log('[SavedGrantsData] Total grants loaded:', grants.length);
    return grants;
  } catch (error) {
    console.error('[SavedGrantsData] Unexpected error:', error);
    return [];
  }
};
