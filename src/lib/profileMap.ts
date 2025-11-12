import { UserProfileData } from './profile';

/**
 * Legacy profile format used by GrantDashboard
 */
export interface LegacyUserProfile {
  age: number;
  country: string;
  gender: string;
  citizenship: string;
  education: string;
  degreeType: string;
  yearOfStudy: string;
  fieldOfStudy: string;
  gpa: string;
  incomeBracket: string;
  financialNeed: boolean;
  ethnicity: string;
  identifiers: string[];
}

/**
 * Convert UserProfileData (from Supabase) to LegacyUserProfile (for dashboard)
 */
export const toLegacyProfile = (profile: UserProfileData): LegacyUserProfile => {
  return {
    age: profile.age ? parseInt(profile.age, 10) : 0,
    country: profile.country || '',
    gender: profile.genderIdentity || '',
    citizenship: profile.citizenship || '',
    education: profile.schoolStatus || '',
    degreeType: profile.degreeType || '',
    yearOfStudy: profile.yearOfStudy || '',
    fieldOfStudy: profile.fieldOfStudy || '',
    gpa: profile.gpa || '',
    incomeBracket: profile.incomeBracket || '',
    financialNeed: profile.financialNeed || false,
    ethnicity: profile.ethnicity || '',
    identifiers: profile.identifiers || [],
  };
};

/**
 * Check if a profile has enough data to use the dashboard
 * Minimum requirements: country, schoolStatus, and fieldOfStudy
 */
export const isProfileCompleteEnough = (profile: UserProfileData | null): boolean => {
  if (!profile) {
    console.log('[Profile Check] No profile found');
    return false;
  }

  const hasCountry = !!profile.country && profile.country.trim() !== '';
  const hasSchoolStatus = !!profile.schoolStatus && profile.schoolStatus.trim() !== '';
  const hasFieldOfStudy = !!profile.fieldOfStudy && profile.fieldOfStudy.trim() !== '';

  const isComplete = hasCountry && hasSchoolStatus && hasFieldOfStudy;

  console.log('[Profile Check]', {
    hasCountry,
    hasSchoolStatus,
    hasFieldOfStudy,
    isComplete,
  });

  return isComplete;
};
