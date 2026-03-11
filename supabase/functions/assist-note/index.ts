import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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

    const { rawNotes, noteType, messages, mode, customPrompt, sections } = await req.json();

    if (!rawNotes || !rawNotes.trim()) {
      return new Response(JSON.stringify({ error: "No notes provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let systemPrompt: string;

    const hasSections = sections && sections.length > 0;

    if (mode === "rewrite") {
      // ── REWRITE MODE ──────────────────────────────────
      systemPrompt = `You are a clinical documentation assistant specializing in home health care. The clinician recorded raw visit notes and then had a conversation with you to clarify and add missing details. Now produce an updated version of the raw notes.

CRITICAL RULES:
- START with the ENTIRE original note text. Do NOT remove, summarize, or rephrase any existing content.
- APPEND or INSERT the new details from the conversation into the appropriate places within the original text.
- This is NOT a formatted clinical note — do NOT add section headings, bullet points, or reorganize into a clinical note structure.
- Keep the EXACT same voice, tone, and style as the original notes.
- The result should read as if the clinician had dictated everything in one pass — the original content plus the new details woven in seamlessly.
- If in doubt, keep the original wording and add new information alongside it rather than rewriting.
- Never include any patient-identifying information. Remove any patient names, initials, dates of birth, addresses, phone numbers, medical record numbers, or any other personally identifiable information. Use "the patient" or "pt" instead of names.
${hasSections ? `\nThe clinician's template requires these sections: ${sections.join(", ")}. When inserting new details from the conversation, place them near related content in the original notes so they naturally fall under the appropriate section when the note is later formatted.` : ""}
${customPrompt ? `\nAdditional template instructions: ${customPrompt}` : ""}

The note type is: ${noteType}

Original raw notes (preserve ALL of this content):
${rawNotes}`;

    } else {
      // ── CHAT MODE ─────────────────────────────────────
      systemPrompt = `You are a clinical documentation assistant specializing in home health care. You are helping a clinician review and improve their raw visit notes BEFORE generating a formal clinical note.

The note type selected is: ${noteType}
${hasSections ? `\nREQUIRED SECTIONS for this note type: ${sections.join(", ")}` : ""}
${customPrompt ? `\nAdditional template instructions: ${customPrompt}` : ""}

Your job:
1. On your FIRST message, give a brief opening review of the raw notes:
   - Use ✓ for things that are well-documented
   - Use ⚠ for gaps or missing information typical for a "${noteType}" note
${hasSections ? `   - IMPORTANT: Evaluate the raw notes against EACH of these required sections: ${sections.join(", ")}. For each section, note whether information is present (✓) or missing/insufficient (⚠).
   - After your review, list which required sections still need information.` : "   - Keep it concise (3-6 bullet points max)"}
   - Then ask ONE specific clarifying question about the most important gap${hasSections ? " (prioritize missing required sections)" : ""}

2. On subsequent messages, ask ONE clarifying question at a time. Focus on:
${hasSections ? `   - PRIORITY: Required sections that have not yet been addressed. Track which sections have been covered by the conversation so far, and ask about uncovered ones first.
   - Once all required sections have been addressed, move on to other clinical details.` : ""}
   - Missing clinical details expected for a "${noteType}" note (vitals, assessments, interventions, patient response, plan of care, functional status)
   - Vague or ambiguous descriptions that need specifics
   - Missing timeframes, measurements, or functional assessments
   - Do NOT repeat information already provided
   - Do NOT ask about information that is irrelevant to the note type

3. HIPAA awareness: If you notice any patient names, addresses, phone numbers, dates of birth, or other identifiers in the notes, flag them immediately with a ⚠ warning and advise the clinician to remove them.

4. When the user indicates they are done (e.g. "done", "finish", "that's all", "no more", "I'm good", "nothing else", "that covers it"), respond with EXACTLY this message and nothing else:
   "Got it! I have everything I need. Click **Update My Note** below to incorporate all the details we discussed."
   Do NOT ask any more questions after this.

5. Keep your responses SHORT and conversational — no more than 2-3 short paragraphs. You are chatting, not writing an essay. One question at a time.

Original raw notes:
${rawNotes}`;
    }

    // Build the messages array for the Anthropic API
    const apiMessages: Array<{ role: string; content: string }> = [];

    if (!messages || messages.length === 0) {
      // Initial call — Claude speaks first with opening review
      apiMessages.push({
        role: "user",
        content: "Please review my notes and let me know what looks good and what's missing."
      });
    } else {
      // Subsequent calls — include full conversation history
      for (const msg of messages) {
        apiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        messages: apiMessages,
      }),
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

    const text = data.content[0].text;

    // Detect if Claude's response signals the conversation is complete
    const isDone = text.includes("Update My Note");

    return new Response(JSON.stringify({ text, isDone }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
