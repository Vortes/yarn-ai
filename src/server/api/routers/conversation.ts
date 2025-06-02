import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  estimateTokenCount,
  optimizePrompt,
  trackTokenUsage,
} from "~/utils/promptOptimizer";

// Define the supported therapeutic frameworks
const TherapeuticFramework = z.enum([
  "socratic",
  "motivational",
  "narrative",
  "solutionFocused",
  "cognitive",
]);

type TherapeuticFramework = z.infer<typeof TherapeuticFramework>;

// Response structure for conversation
const conversationResponseSchema = z.object({
  newSummary: z.string().optional(),
  newQuestions: z.array(z.string()),
});

type ConversationResponse = z.infer<typeof conversationResponseSchema>;

// Define the message type for conversation history
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
 * Therapeutic Frameworks & Iterative Conversation
 * Implementation of Phase 2 from the technical PRD
 * Updated in Phase 4 with token usage optimization
 */
export const conversationRouter = createTRPCRouter({
  // Start a new conversation with framework selection
  startConversation: publicProcedure
    .input(
      z.object({
        transcribedText: z.string(),
        framework: TherapeuticFramework,
        sessionId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Generate the prompt based on the framework
        const prompt = getPromptForFramework(
          input.framework,
          input.transcribedText,
        );

        // Optimize the prompt to reduce token usage
        const optimizedPrompt = optimizePrompt(prompt, {
          maxTokens: 7000,
          preserveInstructions: true,
        });

        // Track token usage before API call
        const promptTokenCount = estimateTokenCount(optimizedPrompt);
        console.log(`Prompt token count (estimated): ${promptTokenCount}`);

        // Start timer for latency tracking
        const startTime = Date.now();

        // Call Gemini API to generate initial insights with the selected framework
        const response = await ctx.gemini.models.generateContent({
          model: "gemini-2.0-flash",
          contents: optimizedPrompt,
        });

        // Calculate latency
        const latencyMs = Date.now() - startTime;
        console.log(`API call latency: ${latencyMs}ms`);

        if (!response.text) {
          throw new Error("No response text received from Gemini API");
        }

        // Track complete token usage
        const tokenUsage = trackTokenUsage(optimizedPrompt, response.text);
        console.log(`Total token usage: ${tokenUsage.totalTokens}`);

        // Parse and validate the response
        const parsedResponse = conversationResponseSchema.parse(
          JSON.parse(response.text),
        );

        // If session ID is provided, update session stats (in a real app)
        if (input.sessionId) {
          // This would be an actual API call in a complete implementation
          console.log(`Updating stats for session ${input.sessionId}`);
          // await ctx.session.updateStats(...)
        }

        return {
          success: true,
          summary: parsedResponse.newSummary ?? "",
          questions: parsedResponse.newQuestions,
          metrics: {
            tokenUsage: tokenUsage.totalTokens,
            latencyMs,
          },
        };
      } catch (error) {
        console.error("Error starting conversation:", error);

        // If session ID is provided, log the error (in a real app)
        if (input.sessionId) {
          console.log(`Logging error for session ${input.sessionId}`);
          // await ctx.session.logError(...)
        }

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred while starting conversation",
        };
      }
    }),

  // Continue an existing conversation
  continueConversation: publicProcedure
    .input(
      z.object({
        conversationHistory: z.array(messageSchema),
        userResponse: z.string(),
        framework: TherapeuticFramework,
        sessionId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Create a prompt that includes conversation history and the current framework
        const prompt = `
        You are having a conversation with a content creator using the ${getFrameworkDescription(input.framework)} approach.

        Here is the conversation history:
        ${formatConversationHistory(input.conversationHistory)}

        The user's latest response:
        ${input.userResponse}

        Based on the conversation history and the user's latest response, please:
        1. Acknowledge and synthesize the user's response
        2. Generate 2-3 new reflective questions based on the ongoing conversation, following the principles of ${getFrameworkDescription(input.framework)}

        Format your response as JSON with the following structure:
        {
          "newSummary": "your synthesis of the user's response (optional)",
          "newQuestions": ["question 1", "question 2", "question 3"]
        }
        `;

        // Optimize the prompt to reduce token usage
        const optimizedPrompt = optimizePrompt(prompt, {
          maxTokens: 7000,
          preserveInstructions: true,
          preserveContext: false, // Summarize context if needed to save tokens
        });

        // Track token usage and latency
        const promptTokenCount = estimateTokenCount(optimizedPrompt);
        const startTime = Date.now();

        // Call Gemini API to continue the conversation
        const response = await ctx.gemini.models.generateContent({
          model: "gemini-2.0-flash",
          contents: optimizedPrompt,
        });

        // Calculate latency
        const latencyMs = Date.now() - startTime;

        if (!response.text) {
          throw new Error("No response text received from Gemini API");
        }

        // Track complete token usage
        const tokenUsage = trackTokenUsage(optimizedPrompt, response.text);

        // Parse and validate the response
        const parsedResponse = conversationResponseSchema.parse(
          JSON.parse(response.text),
        );

        // If session ID is provided, update session stats (in a real app)
        if (input.sessionId) {
          console.log(`Updating stats for session ${input.sessionId}`);
          // await ctx.session.updateStats(...)
        }

        return {
          success: true,
          summary: parsedResponse.newSummary ?? "",
          questions: parsedResponse.newQuestions,
          metrics: {
            tokenUsage: tokenUsage.totalTokens,
            latencyMs,
          },
        };
      } catch (error) {
        console.error("Error continuing conversation:", error);

        // If session ID is provided, log the error (in a real app)
        if (input.sessionId) {
          console.log(`Logging error for session ${input.sessionId}`);
          // await ctx.session.logError(...)
        }

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred during conversation",
        };
      }
    }),
});

/**
 * Helper functions for conversation management
 */

// Generate prompts based on the selected therapeutic framework
function getPromptForFramework(
  framework: TherapeuticFramework,
  transcribedText: string,
): string {
  const basePrompt = `
  Analyze the following transcribed text from a content creator and provide:
  1. A concise summary of the main points
  2. 2-3 open-ended, reflective questions based on the summary
  
  Format the response as JSON with the following structure:
  {
    "newSummary": "the summary text",
    "newQuestions": ["question 1", "question 2", "question 3"]
  }
  
  Transcribed text:
  ${transcribedText}
  `;

  switch (framework) {
    case "socratic":
      return `
      ${basePrompt}
      
      Use Socratic Questioning techniques:
      - Ask open-ended questions that challenge assumptions
      - Explore implications and consequences of ideas
      - Examine multiple perspectives on a topic
      - Questions should seek clarification, probe assumptions, or explore evidence
      `;

    case "motivational":
      return `
      ${basePrompt}
      
      Use Motivational Interviewing techniques:
      - Ask evocative questions that elicit "change talk"
      - Use reflective listening in your summary
      - Explore ambivalence about ideas to find authentic positions
      - Questions should explore discrepancies, elicit self-motivational statements, or scale importance/confidence
      `;

    case "narrative":
      return `
      ${basePrompt}
      
      Use Narrative Therapy approaches:
      - Externalize problems/topics from the person
      - Identify unique outcomes or exceptions to dominant stories
      - Help users re-author their narrative around a topic
      - Questions should explore alternative stories, externalize problems, or identify unique outcomes
      `;

    case "solutionFocused":
      return `
      ${basePrompt}
      
      Use Solution-Focused Brief Therapy elements:
      - Focus on solutions rather than problems
      - Envision ideal outcomes with miracle questions
      - Find exceptions to when problems don't exist
      - Questions should be future-oriented, explore exceptions, or use scaling
      `;

    case "cognitive":
      return `
      ${basePrompt}
      
      Use Cognitive Behavioral techniques:
      - Identify cognitive distortions in thinking
      - Challenge black-and-white thinking with nuance
      - Examine evidence for and against beliefs
      - Questions should identify thought patterns, challenge distortions, or explore evidence
      `;

    default:
      return basePrompt;
  }
}

// Get a human-readable description of the framework
function getFrameworkDescription(framework: TherapeuticFramework): string {
  switch (framework) {
    case "socratic":
      return "Socratic Questioning";
    case "motivational":
      return "Motivational Interviewing";
    case "narrative":
      return "Narrative Therapy";
    case "solutionFocused":
      return "Solution-Focused Brief Therapy";
    case "cognitive":
      return "Cognitive Behavioral Therapy";
    default:
      return "reflective questioning";
  }
}

// Format conversation history for the prompt
function formatConversationHistory(history: Message[]): string {
  return history
    .map((message) => {
      const role = message.role === "user" ? "User" : "Assistant";
      return `${role}: ${message.content}`;
    })
    .join("\n\n");
}

// This function is now handled by the promptOptimizer utility
async function manageContextLength(
  prompt: string,
  ctx: TRPCContext,
): Promise<string> {
  return optimizePrompt(prompt, {
    maxTokens: 7000,
    preserveInstructions: true,
    preserveContext: true,
  });
}
