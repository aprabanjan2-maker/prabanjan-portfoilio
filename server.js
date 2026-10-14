
require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = 5000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "2mb" }));

// Serve static files without automatically opening index.html
app.use(express.static(path.join(__dirname, "public"), {
    index: false
}));

// Homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "home.html"));
});

// AI Reviewer dashboard
app.get("/review", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "PORTAI server is running"
    });
});

// Safely clamp scores between 0 and 100
function clampScore(value) {
    const score = Number(value);

    if (!Number.isFinite(score)) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

// AI portfolio review
app.post("/api/review", async (req, res) => {
    try {
        const { type, value } = req.body || {};

        if (!["text", "url"].includes(type)) {
            return res.status(400).json({
                error: "Choose text review or website review."
            });
        }

        if (typeof value !== "string" || !value.trim()) {
            return res.status(400).json({
                error: type === "url"
                    ? "Please enter a portfolio website URL."
                    : "Please enter your portfolio text."
            });
        }

        if (value.length > 20000) {
            return res.status(400).json({
                error: "Your input is too long. Please keep it under 20,000 characters."
            });
        }

        let portfolioContent = value.trim();
        let website = null;

        if (type === "url") {
            let parsedUrl;

            try {
                parsedUrl = new URL(portfolioContent);
            } catch {
                return res.status(400).json({
                    error: "Enter a valid website URL, including https://"
                });
            }

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                return res.status(400).json({
                    error: "Only HTTP and HTTPS website URLs are supported."
                });
            }

            // Prevent requests to local or private network addresses.
            const hostname = parsedUrl.hostname.toLowerCase();

            const blockedHost =
                hostname === "localhost" ||
                hostname === "127.0.0.1" ||
                hostname === "::1" ||
                hostname.endsWith(".local") ||
                hostname.startsWith("10.") ||
                hostname.startsWith("192.168.") ||
                /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
                hostname === "0.0.0.0";

            if (blockedHost) {
                return res.status(400).json({
                    error: "Please enter a publicly accessible portfolio website."
                });
            }

            website = parsedUrl.href;

            // Website mode reviews the URL provided.
            // This version does not scrape website page content.
            portfolioContent = `Portfolio website URL: ${website}`;
        }

        const prompt = `
You are PORTAI, a professional AI portfolio reviewer.

Review the portfolio information provided below.

Review type: ${type === "url" ? "Website URL" : "Portfolio text"}

Portfolio information:
${portfolioContent}

Return ONLY a valid JSON object. Do not use Markdown fences.

Use this exact structure:
{
  "overallScore": 75,
  "title": "Good foundation",
  "summary": "A short, useful overall assessment.",
  "tag": "Good",
  "breakdown": {
    "design": 75,
    "content": 75,
    "projects": 75,
    "skills": 75
  },
  "strengths": [
    "A specific strength"
  ],
  "improvements": [
    "A specific improvement"
  ]
}

Requirements:
- All scores must be integers from 0 to 100.
- Give 3 to 5 strengths and 3 to 5 improvements.
- Keep feedback practical, clear, and constructive.
- Do not invent qualifications, projects, or skills.
- If only a website URL is provided and you cannot access its page content, clearly say that the URL alone is insufficient to verify the actual design or content. Give a preliminary assessment only, and recommend providing the portfolio text for a more accurate review.
- Do not claim you visited or inspected a website unless its actual content was provided.
`;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: "You are PORTAI. Return valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: {
                type: "json_object"
            }
        });

        const responseText =
            completion.choices?.[0]?.message?.content;

        if (!responseText) {
            throw new Error("The AI returned an empty response.");
        }

        const result = JSON.parse(responseText);

        const breakdown = result.breakdown || {};

        const safeResult = {
            overallScore: clampScore(result.overallScore),
            title: String(result.title || "Portfolio Review"),
            summary: String(
                result.summary || "Your portfolio has been reviewed."
            ),
            tag: String(result.tag || "Reviewed"),
            breakdown: {
                design: clampScore(breakdown.design),
                content: clampScore(breakdown.content),
                projects: clampScore(breakdown.projects),
                skills: clampScore(breakdown.skills)
            },
            strengths: Array.isArray(result.strengths)
                ? result.strengths.slice(0, 5).map(String)
                : [],
            improvements: Array.isArray(result.improvements)
                ? result.improvements.slice(0, 5).map(String)
                : [],
            website: website
        };

        return res.json(safeResult);

    } catch (error) {
        console.error("PORTAI review error:", error);

        if (
            error.status === 401 ||
            error.code === "invalid_api_key"
        ) {
            return res.status(401).json({
                error: "Your OpenAI API key is invalid. Check OPENAI_API_KEY in your .env file."
            });
        }

        if (error.status === 429) {
            return res.status(429).json({
                error: "The API rate limit or available quota has been reached. Check your OpenAI API usage and billing."
            });
        }

        return res.status(500).json({
            error: "The review failed. Check your server terminal for details and try again."
        });
    }
});

// Handle unknown API endpoints
app.use("/api", (req, res) => {
    res.status(404).json({
        error: "API endpoint not found."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`PORTAI is running at http://localhost:${PORT}`);
    console.log(`Homepage: http://localhost:${PORT}/`);
    console.log(`AI Reviewer: http://localhost:${PORT}/review`);
});
