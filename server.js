// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { messages, model = "gpt-4o" } = req.body;

  try {
    const TOKEN_LIMIT = 10000;

    const isClassicModel =
      model.startsWith("gpt-") ||
      model.startsWith("text-") ||
      model.includes("turbo");

    // Build correct request format
    const bodyPayload = {
      model,
      messages
    };

    if (isClassicModel) {
      // Old models (gpt-3.5, gpt-4)
      bodyPayload.temperature = 0.7;
      bodyPayload.max_tokens = TOKEN_LIMIT;
    } else {
      // New models (gpt-4o, o3-mini, etc.)
      bodyPayload.generation_config = {
        temperature: 0.7,
        max_completion_tokens: TOKEN_LIMIT
      };
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await openaiRes.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
