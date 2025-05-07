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

    // Decide if we're on a “classic” model (supports temperature / max_tokens)
    const isClassic =
      model.startsWith("gpt-") && !model.includes("4o") && !model.includes("o-") ||
      model.startsWith("text-") ||
      model.includes("turbo");

    const bodyPayload = {
      model,
      messages
    };

    if (isClassic) {
      // Classic GPT‑3.5 / GPT‑4
      bodyPayload.temperature = 0.7;
      bodyPayload.max_tokens  = TOKEN_LIMIT;
    } else {
      // gpt‑4o and future o‑series models
      // (No temperature allowed; must use max_completion_tokens)
      bodyPayload.max_completion_tokens = TOKEN_LIMIT;
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

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
