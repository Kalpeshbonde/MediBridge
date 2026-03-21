import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.warn("⚠️  GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(geminiApiKey || "");

const SYSTEM_PROMPT = `You are CareMate, a friendly and helpful healthcare assistant.
You help users with:
- General health questions and information
- Booking appointments
- Finding doctors
- Checking symptoms (but always recommend seeing a real doctor)
- FAQs about the platform

Always be empathetic, concise, and remind users to consult a real doctor for serious concerns.
Never diagnose. Keep responses short and clear (2-4 sentences max).`;

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!geminiApiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  try {
    // ✅ gemini-2.5-flash with v1beta — the correct free model in 2026
    const model = genAI.getGenerativeModel(
      { model: "gemini-2.5-flash-lite" },
      { apiVersion: "v1beta" }
    );

    const result = await model.generateContent(
      `${SYSTEM_PROMPT}\n\nUser: ${message}\n\nCareMate:`
    );

    const response = result.response.text();
    res.json({ response });

  } catch (error) {
    console.error("Gemini error:", error?.message || error);
    res.status(500).json({
      error: "Failed to connect to Gemini",
      details: error?.message || "Unknown error",
    });
  }
});

export default router;