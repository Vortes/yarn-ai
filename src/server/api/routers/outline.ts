import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Define the expected outline structure
const outlineSchema = z.object({
  hook: z.string(),
  mainPoints: z.array(z.string()),
  callToAction: z.string().optional(),
  visualIdeas: z.array(z.string()),
});

type ContentOutline = z.infer<typeof outlineSchema>;

// Define the message type for conversation history (same as in conversation.ts)
const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

type Message = z.infer<typeof messageSchema>;

// Context type for TypeScript safety
type TRPCContext = {
  gemini: {
    models: {
      generateContent: (params: {
        model: string;
        contents: string;
      }) => Promise<{ text: string | undefined }>;
    };
  };
};

/**
 * Content Outline Generation
 * Implementation of Phase 3 from the technical PRD
 */
export const outlineRouter = createTRPCRouter({
  generateContentOutline: publicProcedure
    .input(
      z.object({
        conversationSummary: z.string(),
        conversationHistory: z.array(messageSchema).optional(),
        nicheStylePreferences: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Prepare the prompt based on the available inputs
        const prompt = generateOutlinePrompt(
          input.conversationSummary,
          input.conversationHistory,
          input.nicheStylePreferences,
        );

        // Call Gemini API to generate the content outline
        const response = await ctx.gemini.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
        });

        if (!response.text) {
          throw new Error("No response text received from Gemini API");
        }

        // Parse and validate the response
        const parsedOutline = outlineSchema.parse(JSON.parse(response.text));

        return {
          success: true,
          outline: parsedOutline,
        };
      } catch (error) {
        console.error("Error generating content outline:", error);

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred while generating content outline",
        };
      }
    }),
});

/**
 * Helper function to generate the outline prompt
 */
function generateOutlinePrompt(
  conversationSummary: string,
  conversationHistory?: Message[],
  nicheStylePreferences?: string,
): string {
  // Start with the base prompt
  let prompt = `
  You are an expert content strategist for TikTok and short-form video creators.
  
  Based on the following summary of a conversation with a content creator, generate a structured outline for a short-form TikTok video (60 seconds or less).
  
  Summary of conversation:
  ${conversationSummary}
  `;

  // Add conversation history if available
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `
    
    For additional context, here's the full conversation history:
    ${formatConversationHistory(conversationHistory)}
    `;
  }

  // Add niche/style preferences if available
  if (nicheStylePreferences) {
    prompt += `
    
    The creator has the following niche/style preferences:
    ${nicheStylePreferences}
    
    Please tailor the outline to align with these preferences.
    `;
  }

  // Add the output format instructions
  prompt += `
  
  Generate a structured outline with the following components:
  
  1. Hook: An attention-grabbing opening (5-10 seconds) that will immediately engage viewers
  2. Main Points/Story Beats: 3-5 key points or narrative elements to cover in the video
  3. Call to Action (Optional): A suggestion for viewer engagement at the end (if relevant)
  4. Visual/Shot Ideas: High-level suggestions for visuals that could accompany each part of the video
  
  Use storytelling principles to create a compelling narrative flow. The outline should be specific enough to guide the creator but leave room for their personal style and execution.
  
  Format your response as JSON with the following structure:
  {
    "hook": "Hook description",
    "mainPoints": ["Point 1", "Point 2", "Point 3"],
    "callToAction": "CTA description (optional)",
    "visualIdeas": ["Visual idea 1", "Visual idea 2", "Visual idea 3", "Visual idea 4"]
  }
  `;

  return prompt;
}

/**
 * Helper function to format conversation history
 */
function formatConversationHistory(history: Message[]): string {
  return history
    .map((message) => {
      const role = message.role === "user" ? "User" : "Assistant";
      return `${role}: ${message.content}`;
    })
    .join("\n\n");
}
