/**
 * CACHED GRANTS PIPELINE
 * 
 * This module handles the automated syncing of grants to Supabase for fast homepage rendering.
 * 
 * FLOW:
 * 1. Fetch grants from Sonar API using a default STEM profile
 * 2. Transform and limit to 5 grants maximum
 * 3. Clear existing grants in Supabase
 * 4. Insert 5 new grants (all marked as featured)
 * 5. Homepage randomly selects 3 from the 5 for variety
 * 
 * SCHEDULING:
 * - Automatic: Every 7 days at 2 AM (via cron in index.ts)
 * - Auto-sync: When cache is older than 7 days (triggered by user requests)
 * - Manual: POST /api/sync-grants endpoint
 * 
 * ENDPOINTS:
 * - GET /api/featured-grants - Randomly selects 3 from 5 cached grants (used by homepage)
 * - POST /api/grants - Live search with user profile (used by dashboard)
 */

import fetch from 'node-fetch';
import { supabaseAdmin } from './supabaseClient';

// Sample profile for fetching diverse grants
const defaultProfile = {
  age: 20,
  country: "United States",
  gender: "Student",
  citizenship: "Citizenship",
  education: "Undergraduate",
  degreeType: "Bachelor's",
  yearOfStudy: "3rd Year",
  fieldOfStudy: "Computer Science",
  gpa: "3.5",
  incomeBracket: "25k-50k",
  financialNeed: true,
  ethnicity: "Not specified",
  identifiers: ["STEM"],
};

interface GrantFromSonar {
  title: string;
  description?: string;
  amount?: string;
  deadline?: string;
  eligibility?: string;
  organization?: string;
  requirements?: string;
  tags?: string;
  link?: string;
}

interface GrantForSupabase {
  id: string;
  source: string;
  title: string;
  organization: string;
  description: string;
  link: string;
  amount: string;
  amount_numeric: number;
  currency: string;
  deadline: string;
  tags: string[];
  eligibility: string[];
  requirements: string[];
  popularity: number;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Parse amount string to extract numeric value and currency
 */
function parseAmount(amountStr: string): { numeric: number; currency: string } {
  if (!amountStr || amountStr.toLowerCase() === 'varies') {
    return { numeric: 0, currency: 'USD' };
  }

  // Remove commas and extract numbers
  const numMatch = amountStr.match(/[\d,]+/);
  if (!numMatch) {
    return { numeric: 0, currency: 'USD' };
  }

  const numeric = parseInt(numMatch[0].replace(/,/g, ''), 10);

  // Detect currency
  let currency = 'USD';
  if (amountStr.includes('€') || amountStr.toLowerCase().includes('eur')) {
    currency = 'EUR';
  } else if (amountStr.includes('£') || amountStr.toLowerCase().includes('gbp')) {
    currency = 'GBP';
  } else if (amountStr.includes('CAD')) {
    currency = 'CAD';
  }

  return { numeric, currency };
}

/**
 * Fetch grants from Sonar API
 */
async function fetchGrantsFromSonar(): Promise<GrantFromSonar[]> {
  const { age, country, gender, citizenship, education, degreeType, yearOfStudy, fieldOfStudy, gpa, incomeBracket, financialNeed, ethnicity, identifiers } = defaultProfile;

  const dynamicQuery = `
    List as many recent and upcoming scholarships or grants (from the current and next few years) as possible for:
    * a ${age}-year-old
    * ${identifiers.join(", ")} ${gender}
    * studying ${education} (${degreeType}) in ${country}
    * Year of Study: ${yearOfStudy}
    * Field of Study: ${fieldOfStudy}
    * GPA: ${gpa}
    * Household Income: ${incomeBracket} (${financialNeed ? 'financial need' : 'not financial need'})
    * Ethnicity: ${ethnicity}
    * Citizenship: ${citizenship}
    
    Provide for each grant:
    * Title
    * Full Description
    * Amount (USD if possible, else "Varies")
    * Deadline (specific date in YYYY-MM-DD format)
    * Eligibility (bullet points)
    * Organization
    * Requirements
    * Tags (e.g., STEM, Women, First-Gen)
    * Link (to official grant website or application page)

    Respond ONLY in JSON array format like:
    [{"title":"","description":"","amount":"","deadline":"","eligibility":"","organization":"","requirements":"","tags":"","link":""}]
  `.trim();

  const sonarResponse = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: "You are a scholarship recommendation engine. Always respond strictly in JSON array format.",
        },
        {
          role: "user",
          content: dynamicQuery,
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                amount: { type: "string" },
                deadline: { type: "string" },
                eligibility: { type: "string" },
                organization: { type: "string" },
                requirements: { type: "string" },
                tags: { type: "string" },
                link: { type: "string" },
              },
              required: ["title", "organization", "amount"],
            },
          },
        },
      },
      max_tokens: 2000,
      temperature: 0.2,
    }),
  });

  if (!sonarResponse.ok) {
    const errorText = await sonarResponse.text();
    throw new Error(`Sonar API error: ${errorText}`);
  }

  const sonarData = await sonarResponse.json() as {
    choices?: { message?: { content?: string } }[];
  };

  const replyContent = sonarData.choices?.[0]?.message?.content ?? '';
  return JSON.parse(replyContent);
}

/**
 * Transform Sonar grants to Supabase format
 */
function transformGrantsForSupabase(grants: GrantFromSonar[]): GrantForSupabase[] {
  return grants.map((grant) => {
    const { numeric, currency } = parseAmount(grant.amount || 'Varies');

    // Generate a unique ID based on title and organization
    const id = `${grant.organization?.toLowerCase().replace(/\s+/g, '-')}-${grant.title?.toLowerCase().replace(/\s+/g, '-')}`.substring(0, 100);

    return {
      id,
      source: 'sonar',
      title: grant.title || 'Untitled Grant',
      organization: grant.organization || 'Unknown Organization',
      description: grant.description || '',
      link: grant.link || `https://www.google.com/search?q=${encodeURIComponent(grant.title || '')}`,
      amount: grant.amount || 'Varies',
      amount_numeric: numeric,
      currency,
      deadline: grant.deadline || '2026-12-31',
      tags: grant.tags ? grant.tags.split(',').map(t => t.trim()) : [],
      eligibility: grant.eligibility
        ? grant.eligibility.split(/[•\n]/).map(e => e.trim()).filter(e => e.length > 0)
        : ['Eligibility not specified'],
      requirements: grant.requirements
        ? grant.requirements.split(/(?<!\band\b)(?:•|\n|;)/i).map(r => r.trim()).filter(r => r.length > 0)
        : [],
      popularity: Math.floor(Math.random() * 100), // Random popularity for variety
      is_featured: true, // All stored grants are featured
      // Note: created_at and updated_at will be auto-generated by Supabase if columns exist
    };
  });
}

/**
 * Main sync function - fetches grants from Sonar and upserts to Supabase
 * Maintains at most 5 grants in the database for homepage featured section
 * Auto-triggered when cache is older than 7 days
 */
export async function syncGrantsToSupabase(): Promise<void> {
  try {
    console.log('[GrantsSync] Starting grants sync...');

    // Fetch grants from Sonar
    console.log('[GrantsSync] Fetching grants from Sonar API...');
    const sonarGrants = await fetchGrantsFromSonar();
    console.log(`[GrantsSync] Received ${sonarGrants.length} grants from Sonar`);

    // Transform to Supabase format and limit to 5
    let grantsForSupabase = transformGrantsForSupabase(sonarGrants);

    // Limit to 5 grants maximum for homepage featured section
    if (grantsForSupabase.length > 5) {
      console.log(`[GrantsSync] Limiting from ${grantsForSupabase.length} to 5 grants`);
      grantsForSupabase = grantsForSupabase.slice(0, 5);
    }

    console.log(`[GrantsSync] Transformed ${grantsForSupabase.length} grants for Supabase`);

    // Clear existing grants before inserting new ones
    console.log('[GrantsSync] Clearing existing grants from grants_cache...');
    const { error: deleteError } = await supabaseAdmin
      .from('grants_cache')
      .delete()
      .neq('id', ''); // Delete all rows

    if (deleteError) {
      console.warn('[GrantsSync] Warning during delete:', deleteError.message);
    }

    // Mark all grants as featured since we only store 5
    grantsForSupabase = grantsForSupabase.map(grant => ({
      ...grant,
      is_featured: true
    }));

    // Insert new grants
    console.log('[GrantsSync] Inserting new grants to grants_cache...');
    const { error } = await supabaseAdmin
      .from('grants_cache')
      .insert(grantsForSupabase);

    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    console.log(`[GrantsSync] Successfully inserted ${grantsForSupabase.length} grants to Supabase`);

    // Try to refresh materialized view if it exists
    console.log('[GrantsSync] Attempting to refresh popular_open materialized view...');
    const { error: refreshError } = await supabaseAdmin.rpc('refresh_popular_open');

    if (refreshError) {
      console.warn('[GrantsSync] Materialized view refresh warning:', refreshError.message);
      console.log('[GrantsSync] Continuing without materialized view refresh');
    } else {
      console.log('[GrantsSync] Successfully refreshed popular_open view');
    }

    console.log('[GrantsSync] Grants sync completed successfully!');

  } catch (error) {
    console.error('[GrantsSync] Error during grants sync:', error);
    throw error;
  }
}
