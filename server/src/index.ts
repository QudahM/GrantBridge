import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { link } from 'fs';

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
        model: "sonar-pro",
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
        ? item.requirements.split(/[•,\n]/).map((r: string) => r.trim()).filter((r: string) => r.length > 0)
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
