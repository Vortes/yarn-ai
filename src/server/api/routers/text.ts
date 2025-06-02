import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Define the streaming update types
const streamUpdateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("analyzing"),
    progress: z.number(),
    message: z.string(),
  }),
  z.object({
    type: z.literal("generating"),
    progress: z.number(),
    message: z.string(),
  }),
  z.object({
    type: z.literal("streaming_summary"),
    chunk: z.string(),
    isComplete: z.boolean(),
  }),
  z.object({
    type: z.literal("complete"),
    progress: z.number(),
    result: z.object({
      transcription: z.string(),
      summary: z.string(),
      questions: z.array(z.string()),
    }),
  }),
  z.object({
    type: z.literal("error"),
    error: z.string(),
  }),
]);

export type StreamUpdate = z.infer<typeof streamUpdateSchema>;

/**
 * Text Processing Service
 * Handles streaming AI responses for text input
 */
export const textRouter = createTRPCRouter({
  // SSE subscription for text input processing with real-time updates
  processTextStream: publicProcedure
    .input(
      z.object({
        text: z.string(),
        framework: z.string().optional().default("cognitive-behavioral"),
      }),
    )
    .subscription(async function* (opts) {
      const { input, ctx } = opts;

      try {
        // Step 1: Processing text input
        yield {
          type: "analyzing",
          progress: 40,
          message: "Analyzing your message...",
        };

        await new Promise((resolve) => setTimeout(resolve, 800));

        // Generate summary and questions using Gemini
        const prompt = `
          You are a thoughtful, empathetic listener - like a really good friend who's great at helping people sort through their thoughts. You're not a therapist, just someone who genuinely cares and wants to understand.

          Someone just shared this with you: "${input.text}"

          Your role is to:
          1. Help them see their thoughts more clearly by reflecting back what you're hearing in an organized way
          2. Ask gentle, curious questions that help they explore what they're really thinking and feeling

          Please provide:
          1. A THOUGHTFUL REFLECTION that helps organize their thoughts. Focus on:
             - What you're genuinely hearing them say
             - Patterns or connections you notice
             - What seems to be at the heart of what they're sharing
             - Organizing their "mental mumble" into clearer thoughts

          2. 3-4 warm, curious questions that:
             - Show you're really listening and want to understand more
             - Help them think through what they're experiencing
             - Are conversational and natural, not clinical
             - Come from genuine curiosity about their experience

          Keep it natural and conversational - like how you'd talk to a close friend.

          Respond in JSON format:
          {
            "summary": "Your warm, thoughtful reflection of what you're hearing - helping organize their thoughts into something clearer while showing you really get what they're going through",
            "questions": ["question 1", "question 2", "question 3", "question 4"]
          }
        `;

        // Step 2: Generating response
        yield {
          type: "generating",
          progress: 75,
          message: "Generating thoughtful questions...",
        };

        const streamResponse = await ctx.gemini.models.generateContentStream({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        let fullResponse = "";
        for await (const chunk of streamResponse) {
          const chunkText = chunk.text ?? "";
          fullResponse += chunkText;

          // Stream the chunk to frontend
          yield {
            type: "streaming_summary",
            chunk: chunkText,
            isComplete: false,
          };
        }

        // Mark streaming as complete
        yield {
          type: "streaming_summary",
          chunk: "",
          isComplete: true,
        };

        console.log("Full streamed response:", fullResponse);

        // Parse the complete response
        let aiResult: { summary: string; questions: string[] };
        try {
          console.log("Attempting to parse:", fullResponse);

          // Try to extract JSON from the response if it's wrapped in markdown or has extra text
          let jsonText = fullResponse.trim();

          // Remove markdown code block formatting if present
          if (jsonText.startsWith("```json")) {
            jsonText = jsonText
              .replace(/^```json\s*/, "")
              .replace(/\s*```$/, "");
          } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
          }

          // Look for JSON object in the text
          const jsonRegex = /\{[\s\S]*\}/;
          const jsonMatch = jsonRegex.exec(jsonText);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }

          console.log("Cleaned JSON text:", jsonText);

          const parsed = JSON.parse(jsonText) as unknown;
          console.log("Parsed result:", parsed);

          if (
            typeof parsed === "object" &&
            parsed !== null &&
            "summary" in parsed &&
            "questions" in parsed &&
            typeof (parsed as { summary: unknown }).summary === "string" &&
            Array.isArray((parsed as { questions: unknown }).questions)
          ) {
            aiResult = parsed as { summary: string; questions: string[] };
          } else {
            console.log(
              "Invalid format. Expected summary and questions, got:",
              parsed,
            );
            throw new Error("AI response format is invalid");
          }
        } catch (parseError) {
          console.error("JSON Parse error:", parseError);
          console.error("Response text that failed to parse:", fullResponse);
          throw new Error("Failed to parse AI response");
        }

        // Step 3: Complete
        yield {
          type: "complete",
          progress: 100,
          result: {
            transcription: input.text, // Use the original text as "transcription"
            summary: aiResult.summary,
            questions: aiResult.questions,
          },
        };
      } catch (error) {
        console.error("Error in text processing stream:", error);
        yield {
          type: "error",
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    }),
});
