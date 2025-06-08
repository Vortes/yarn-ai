import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Define streaming update types
export type StreamUpdate =
  | { type: "thinking"; message: string }
  | { type: "streaming"; chunk: string }
  | { type: "complete"; result: { summary: string; questions: string[] } }
  | { type: "error"; error: string };

/**
 * Text Processing Service with Server-Sent Events
 */
export const textRouter = createTRPCRouter({
  // Streaming subscription for real-time text processing
  processTextStream: publicProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .subscription(async function* ({ input, ctx }) {
      try {
        // Step 1: Show thinking state
        yield {
          type: "thinking",
          message: "Analyzing your message...",
        };

        // Create a structured prompt for the AI
        const prompt = `

Someone just shared this with you: "${input.text}".
        `;

        // Step 2: Stream the AI response
        const streamResponse = await ctx.gemini.models.generateContentStream({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        let fullResponse = "";
        for await (const chunk of streamResponse) {
          const chunkText = chunk.text ?? "";
          fullResponse += chunkText;

          // Yield each chunk as it arrives
          yield {
            type: "streaming",
            chunk: chunkText,
          };
        }

        // Step 3: Complete with final result
        yield {
          type: "complete",
          result: {
            summary: fullResponse,
            questions: [],
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
