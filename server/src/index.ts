import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Very important for parsing incoming JSON

app.post('/api/grants', async (req, res): Promise<any> => {
  try {
    const {
      age,
      country,
      education,
      gender,
      interests = [],
      identifiers = [],
    } = req.body;

    // Validate types defensively
    if (
      typeof age !== 'number' ||
      typeof country !== 'string' ||
      typeof education !== 'string' ||
      typeof gender !== 'string' ||
      !Array.isArray(interests) ||
      !Array.isArray(identifiers)
    ) {
      return res.status(400).json({ error: "Invalid user profile data received." });
    }

    const dynamicQuery = `
      List 5 scholarships or grants for a ${age}-year-old ${identifiers.join(", ")} ${gender} studying ${education} in ${country}.
      For each, include: Title, Description, Amount, Deadline, Eligibility, Source Organization.
      Interests include: ${interests.join(", ")}.
      Respond in JSON format: [{"title": "", "description": "", "amount": "", "deadline": "", "eligibility": "", "organization": ""}]
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
            content: "You are an AI assistant helping users find scholarships and grants. Always respond in correct JSON format, never plain text.",
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
                },
                required: ["title", "organization", "amount"],
              },
            },
          },
        },
        max_tokens: 1000,
        temperature: 0.2,
      }),
    });

    if (!sonarResponse.ok) {
      const text = await sonarResponse.text();
      console.error('Sonar API error:', text);
      return res.status(500).json({ error: 'Failed to fetch grants from Sonar' });
    }

    const sonarData = (await sonarResponse.json()) as {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    };

    const replyContent = sonarData.choices?.[0]?.message?.content;
    console.log('Raw Sonar Reply:', replyContent);

    let grants = [];
    try {
      grants = JSON.parse(replyContent);
    } catch (parseError) {
      console.error('Failed to parse Sonar JSON:', parseError);
      console.error('Raw reply content that failed parsing:', replyContent);
      return res.status(500).json({ error: "Failed to parse grants data from Sonar." });
    }

    const mappedGrants = grants.map((item: any, index: number) => ({
      id: index.toString(),
      title: item.title ?? "Untitled Grant",
      organization: item.organization ?? "Unknown Organization",
      amount: item.amount ?? 0,
      deadline: item.deadline ?? "2025-12-31",
      eligibility: [item.eligibility ?? "Eligibility criteria not provided"],
      requirements: [],
      description: item.description ?? "",
      tags: [],
      difficulty: "Medium",
    }));

    res.json(mappedGrants);

  } catch (error) {
    console.error("Error fetching from Sonar API:", error);
    res.status(500).json({ error: "Failed to fetch grants" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
