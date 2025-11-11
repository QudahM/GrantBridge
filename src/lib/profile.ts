import { supabase } from './supabase';

// Frontend interface (camelCase)
export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: string;
  country?: string;
  genderIdentity?: string;
  citizenship?: string;
  schoolStatus?: string;
  degreeType?: string;
  yearOfStudy?: string;
  fieldOfStudy?: string;
  gpa?: string;
  incomeBracket?: string;
  ethnicity?: string;
  identifiers?: string[];
  financialNeed?: boolean;
}

// Database interface (snake_case)
interface UserProfileDB {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  age?: string;
  country?: string;
  gender_identity?: string;
  citizenship?: string;
  school_status?: string;
  degree_type?: string;
  year_of_study?: string;
  field_of_study?: string;
  gpa?: string;
  income_bracket?: string;
  ethnicity?: string;
  identifiers?: string[];
  financial_need?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Convert camelCase frontend data to snake_case database format
 */
const toSnakeCase = (data: UserProfileData): Partial<UserProfileDB> => {
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    age: data.age,
    country: data.country,
    gender_identity: data.genderIdentity,
    citizenship: data.citizenship,
    school_status: data.schoolStatus,
    degree_type: data.degreeType,
    year_of_study: data.yearOfStudy,
    field_of_study: data.fieldOfStudy,
    gpa: data.gpa,
    income_bracket: data.incomeBracket,
    ethnicity: data.ethnicity,
    identifiers: data.identifiers,
    financial_need: data.financialNeed,
  };
};

/**
 * Convert snake_case database data to camelCase frontend format
 */
const toCamelCase = (data: UserProfileDB): UserProfileData => {
  return {
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    age: data.age,
    country: data.country,
    genderIdentity: data.gender_identity,
    citizenship: data.citizenship,
    schoolStatus: data.school_status,
    degreeType: data.degree_type,
    yearOfStudy: data.year_of_study,
    fieldOfStudy: data.field_of_study,
    gpa: data.gpa,
    incomeBracket: data.income_bracket,
    ethnicity: data.ethnicity,
    identifiers: data.identifiers,
    financialNeed: data.financial_need,
  };
};

/**
 * Fetch user profile from Supabase
 * @param userId - The user's ID from Supabase Auth
 * @returns User profile data or null if not found
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfileData | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return toCamelCase(data as UserProfileDB);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Create or update user profile in Supabase
 * @param userId - The user's ID from Supabase Auth
 * @param payload - The profile data to save
 * @returns The saved profile data
 */
// profile.ts
export const upsertUserProfile = async (
  userId: string,
  payload: UserProfileData
): Promise<UserProfileData> => {
  // Strip empty strings → undefined (so they become NULL via defaultToNull)
  const clean = Object.fromEntries(
    Object.entries(payload).map(([k, v]) => [k, v === "" ? undefined : v])
  ) as UserProfileData;

  const dbData = toSnakeCase(clean);

  // Debug log the exact payload headed to DB
  console.log("[upsertUserProfile] userId:", userId);
  console.log("[upsertUserProfile] dbData:", dbData);

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      [{ id: userId, ...dbData, updated_at: new Date().toISOString() }],
      { onConflict: "id", defaultToNull: true }
    )
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[upsertUserProfile] Supabase error:", error);
    // Common RLS miss: auth.uid() != id or user not logged in
    // Common type miss: identifiers must be string[] (not numbers or mixed)
    throw error;
  }

  console.log("[upsertUserProfile] returned row:", data);
  if (!data) throw new Error("Upsert returned no row (check RLS/select policy).");

  return toCamelCase(data as UserProfileDB);
};
/**
 * Delete user profile from Supabase
 * @param userId - The user's ID from Supabase Auth
 */
export const deleteUserProfile = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};