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

    const { notes, noteType, customPrompt, sections, outputFormat } = await req.json();

    if (!notes || !notes.trim()) {
      return new Response(JSON.stringify({ error: "No notes provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Build system prompt and user message separately for better instruction-following
    let systemPrompt;
    let userMessage;

    if (outputFormat === 'summary') {
      systemPrompt = `You are a clinical documentation assistant specializing in home health care. Your task is to write a concise clinical summary in plain paragraph form.

OUTPUT FORMAT: Write ONLY 2-3 flowing prose paragraphs. Do not use any headings, section titles, bullet points, numbered lists, tables, or any structured formatting whatsoever. The entire response must be continuous paragraphs of text, nothing else.

CONTENT: Summarize what happened during the visit — the patient's presentation, what the clinician observed and did, any interventions performed, and the patient's response. Do not include vital signs tables, pain scale ratings, formal goals, or plan of care sections — those are documented separately in the EMR.

PRIVACY: Never include patient-identifying information. Use "the patient" or "pt" instead of names. Omit dates of birth, addresses, phone numbers, medical record numbers, or any other personally identifiable information.`;

      userMessage = `Write a clinical summary in paragraph form for this ${noteType} visit.`;
      if (customPrompt) {
        userMessage += ` Additional instructions: ${customPrompt}`;
      }
      userMessage += `\n\nVisit notes:\n${notes}`;
    } else {
      systemPrompt = `You are a clinical documentation assistant specializing in home health care. Convert visit notes into properly formatted clinical notes. Follow standard home health documentation requirements and be concise and professional.

IMPORTANT: Never include any patient-identifying information in the generated note. This includes patient names, initials, dates of birth, addresses, phone numbers, medical record numbers, or any other personally identifiable information. Use "the patient" or "pt" instead of any names. If the visit notes contain patient identifiers, omit them from the output.`;

      userMessage = `Convert the following visit notes into a properly formatted ${noteType} note.`;

      if (sections && sections.length > 0) {
        userMessage += `\n\nOrganize the note using exactly these sections:\n${sections.map((s: string) => `- ${s}`).join('\n')}`;
      }

      if (customPrompt) {
        userMessage += `\n\nAdditional instructions: ${customPrompt}`;
      }

      userMessage += `\n\nVisit notes:\n${notes}`;
    }

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
        system: systemPrompt,
        messages: [{
          role: "user",
          content: userMessage
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
