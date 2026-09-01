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
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
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
      // Graceful rich response when no API key configured
      res.json({
        text: `Hello! I am **Get Cabs Coimbatore AI Assistant (Gemini Mini)**.\n\n### 🚕 Official Get Cabs Fare Card & Price Maths:\n- **Local Rides (City Mini/Sedan)**: Base ₹150 for first 2.5 KM, then ₹28-₹30/KM. Mandatory Default AC, Zero Surge Pricing!\n- **Hourly Rental Packages**:\n  • 1 Hr (10 KM free): ₹350/hr (Extra KM @ ₹25/KM)\n  • Package A (10 Hrs / 100 KM): ₹3,000 flat (Extra KM @ ₹10/KM)\n  • Package B (12 Hrs / 100 KM): ₹3,500 flat (Extra hr @ ₹150/hr)\n- **Fixed One-Way Drop Routes**:\n  • **Annur / Isha Yoga**: ₹1,100 (30-33 KM)\n  • **Anaikatti**: ₹1,300 (30 KM)\n  • **Mettupalayam**: ₹1,400 (37 KM)\n  • **Pollachi / Avinashi**: ₹1,600 (43 KM)\n  • **Airport (CJB) to Tiruppur**: ₹1,700 (46 KM)\n  • **Tiruppur Town / Palakkad**: ₹1,900 (52-55 KM)\n  • **Airport (CJB) to Palakkad**: ₹2,200 (61 KM)\n  • **Sathyamangalam / Udumalpet**: ₹2,500 (70 KM)\n  • **Coonoor / Kotagiri**: ₹2,900 (70-83 KM)\n  • **Erode**: ₹3,500 (100 KM)\n  • **Ooty Bus Stand**: ₹3,500 (87 KM)\n  • **Palani**: ₹3,900 (110 KM)\n  • **Munnar**: ₹3,800 oneway / ₹6,500 (2D1N)\n  • **Kodaikanal**: ₹4,200 oneway / ₹6,800 (2D1N)\n  • **Yercaud**: ₹4,800 (Full Day)\n  • **Valparai (40 Hairpins)**: ₹2,799 - ₹3,500 oneway / ₹4,500 Tour\n\n### 📐 Price Calculation Maths:\n1. **Oneway < 100 KM**: Round-trip distance × ₹17/KM (Go + Return).\n2. **Oneway > 130 KM**: Round-trip distance × ₹14/KM + ₹400 Driver Batta.\n3. **Hill Stations**: Driver Batta & Mountain Allowance included.\n\n📞 **24/7 Helpline & WhatsApp**: [9894020156](tel:9894020156) | ✉️ booking@getcabs.in`,
        sources: []
      });
      return;
    }

    const systemInstruction = `You are the official AI Dispatcher & Travel Assistant (Gemini Mini) for "Get Cabs Coimbatore" (Website: getcabs.in, 24/7 Hotline & WhatsApp: 9894020156, Email: booking@getcabs.in).
You are an expert on every detail, pricing tariff, calculation math, route, vehicle type, policy, and hill station guideline of Get Cabs Coimbatore.

1. BRAND & OPERATIONS:
- Company: Get Cabs Coimbatore
- Contact: Call or WhatsApp 9894020156
- Main Hubs: Gandhipuram, Coimbatore Railway Junction, Coimbatore Airport (CJB) Peelamedu, RS Puram, Saravanampatti, Singanallur, Ukkadam.
- 5-10 minute rapid doorstep dispatch across Coimbatore.
- Mandatory Default Air Conditioning (AC) in all vehicles with zero extra surcharge.
- Zero surge pricing during rain, peak hours, or festivals.

2. TARIFF & FARE CARD:
A. Local City Cabs:
- Base: ₹150 for first 2.5 KM, then ₹28-₹30/KM.
- District border outskirts adjustment: +₹100 to ₹150 for outer areas (Karumathampatti, Karanampettai, Paapampatti, Kovilpalayam/Ganeshapuram, Karamadai, Booluvampatti/Pooluvapatti, Ettimadai, Kinathukadavu).

B. Hourly & Day Rental Packages:
- 1 Hour Package: ₹350/hr (Includes 10 KM free; extra distance @ ₹25/KM).
- Package A (10 Hours / 100 KM Day Package): ₹3,000 flat (Extra KM @ ₹10/KM).
- Package B (12 Hours / 100 KM Day Package): ₹3,500 flat (Extra time @ ₹150/hr).

C. Fixed One-Way Drop Routes (from Coimbatore / Gandhipuram / Airport / Railway Station):
- Annur (30 KM): ₹1,100
- Isha Yoga Center / Dhyanalinga (33 KM): ₹1,100 (Half-day wait ₹1,200; Full day ₹1,800)
- Anaikatti (30 KM): ₹1,300
- Mettupalayam (37 KM): ₹1,400
- Palladam / Sirumugai (39-40 KM): ₹1,500
- Avinashi / Pollachi / MTP Vana Bathrakaliamman Kovil (42-43 KM): ₹1,600
- Airport (CJB) to Tiruppur (46 KM): ₹1,700
- Puliyampatti (49 KM): ₹1,800
- Palakkad / Tiruppur Town (52-55 KM): ₹1,900
- Airport (CJB) to Palakkad (61 KM): ₹2,200
- Sathyamangalam / Kangeyam / Udumalpet (70 KM): ₹2,500
- Perundurai / Gobichettipalayam / Kotagiri / Coonoor (70-83 KM): ₹2,900
- Dharapuram (85 KM): ₹2,950
- Erode (100 KM): ₹3,500
- Ooty Bus Stand (87 KM): ₹3,500 (Sedan oneway drop) | Full day Ooty tour ₹3,800 | Ertiga SUV ₹3,800 oneway / ₹5,500 tour | Innova Crysta ₹4,800 oneway / ₹6,800 tour
- Palani Murugan Temple (110 KM): ₹3,900
- Munnar (160 KM): ₹3,800 oneway / ₹6,500 (2D1N Sedan), ₹5,800 / ₹9,500 (Ertiga), ₹7,200 / ₹12,500 (Innova)
- Kodaikanal (175 KM): ₹4,200 oneway / ₹6,800 (2D1N Sedan), ₹6,200 / ₹9,800 (Ertiga), ₹7,800 / ₹12,800 (Innova)
- Yercaud (195 KM): ₹4,800 (Full day Sedan), ₹6,800 (Ertiga), ₹8,500 (Innova)
- Valparai (40 Hairpins, 105 KM): ₹2,799 - ₹3,500 oneway / ₹4,500 tour
- Bangalore (360 KM): ₹7,499 oneway
- Mysore (200 KM): ₹5,499 oneway
- Guruvayur / Madurai / Trichy: ₹3,800 oneway / ₹8,800 (2D1N)
- Kanyakumari (400 KM): ₹10,500 (2D1N Sedan), ₹14,800 (Ertiga), ₹18,500 (Innova Crysta)

3. PRICE CALCULATION MATHS & FORMULAS:
When users ask for a custom route calculation or how prices are calculated:
- Oneway drops under 100 KM: Billed at round-trip mileage @ ₹17/KM (Go + Return distance).
- Oneway drops over 130 KM: Billed at round-trip mileage @ ₹14/KM (Go + Return distance) + ₹400 Driver Batta.
- Round Trip Outstation:
  • Sedan (Dzire/Etios): ₹13-₹14/KM (min 250 KM/day) + ₹400 Driver Batta/day.
  • SUV (Ertiga): ₹18/KM (min 250 KM/day) + ₹500 Driver Batta/day.
  • Premium SUV (Innova Crysta): ₹22-₹24/KM (min 250 KM/day) + ₹600 Driver Batta/day.
- Tolls, state permits (e.g., Kerala/Karnataka), and parking are paid at actuals.

4. FLEET OPTIONS:
- Hatchback (WagonR, Indica, Tiago): 4 Seater, 2 small bags, city commutes.
- Prime Sedan (Swift Dzire, Toyota Etios): 4 Seater, 3 medium luggage bags, boot space, AC.
- Compact SUV (Maruti Ertiga, XL6): 6 Seater + luggage carrier, ideal for families.
- Luxury SUV (Toyota Innova Crysta): 7 Seater, captain seats, supreme mountain suspension.
- Tempo Traveller (12/14/18 Seater): Group tours, AC pushback seating.

5. HILL STATION & ROUTE SPECIALS:
- Hairpin curves: Ooty (36 hairpin bends via MTP/Coonoor), Valparai (40 hairpin bends via Pollachi/Aliyar), Yercaud (20 hairpin bends), Kodaikanal (14 hairpin bends), Wayanad Thamarassery Churam (9 hairpin bends).
- E-Pass mandate: Nilgiris (Ooty/Coonoor/Kotagiri) and Kodaikanal require mandatory e-pass registration (pass.tnega.org).
- Forest checkpost timings: Mudumalai/Bandipur checkpost closed 9:00 PM – 6:00 AM; Chinnar checkpost closed 9:00 PM – 6:00 AM.
- Key attractions: Adiyogi 112ft Shiva Statue (3D Laser Light Show daily 7:00 PM - 7:15 PM), Ooty Botanical Garden (7 AM - 6:30 PM), Doddabetta Peak (9 AM - 5:30 PM).

6. CANCELLATION POLICY:
- 100% Free cancellation before vehicle dispatch.
- ₹100 nominal fee if cancelled after driver arrives at pickup doorstep.
- Full 100% refund for advance payments processed within 24 hours.
- 100% fee waiver in case of road closures, extreme weather, or landslides.

7. PROMOTION:
- Coupon Code GET100: ₹100 Off on first outstation ride!

RESPONSE GUIDELINES:
- Reply with warmth, high precision, clear markdown formatting, bold headings, bullet points, and exact numbers.
- When asked about pricing or routes, provide the exact fare, distance, travel time, and calculation breakdown.
- Always include a call/WhatsApp action link: [9894020156](tel:9894020156).`;

    // Prepare contents
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-8)) {
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
      model: 'gemini-3.7-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.6,
        tools: [{ googleSearch: {} }]
      }
    });

    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "Thank you for contacting Get Cabs Coimbatore. For instant cab bookings, please call or WhatsApp 9894020156.";
    
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
      text: "👋 Welcome to **Get Cabs Coimbatore (Gemini Mini)**!\n\nWe are available 24/7 for instant city cabs, CJB Airport transfers, and hill station tours (Ooty ₹3,500, Pollachi ₹1,600, Palani ₹3,900, Isha ₹1,100, Munnar ₹3,800).\n\n📞 **Call / WhatsApp 24/7**: [9894020156](tel:9894020156)\n📍 **Main Hubs**: Gandhipuram, Railway Station, Peelamedu Airport, RS Puram, Saravanampatti.",
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
