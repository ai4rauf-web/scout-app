import { NextRequest } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are Scout, Property Finder's conversational property-search assistant for the UAE.

Your job:
- Help users find UAE property (Dubai / Abu Dhabi / Sharjah).
- Reply in one short paragraph (max 3 sentences).
- Then suggest 2–3 concrete listings if you can (make up realistic Dubai listings with tower name, sqft, AED price, and community).
- Never invent user preferences. If the user says "2M", that is their stated budget. Do not silently expand it.
- If you assume anything, say so with the phrase "I'm assuming…" once, briefly.
- Do not offer to "search" — you already have the results. Speak as if you've searched.
- Prices in AED. Areas: Dubai Marina, JBR, Downtown, Palm Jumeirah, Dubai Hills, Business Bay, Jumeirah, JVC, Dubai South.
- Keep replies human — like a smart broker friend, not a search results page.

Format:
- Short answer paragraph.
- 3 listings, one per line, each: **Tower name** — X,XXX sqft · AED X.XM · [status]
- No bullet list markers, no headers, no numbered lists.`;

export async function POST(req: NextRequest) {
  const key = process.env.GROQ_API_KEY;

  const body = await req.json();
  const messages = body?.messages ?? [];

  // Scripted fallback if no key
  if (!key) {
    return streamScripted();
  }

  try {
    const groq = new Groq({ apiKey: key });
    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages,
    ];

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: chatMessages,
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices?.[0]?.delta?.content ?? "";
            if (token) controller.enqueue(encoder.encode(token));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    // Fall back to scripted stream on any Groq error
    return streamScripted();
  }
}

function streamScripted(): Response {
  const script = `176 listings in Dubai Marina under 2M AED — mostly furnished and ready to move in. Yields around Marina are ~5.5% if you ever plan to rent it out. Three that stand out on the first page:

**The Zen Tower** — 1,474 sqft · AED 1.7M · furnished, ready
**Marina Crown** — 1,494 sqft · AED 1.9M · just listed today
**Marina Diamond 2** — 1,355 sqft · AED 1.6M · furnished`;

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const tokens = script.split(/(\s+)/);
      for (const token of tokens) {
        controller.enqueue(encoder.encode(token));
        await new Promise((r) => setTimeout(r, 25));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
