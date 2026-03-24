import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "Anthropic API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { generatedNote, noteType } = await req.json();

    if (!generatedNote || !generatedNote.trim()) {
      return new Response(JSON.stringify({ error: "No note provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const systemPrompt = `You are a home health clinical documentation specialist. Based on the clinical note provided, generate 3-5 measurable, patient-centered care plan goals.

Return ONLY a valid JSON array — no markdown, no code blocks, no explanatory text. Each object must have exactly two fields:
- "goal_text": A specific, measurable goal statement in standard care plan format (e.g., "Patient will ambulate 50 feet with rolling walker independently within 4 weeks")
- "timeframe": The target timeframe (e.g., "4 weeks", "2 weeks", "by discharge", "ongoing")

Guidelines:
- Goals must be SMART: Specific, Measurable, Achievable, Relevant, Time-bound
- Use standard home health clinical terminology
- Base goals ONLY on deficits, needs, or interventions documented in the note
- Include functional, safety, and/or educational goals as appropriate for the visit type
- Never include patient-identifying information`;

    const userMessage = `Note type: ${noteType || "home health visit"}\n\nClinical note:\n${generatedNote}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return new Response(JSON.stringify({
        error: data.error?.message || "Claude API returned an error",
        details: data
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const rawText = data.content[0].text;

    // Parse JSON — strip markdown code fences if Claude wrapped the output
    let goals;
    try {
      goals = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
      goals = JSON.parse(cleaned);
    }

    return new Response(JSON.stringify({ goals }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
