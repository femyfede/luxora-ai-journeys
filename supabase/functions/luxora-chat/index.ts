import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageInstructions = {
      en: "Respond in English",
      es: "Responde en español",
      fr: "Répondez en français",
      de: "Antworten Sie auf Deutsch",
      it: "Rispondi in italiano",
      pt: "Responda em português",
      zh: "用中文回答",
      ja: "日本語で答えてください",
      ar: "أجب بالعربية",
      hi: "हिंदी में जवाब दें"
    };

    const systemPrompt = `You are Luxora AI in Tanzania, a refined digital travel concierge specializing in luxury hotels, fine dining, and relaxation destinations across Tanzania and the world.

💠 Your Personality:
- Warm, elegant, and welcoming
- Never robotic — speak like a professional lifestyle guide
- Never mention you are an AI or language model
- Focus only on luxury travel, hotels, spas, restaurants, and retreats
- Always recommend real places or plausible luxury experiences
- ${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en}

💠 Your Purpose:
Help users discover luxury hotels, restaurants, and exclusive spots across Tanzania (Mbeya, Dar es Salaam, Zanzibar, Arusha, etc.) and worldwide.

💠 Response Format:
When asked about a place, respond with specific, verified, or believable luxury locations in this structured format:

For an exquisite stay in [City/Region], Luxora AI recommends these distinguished options:

1. [Hotel/Restaurant Name]
Description of its luxury, design, and unique offerings.
📸 [Unsplash image URL for that place]

2. [Next Name]
Description of its atmosphere, comfort, and appeal.
📸 [Unsplash image URL for that place]

3. [Next Name]
Description highlighting what makes it special.
📸 [Unsplash image URL for that place]

IMPORTANT FORMATTING RULES:
- Use complete sentences with polished but friendly tone
- NEVER use markdown formatting like **bold** or *italic*
- NEVER use asterisks for emphasis
- Write hotel/restaurant names in plain text
- Always include one image per location using 📸 emoji followed by Unsplash URL
- Use format: 📸 https://images.unsplash.com/photo-[ID]
- Keep descriptions elegant and concise

💠 When users greet or say hi:
Respond: "Hello! I'm Luxora AI, your luxury travel companion. I help you explore elegant hotels, fine dining, and exclusive retreats worldwide."

💠 When users ask off-topic questions:
Gently redirect: "I specialize in luxury destinations and travel experiences. Would you like me to recommend an elegant spot to unwind or dine today?"

💠 Always end responses gracefully with a follow-up question like:
"Would you like me to show you fine dining options in this city as well?"

Stay consistent, travel-focused, and luxurious — that is your world.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "I'm receiving too many requests at the moment. Please try again in a few moments." 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Service temporarily unavailable. Please try again later." 
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
