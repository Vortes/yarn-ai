import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Define the expected response structure
const responseSchema = z.object({
  summary: z.string(),
  questions: z.array(z.string()),
});

type GeneratedInsights = z.infer<typeof responseSchema>;

/**
 * Initial Synthesis & Basic Question Generation
 * Implementation of Phase 1 Step 2 from the technical PRD
 */
export const synthesisRouter = createTRPCRouter({
  generateInitialInsights: publicProcedure
    .input(
      z.object({
        transcribedText: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Prompt for Gemini to analyze the transcribed text
        const prompt = `
        Analyze the following transcribed text and provide:
        1. A concise summary of the main points
        2. 2-3 open-ended, Socratic-style questions that would help the speaker explore their thoughts further

        Format the response as JSON with the following structure:
        {
          "summary": "the summary text",
          "questions": ["question 1", "question 2", "question 3"]
        }

        Transcribed text:
        ${input.transcribedText}
        `;

        // Call Gemini API to generate insights
        const response = await ctx.gemini.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
        });

        if (!response.text) {
          throw new Error("No response text received from Gemini API");
        }

        // Parse and validate the response
        const parsedResponse = responseSchema.parse(JSON.parse(response.text));

        return {
          success: true,
          summary: parsedResponse.summary,
          questions: parsedResponse.questions,
        };
      } catch (error) {
        console.error("Error generating insights:", error);

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred during insight generation",
        };
      }
    }),
});
