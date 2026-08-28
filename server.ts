import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-init Gemini Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Get Cabs Coimbatore", timestamp: new Date().toISOString() });
});

// Address Autocomplete API using Ola Maps with local fallback
app.get("/api/autocomplete", async (req, res) => {
  try {
    const input = req.query.input;
    if (!input || typeof input !== "string" || input.trim().length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    const query = input.trim();
    const olaApiKey = process.env.OLA_MAPS_API_KEY || "l2kC5mBd5G5Nivu3wcw6GmV2OO1bLUPGkDA0ZeCK";
    
    // 1. Try Ola Maps Autocomplete API with domain header
    try {
      const olaRes = await fetch(
        `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${olaApiKey}`,
        {
          headers: {
            "Origin": "https://getcabs.in",
            "Referer": "https://getcabs.in",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          }
        }
      );
      if (olaRes.ok) {
        const data = (await olaRes.json()) as any;
        if (data && data.predictions && Array.isArray(data.predictions) && data.predictions.length > 0) {
          const suggestions = data.predictions.map((p: any) => {
            if (p.structured_formatting) {
              const main = p.structured_formatting.main_text || "";
              const sec = p.structured_formatting.secondary_text || "";
              return sec ? `${main}, ${sec}` : main;
            }
            return p.description || "";
          }).filter((s: string) => Boolean(s && s.trim()));
          
          if (suggestions.length > 0) {
            res.json({ suggestions });
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Ola Maps Autocomplete fetch warning:", e);
    }

    // 2. Fallback to OpenStreetMap Nominatim Geocoding
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Tamil Nadu")}&addressdetails=1&limit=6&countrycodes=in`,
        {
          headers: {
            "User-Agent": "GetCabsCoimbatore/1.0 (booking@getcabs.in)"
          }
        }
      );
      if (nomRes.ok) {
        const data = (await nomRes.json()) as any;
        if (Array.isArray(data) && data.length > 0) {
          const suggestions = data.map((item: any) => {
            const parts = (item.display_name || "").split(",");
            return parts.slice(0, 3).join(",").trim();
          }).filter(Boolean);
          res.json({ suggestions });
          return;
        }
      }
    } catch (nomErr) {
      console.warn("Nominatim fallback warning:", nomErr);
    }

    res.json({ suggestions: [] });
  } catch (err: any) {
    res.json({ suggestions: [] });
  }
});

// AI Chatbot Assistant API with Gemini & Google Search Grounding
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      // Graceful response when no API key configured
      res.json({
        text: `Hello! I am **Get Cabs Coimbatore AI Assistant**. For immediate 24/7 cab booking, airport drops, or outstation tours to Ooty, Munnar, Kodaikanal, and Valparai, please call or WhatsApp our dispatch team at **[9894020156](tel:9894020156)**.\n\nRates: Local city rides @ ₹28-₹30/KM (Zero surge), Airport drops @ ₹499-₹650, Ooty oneway @ ₹2,399, Day rentals (10 Hrs / 100 KM) @ ₹3,000.`,
        sources: []
      });
      return;
    }

    const systemInstruction = `You are the official AI Dispatcher & Travel Assistant for "Get Cabs Coimbatore" (getcabs.in, 24/7 Helpline: 9894020156).
Your job is to provide friendly, prompt, and accurate taxi booking guidance, fare estimates, route information, hill station advice (e-pass rules for Ooty/Kodaikanal, 36 hairpin bends of Ooty, 40 hairpin bends of Valparai), Coimbatore airport CJB transfers, temple packages (Adiyogi Isha, Palani, Madurai, Marudhamalai), and local sightseeing.

Company Fare Standards:
- Local Rides (Mini/Sedan): Base ₹150 for first 2.5 KM; ₹28-₹30/KM afterwards. Zero peak surge charges, zero traffic wait fees.
- Airport Taxi (CJB): Gandhipuram/RS Puram/Peelamedu ₹499 - ₹650 fixed.
- Outstation Drops (Oneway): Fixed one-way billing. E.g., Ooty: ₹2,399, Coonoor: ₹2,199, Valparai: ₹2,799, Munnar: ₹3,999, Kodaikanal: ₹3,899, Tirupur: ₹1,499, Erode: ₹2,499, Salem: ₹3,799, Madurai: ₹4,499, Bangalore: ₹7,499.
- Hourly Packages: 10 Hrs / 100 KM @ ₹3,000; 12 Hrs / 100 KM @ ₹3,500.
- Fleet: Hatchbacks (WagonR/Swift), Prime Sedans (Etios/Dzire), Spacious SUVs (Ertiga/Innova/Crysta), Tempo Travellers.
- 24/7 Hotline & WhatsApp: 9894020156

Keep answers concise, helpful, formatted with clean bullet points, and always invite them to book directly or call/WhatsApp 9894020156.`;

    // Prepare contents
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        if (h.role && h.parts) {
          contents.push({
            role: h.role === 'assistant' ? 'model' : h.role,
            parts: h.parts
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      }
    });

    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "Thank you for contacting Get Cabs Coimbatore. Please call 9894020156 for instant bookings.";
    
    // Extract web search grounding sources if available
    const sources: { title: string; url: string }[] = [];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri
          });
        }
      }
    }

    res.json({
      text,
      sources
    });
  } catch (error: any) {
    console.error("Gemini API error in /api/chat:", error);
    res.status(200).json({
      text: "👋 Welcome to **Get Cabs Coimbatore**! We are available 24/7 for instant local cab rides, CJB Airport pickups, and outstation trips to Ooty, Munnar, Kodaikanal, Valparai, and more.\n\n📞 **Call Now / WhatsApp**: [9894020156](tel:9894020156)\n📍 **Operating Zones**: Gandhipuram, RS Puram, Peelamedu, Saravanampatti, Coimbatore Airport & All Kovai areas.",
      sources: []
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Get Cabs Coimbatore server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
