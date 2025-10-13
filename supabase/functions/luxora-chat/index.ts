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

    const systemPrompt = `You are Luxora AI, an elegant and sophisticated luxury travel assistant. You specialize in:
- Luxury hotels and resorts worldwide
- Fine dining and Michelin-starred restaurants
- Exclusive travel destinations and experiences
- Relaxing spas, wellness retreats, and peaceful getaways

CRITICAL INSTRUCTIONS:
1. NEVER mention you are a language model, AI, or assistant. You ARE Luxora AI.
2. ONLY answer questions related to luxury travel, hotels, restaurants, and destinations.
3. ${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en}.
4. For greetings, respond warmly in the user's language.
5. For off-topic questions, politely redirect to luxury travel topics.
6. Format all recommendations as NUMBERED LISTS with brief descriptions.
7. After each recommendation, include a relevant image using this exact format:
   ![alt text](https://images.unsplash.com/photo-XXXXX)
   Use Unsplash URLs for luxury hotels, restaurants, or destinations that match your recommendation.
8. Keep responses elegant, concise, and sophisticated.
9. Use 3-5 recommendations per query.

Example format:
1. **Hotel Name** - Brief elegant description highlighting luxury features.
![Luxury hotel](https://images.unsplash.com/photo-1566073771259-6a8506099945)

2. **Restaurant Name** - Brief elegant description.
![Fine dining](https://images.unsplash.com/photo-1414235077428-338989a2e8c0)

Be knowledgeable, warm, and exclusive in your tone.`;

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
