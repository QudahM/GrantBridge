import * as Sentry from "@sentry/node";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cron from "node-cron";
import fetch from "node-fetch";
import { syncGrantsToSupabase } from "./grantsSync";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Security headers with helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.perplexity.ai"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Secure CORS configuration
const allowedOrigins = [
  ...(process.env.FRONTEND_URL?.split(",").map((url) => url.trim()) || []),
  // Production fallback domains
  "https://grantbridge.online",
  "https://www.grantbridge.online",
  // Allow localhost for development
  ...(process.env.NODE_ENV === "development"
    ? [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
      ]
    : []),
].filter(Boolean) as string[];

console.log("[CORS] Temporarily allowing all origins for debugging");

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(
    `[REQUEST] ${req.method} ${req.path} from ${
      req.get("origin") || "no-origin"
    }`
  );
  next();
});

app.use(
  cors({
    origin: true, // Temporarily allow all origins for debugging
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  })
);

app.use(express.json());

// Rate limiting configuration
// General API rate limiter - applies to all /api/* routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict limiter for expensive Sonar API calls
const sonarLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 25, // 10 grant searches per hour per IP
  message: "Grant search limit reached. Please try again in an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for admin/sync endpoints
const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Only 1 manual sync per hour
  message: "Sync already triggered recently. Please wait an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all API routes
app.use("/api/", generalLimiter);

// Admin authentication middleware
const adminAuth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): any => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET;

  // If no admin secret is configured, log warning but allow (for backward compatibility)
  if (!adminSecret) {
    console.warn(
      "[Security] ADMIN_SECRET not configured - admin endpoints are unprotected!"
    );
    return next();
  }

  // Check if authorization header matches
  if (authHeader !== `Bearer ${adminSecret}`) {
    console.warn("[Security] Unauthorized admin access attempt");
    return res
      .status(401)
      .json({ error: "Unauthorized - Invalid admin credentials" });
  }

  next();
};

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      grants_cache: "active",
      live_search: "active",
      cron_sync: "scheduled",
    },
  });
});

// Sentry test endpoint - REMOVE IN PRODUCTION
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// Schedule grants sync every 7 days at 2 AM
// Cron format: minute hour day-of-month month day-of-week
// '0 2 */7 * *' = At 02:00 AM, every 7 days
cron.schedule("0 2 */7 * *", async () => {
  console.log("[Cron] Running scheduled grants sync...");
  try {
    await syncGrantsToSupabase();
  } catch (error) {
    console.error("[Cron] Scheduled sync failed:", error);
  }
});

console.log("[Server] Grants sync cron job scheduled (every 7 days at 2 AM)");

// Manual sync endpoint for testing/admin use
// Rate limited to 1 request per hour
// Protected with admin authentication
app.post(
  "/api/sync-grants",
  adminAuth,
  syncLimiter,
  async (req, res): Promise<any> => {
    try {
      console.log("[API] Manual grants sync triggered");
      await syncGrantsToSupabase();
      return res.json({ success: true, message: "Grants synced successfully" });
    } catch (error) {
      console.error("[API] Manual sync failed:", error);
      return res.status(500).json({ error: "Failed to sync grants" });
    }
  }
);

// Featured grants endpoint - fetches from Supabase cache and randomly selects 3
// Auto-syncs if cache is empty or stale (older than 7 days)
app.get("/api/featured-grants", async (_req, res): Promise<any> => {
  try {
    const { supabaseAdmin } = await import("./supabaseClient");

    console.log("[API] Fetching featured grants from grants_cache table...");

    // Fetch all featured grants from Supabase (should be 5)
    const { data, error } = await supabaseAdmin
      .from("grants_cache")
      .select("*")
      .eq("is_featured", true);

    if (error) {
      console.error("[API] Supabase error:", error.message);
      // Always return valid JSON, even on error
      return res.json([]);
    }

    // Check if cache is empty or stale (older than 7 days)
    const needsSync = !data || data.length === 0 || isGrantsCacheStale(data);

    if (needsSync) {
      console.log(
        "[API] Cache is empty or stale (>7 days), triggering background sync..."
      );

      // Trigger sync in background (don't wait for it)
      syncGrantsToSupabase().catch((err) => {
        console.error("[API] Background sync failed:", err);
      });

      // If we have some data (even if stale), return it immediately
      if (data && data.length > 0) {
        console.log("[API] Returning stale data while sync runs in background");
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);
        return res.json(selected);
      }

      // If no data at all, wait for sync to complete
      console.log("[API] No data available, waiting for sync to complete...");
      try {
        await syncGrantsToSupabase();

        // Fetch the newly synced grants
        const { data: newData, error: newError } = await supabaseAdmin
          .from("grants_cache")
          .select("*")
          .eq("is_featured", true);

        if (newError) {
          console.error(
            "[API] Failed to fetch grants after sync:",
            newError.message
          );
          return res.json([]);
        }

        if (!newData || newData.length === 0) {
          console.log("[API] No grants available after sync");
          return res.json([]);
        }

        const shuffled = [...newData].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);
        console.log("[API] Returning freshly synced grants");
        return res.json(selected);
      } catch (syncError) {
        console.error("[API] Sync failed:", syncError);
        // Always return valid JSON
        return res.json([]);
      }
    }

    // Cache is fresh, return data
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    console.log(
      `[API] Randomly selected ${selected.length} grants from ${data.length} available`
    );
    return res.json(selected);
  } catch (error) {
    console.error("[API] Error fetching featured grants:", error);
    // Always return valid JSON, even on error
    return res.json([]);
  }
});

// Helper function to check if grants cache is stale (older than 7 days)
function isGrantsCacheStale(grants: any[]): boolean {
  if (!grants || grants.length === 0) return true;

  // Check if any grant has a created_at or updated_at timestamp
  const latestGrant = grants[0];
  if (!latestGrant.created_at && !latestGrant.updated_at) {
    // No timestamp available, consider fresh (will rely on manual syncs)
    console.log("[API] No timestamp found, assuming cache is fresh");
    return false;
  }

  const timestamp = latestGrant.updated_at || latestGrant.created_at;
  const grantDate = new Date(timestamp);
  const now = new Date();
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

  const isStale = now.getTime() - grantDate.getTime() > sevenDaysInMs;

  if (isStale) {
    console.log(
      `[API] Cache is stale (${Math.floor(
        (now.getTime() - grantDate.getTime()) / (24 * 60 * 60 * 1000)
      )} days old)`
    );
  }

  return isStale;
}

// Grant search endpoint - Rate limited to 10 requests per hour (expensive Sonar API calls)
app.post("/api/grants", sonarLimiter, async (req, res): Promise<any> => {
  try {
    const {
      age,
      country,
      gender,
      citizenship,
      education,
      degreeType,
      yearOfStudy,
      fieldOfStudy,
      gpa,
      incomeBracket,
      financialNeed,
      ethnicity,
      identifiers = [],
    } = req.body;

    // Defensive validation
    if (
      typeof age !== "number" ||
      typeof country !== "string" ||
      typeof gender !== "string" ||
      typeof citizenship !== "string" ||
      typeof education !== "string" ||
      typeof degreeType !== "string" ||
      typeof yearOfStudy !== "string" ||
      typeof fieldOfStudy !== "string" ||
      typeof gpa !== "string" ||
      typeof incomeBracket !== "string" ||
      typeof financialNeed !== "boolean" ||
      typeof ethnicity !== "string" ||
      !Array.isArray(identifiers)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid user profile data received." });
    }

    const dynamicQuery = `
      List as many recent and upcoming scholarships or grants (from the current and next few years) as possible for:
      * a ${age}-year-old
      * ${identifiers.join(", ")} ${gender}
      * studying ${education} (${degreeType}) in ${country}
      * Year of Study: ${yearOfStudy}
      * Field of Study: ${fieldOfStudy}
      * GPA: ${gpa}
      * Household Income: ${incomeBracket} (${
      financialNeed ? "financial need" : "not financial need"
    })
      * Ethnicity: ${ethnicity}
      * Citizenship: ${citizenship}

      Provide for each grant:
      * Title
      * Full Description
      * Amount (USD if possible, else "Varies")
      * Deadline (specific date)
      * Eligibility (bullet points)
      * Organization
      * Requirements
      * Tags (e.g., STEM, Women, First-Gen)
      * Link (to official grant website or application page)

      Respond ONLY in JSON array format like:
      [{"title":"","description":"","amount":"","deadline":"","eligibility":"","organization":"","requirements":"","tags":""}]
    `.trim();

    const sonarResponse = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content:
                "You are a scholarship recommendation engine. Always respond strictly in JSON array format.",
            },
            {
              role: "user",
              content: dynamicQuery,
            },
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
      }
    );

    if (!sonarResponse.ok) {
      const errorText = await sonarResponse.text();
      console.error("Sonar API error:", errorText);
      return res
        .status(500)
        .json({ error: "Failed to fetch grants from Sonar" });
    }

    const sonarData = (await sonarResponse.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const replyContent = sonarData.choices?.[0]?.message?.content ?? "";

    // Check if replyContent is empty or invalid
    if (!replyContent || replyContent.trim() === "") {
      console.error("[Grants API] Sonar returned empty response");
      console.error("[Grants API] This might indicate:");
      console.error("  1. Sonar API rate limit reached");
      console.error("  2. Invalid API key");
      console.error("  3. Sonar service issue");
      return res.status(500).json({
        error: "Sonar API returned empty response. Please try again later.",
      });
    }

    let grants = [];
    try {
      grants = JSON.parse(replyContent);

      // Validate that grants is an array
      if (!Array.isArray(grants)) {
        console.error(
          "[Grants API] Sonar response is not an array:",
          typeof grants
        );
        return res
          .status(500)
          .json({ error: "Invalid grants data format from Sonar." });
      }
    } catch (parseError) {
      console.error("[Grants API] Failed to parse Sonar JSON:", parseError);
      console.error(
        "[Grants API] Raw content:",
        replyContent.substring(0, 200)
      );
      return res
        .status(500)
        .json({ error: "Failed to parse grants data from Sonar." });
    }

    const mappedGrants = grants.map((item: any, index: number) => ({
      id: index.toString(),
      title: item.title ?? "Untitled Grant",
      organization: item.organization ?? "Unknown Organization",
      amount: item.amount ?? "Varies",
      deadline: item.deadline ?? "2026-12-31",
      link:
        item.link ??
        `https://www.google.com/search?q=${encodeURIComponent(item.title)}`,
      eligibility: item.eligibility
        ? item.eligibility
            .split(/[•\n]/)
            .map((e: string) => e.trim())
            .filter((e: string) => e.length > 0)
        : ["Eligibility not specified"],

      requirements: item.requirements
        ? item.requirements
            .split(/(?<!\band\b)(?:•|\n|;)/i) // split on •, \n, or ; unless followed by digit
            .map((r: string) => r.trim())
            .filter((r: string) => r.length > 0)
        : [],
      description: item.description ?? "",
      tags: item.tags
        ? item.tags.split(",").map((tag: string) => tag.trim())
        : [],
      difficulty: "Medium",
    }));

    res.json(mappedGrants);
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// NEW: Application Draft Endpoint for /api/sonar
app.post("/api/sonar", async (req, res): Promise<any> => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Missing or invalid question." });
  }

  try {
    const sonarResponse = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [{ role: "user", content: question }],
        }),
      }
    );

    const data = (await sonarResponse.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const answer =
      data.choices?.[0]?.message?.content ?? "No answer generated.";
    res.json({ answer });
  } catch (error) {
    console.error("Error calling Sonar:", error);
    res.status(500).json({ error: "Failed to generate draft from Sonar." });
  }
});

// Cache for requirement descriptions to ensure consistency
const requirementDescriptionsCache = new Map<string, string[]>();

// Cache for grant explanations to ensure consistency
const grantExplanationsCache = new Map<
  string,
  { criteria: string[]; unique: string }
>();

// NEW: Requirement Descriptions Endpoint
app.post("/api/requirement-descriptions", async (req, res): Promise<any> => {
  const { requirements, grantTitle } = req.body;

  if (!Array.isArray(requirements) || requirements.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid or missing requirements array." });
  }

  // Create a cache key from requirements
  const cacheKey = requirements
    .map((r) => r.trim().toLowerCase())
    .sort()
    .join("||");

  // Check cache first
  if (requirementDescriptionsCache.has(cacheKey)) {
    console.log("[API] Returning cached requirement descriptions");
    return res.json({
      descriptions: requirementDescriptionsCache.get(cacheKey),
    });
  }

  console.log(
    "[API] Generating new requirement descriptions for:",
    grantTitle || "unknown grant"
  );

  const prompt = `
For each of the following grant application requirements, write a 5-8 words description (no longer than 10 words) that clearly explains what it is and how to fulfill it.

Return only helpful, concise descriptions. Avoid repeating the requirement title.

${requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Respond in JSON format:
{
  "descriptions": [
    "Description for requirement 1",
    "Description for requirement 2"
  ]
}
`.trim();

  try {
    const sonarResponse = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = (await sonarResponse.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content ?? "";

    // Try to extract JSON block safely
    const match = text.match(/\{[\s\S]*?\}/); // non-greedy to stop at first closing brace

    if (!match) {
      console.warn("No valid JSON block found in Sonar response:", text);
      return res.status(200).json({
        descriptions: requirements.map(() => "Description not available."),
      });
    }

    try {
      const parsed = JSON.parse(match[0]);

      // If "descriptions" is not a valid array, fallback
      if (!Array.isArray(parsed.descriptions)) {
        throw new Error("Parsed data does not contain 'descriptions' array.");
      }

      // Cache the descriptions for future requests
      requirementDescriptionsCache.set(cacheKey, parsed.descriptions);
      console.log("[API] Cached requirement descriptions for future use");

      return res.json(parsed);
    } catch (err) {
      console.error("JSON parsing error in Sonar response:", err);
      const fallbackDescriptions = requirements.map(
        () => "Description not available."
      );

      // Cache even the fallback to avoid repeated API calls
      requirementDescriptionsCache.set(cacheKey, fallbackDescriptions);

      return res.status(200).json({
        descriptions: fallbackDescriptions,
      });
    }
  } catch (error) {
    console.error("Sonar requirements error:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate requirement descriptions." });
  }
});

app.post("/api/explain-grant", async (req, res): Promise<any> => {
  const { title, requirements = [] } = req.body;

  if (!title || !Array.isArray(requirements)) {
    return res.status(400).json({ error: "Missing or invalid grant data." });
  }

  // Create cache key from title (normalized)
  const cacheKey = title.trim().toLowerCase();

  // Check cache first
  if (grantExplanationsCache.has(cacheKey)) {
    console.log("[API] Returning cached grant explanation for:", title);
    return res.json(grantExplanationsCache.get(cacheKey));
  }

  console.log("[API] Generating new grant explanation for:", title);

  const prompt = `
You are a scholarship evaluator assistant. Based on the following information:

Title: ${title}
Requirements: ${requirements.join("; ")}

Write two things:

1. Key Selection Criteria – output as a clean, human-readable bulleted list (3–5 items). Each bullet must highlight a core trait (e.g. GPA, leadership, diversity, community impact), followed by a short 1-line explanation. Use plain text bullets like "•".

2. What Makes This Grant Unique – a short paragraph explaining how this scholarship stands out from others, such as niche eligibility, unusual mission, holistic approach, or special values.

Respond in strict JSON format like:
{
  "criteria": [
    "• Academic excellence: Demonstrated through GPA and coursework",
    "• Leadership: Evidence of leadership in school or community",
    "• Community impact: Involvement in service or outreach"
  ],
  "unique": "This grant supports students with a demonstrated history of resilience, especially those pursuing social impact careers."
}
`.trim();

  try {
    const sonarResponse = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = (await sonarResponse.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content ?? "";

    // Try to extract JSON object block from text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("Sonar response missing JSON block. Raw content:", text);
      return res.status(200).json({
        criteria: "We're unable to extract selection criteria at this time.",
        unique:
          "The explanation could not be retrieved. Please try refreshing.",
      });
    }

    try {
      const parsed = JSON.parse(match[0]);

      // Defensive fallback: if criteria is string (not array), split into bullets
      if (typeof parsed.criteria === "string") {
        parsed.criteria = (parsed.criteria as string)
          .split(/•/g)
          .map((str: string) => str.trim())
          .filter((str: string) => str.length > 0)
          .map((str: string) => `• ${str}`);
      }

      // Cache the explanation for future requests
      grantExplanationsCache.set(cacheKey, parsed);
      console.log("[API] Cached grant explanation for future use");

      return res.json(parsed);
    } catch (error) {
      console.error("Sonar explanation JSON parse error:", error);
      const fallbackResponse = {
        criteria: ["We're unable to extract selection criteria at this time."],
        unique:
          "The explanation could not be retrieved. Please try refreshing.",
      };

      // Cache even the fallback to avoid repeated API calls
      grantExplanationsCache.set(cacheKey, fallbackResponse);

      return res.status(200).json(fallbackResponse);
    }
  } catch (error) {
    console.error("Sonar grant explanation error:", error);
    return res.status(500).json({ error: "Failed to generate explanation." });
  }
});

// Contact form endpoint
app.post("/api/contact", generalLimiter, async (req, res): Promise<any> => {
  try {
    const { name, email, contactType, subject, message, rating } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Import nodemailer
    const nodemailer = require("nodemailer");

    // Create transporter using Hostinger SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // support@grantbridge.online
        pass: process.env.SMTP_PASS, // your email password
      },
    });

    // Email content
    const emailContent = `
      <h2>New ${contactType} from GrantBridge</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Type:</strong> ${contactType}</p>
      ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
      ${rating ? `<p><strong>Rating:</strong> ${rating}/5 stars</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <hr>
      <p><small>Sent from GrantBridge Contact Form</small></p>
    `;

    // Send email
    await transporter.sendMail({
      from: `"GrantBridge Contact" <${process.env.SMTP_USER}>`,
      to: process.env.SUPPORT_EMAIL || "support@grantbridge.online",
      replyTo: email, // User's email for easy reply
      subject: `[GrantBridge ${contactType}] ${
        subject || "New message from " + name
      }`,
      html: emailContent,
    });

    console.log(`Contact form email sent from ${email}`);
    return res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

// Add Sentry error handler AFTER your routes but BEFORE other error handlers
app.use(Sentry.Handlers.errorHandler());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
