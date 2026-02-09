import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, reportText } = await req.json() as {
    messages: UIMessage[];
    reportText?: string;
  };

  const systemPrompt = `You are PetrolHead Assistant, an expert analyst for fuel station intelligence reports. You have access to a detailed fuel station profile report below. Answer the user's questions based ONLY on the data in this report. Be specific, cite exact numbers, names, dates, and evidence from the report. If the answer is not in the report, say so clearly.

Keep answers concise but thorough. Use bullet points for lists. Highlight important data like scores, revenue figures, risk factors, and competitor details when relevant.

=== FUEL STATION REPORT ===
${reportText ?? "No report data provided."}
=== END REPORT ===`;

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    system: systemPrompt,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
