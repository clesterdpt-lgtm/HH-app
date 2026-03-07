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

    const { notes, noteType, customPrompt, sections } = await req.json();

    if (!notes || !notes.trim()) {
      return new Response(JSON.stringify({ error: "No notes provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Build prompt — append custom instructions and sections when provided
    let prompt = `You are a clinical documentation assistant specializing in home health care. Convert the following visit notes into a properly formatted ${noteType} note. Follow standard home health documentation requirements and be concise and professional.`;

    if (sections && sections.length > 0) {
      prompt += `\n\nOrganize the note using exactly these sections:\n${sections.map((s: string) => `- ${s}`).join('\n')}`;
    }

    if (customPrompt) {
      prompt += `\n\nAdditional instructions: ${customPrompt}`;
    }

    prompt += `\n\nVisit notes: ${notes}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: prompt
        }]
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

    const generatedNote = data.content[0].text;

    return new Response(JSON.stringify({ text: generatedNote }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
