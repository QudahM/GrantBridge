import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors());
app.use(express.json());

app.post('/api/grants', async (req, res): Promise<any> => {
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
      typeof age !== 'number' ||
      typeof country !== 'string' ||
      typeof gender !== 'string' ||
      typeof citizenship !== 'string' ||
      typeof education !== 'string' ||
      typeof degreeType !== 'string' ||
      typeof yearOfStudy !== 'string' ||
      typeof fieldOfStudy !== 'string' ||
      typeof gpa !== 'string' ||
      typeof incomeBracket !== 'string' ||
      typeof financialNeed !== 'boolean' ||
      typeof ethnicity !== 'string' ||
      !Array.isArray(identifiers)
    ) {
      return res.status(400).json({ error: "Invalid user profile data received." });
    }

    const dynamicQuery = `
      List as many recent scholarships or grants (from the last and next 3 years) as possible for:
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
      * Deadline (specific date)
      * Eligibility (bullet points)
      * Organization
      * Requirements
      * Tags (e.g., STEM, Women, First-Gen)
      * Link (to official grant website or application page)

      Respond ONLY in JSON array format like:
      [{"title":"","description":"","amount":"","deadline":"","eligibility":"","organization":"","requirements":"","tags":""}]
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
      console.error('Sonar API error:', errorText);
      return res.status(500).json({ error: 'Failed to fetch grants from Sonar' });
    }

    const sonarData = await sonarResponse.json() as {
      choices?: { message?: { content?: string } }[];
    };
    const replyContent = sonarData.choices?.[0]?.message?.content ?? '';

    let grants = [];
    try {
      grants = JSON.parse(replyContent);
    } catch (parseError) {
      console.error('Failed to parse Sonar JSON:', parseError);
      return res.status(500).json({ error: "Failed to parse grants data from Sonar." });
    }

    const mappedGrants = grants.map((item: any, index: number) => ({
      id: index.toString(),
      title: item.title ?? "Untitled Grant",
      organization: item.organization ?? "Unknown Organization",
      amount: item.amount ?? "Varies",
      deadline: item.deadline ?? "2026-12-31",
      link: item.link ?? `https://www.google.com/search?q=${encodeURIComponent(item.title)}`,
      eligibility: item.eligibility
        ? item.eligibility.split(/[•\n]/).map((e: string) => e.trim()).filter((e: string) => e.length > 0)
        : ["Eligibility not specified"],

      requirements: item.requirements
        ? item.requirements
          .split(/(?:•|\n|;)(?!\d)/) // split on •, \n, or ; unless followed by digit
          .map((r: string) => r.trim())
          .filter((r: string) => r.length > 0)
        : [],
      description: item.description ?? "",
      tags: item.tags ? item.tags.split(",").map((tag: string) => tag.trim()) : [],
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
    const sonarResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "user", content: question }
        ],
      }),
    });

    const data = await sonarResponse.json() as {
      choices?: { message?: { content?: string } }[];
    };
    const answer = data.choices?.[0]?.message?.content ?? "No answer generated.";
    res.json({ answer });
  } catch (error) {
    console.error("Error calling Sonar:", error);
    res.status(500).json({ error: "Failed to generate draft from Sonar." });
  }
});

// NEW: Requirement Descriptions Endpoint
app.post("/api/requirement-descriptions", async (req, res): Promise<any> => {
  const { requirements } = req.body;

  if (!Array.isArray(requirements) || requirements.length === 0) {
    return res.status(400).json({ error: "Invalid or missing requirements array." });
  }

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
    const sonarResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await sonarResponse.json() as {
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

      return res.json(parsed);
    } catch (err) {
      console.error("JSON parsing error in Sonar response:", err);
      return res.status(200).json({
        descriptions: requirements.map(() => "Description not available."),
      });
    }

  } catch (error) {
    console.error("Sonar requirements error:", error);
    return res.status(500).json({ error: "Failed to generate requirement descriptions." });
  }
});

app.post("/api/explain-grant", async (req, res): Promise<any> => {
  const { title, requirements = [] } = req.body;

  if (!title || !Array.isArray(requirements)) {
    return res.status(400).json({ error: "Missing or invalid grant data." });
  }

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
    const sonarResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await sonarResponse.json() as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content ?? "";

    // Try to extract JSON object block from text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("Sonar response missing JSON block. Raw content:", text);
      return res.status(200).json({
        criteria: "We're unable to extract selection criteria at this time.",
        unique: "The explanation could not be retrieved. Please try refreshing.",
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

      return res.json(parsed);

    } catch (error) {
      console.error("Sonar explanation JSON parse error:", error);
      return res.status(200).json({
        criteria: "We're unable to extract selection criteria at this time.",
        unique: "The explanation could not be retrieved. Please try refreshing.",
      });
    }
  } catch (error) {
    console.error("Sonar grant explanation error:", error);
    return res.status(500).json({ error: "Failed to generate explanation." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
