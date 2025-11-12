import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfile } from '../lib/profile';
import { toLegacyProfile, isProfileCompleteEnough } from '../lib/profileMap';

/**
 * Smart CTA hook that routes users based on authentication and profile completeness
 * - Not logged in → /onboarding
 * - Logged in with incomplete profile → /onboarding
 * - Logged in with complete profile → /dashboard (with profile data)
 */
export const useSmartCta = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCtaClick = async () => {
    console.log('[Smart CTA] Click detected, user:', user?.id);

    // Case 1: Not logged in → send to onboarding
    if (!user) {
      console.log('[Smart CTA] No user logged in → /onboarding');
      navigate('/onboarding');
      return;
    }

    // Case 2: Logged in → check profile
    try {
      console.log('[Smart CTA] Fetching profile for user:', user.id);
      const profile = await fetchUserProfile(user.id);

      // Check if profile is complete enough
      if (profile && isProfileCompleteEnough(profile)) {
        console.log('[Smart CTA] Profile complete → /dashboard with data');
        const legacyProfile = toLegacyProfile(profile);
        navigate('/dashboard', { state: legacyProfile });
      } else {
        console.log('[Smart CTA] Profile incomplete or missing → /onboarding');
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('[Smart CTA] Error fetching profile:', error);
      console.log('[Smart CTA] Fallback → /onboarding');
      navigate('/onboarding');
    }
  };

  return { handleCtaClick };
};
