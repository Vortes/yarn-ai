import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Session tracking schema
const sessionStatsSchema = z.object({
  tokenUsage: z.object({
    whisper: z.number(),
    gemini: z.number(),
  }),
  apiLatency: z.object({
    whisper: z.number(),
    gemini: z.number(),
  }),
  errorCounts: z.object({
    whisper: z.number(),
    gemini: z.number(),
  }),
});

type SessionStats = z.infer<typeof sessionStatsSchema>;

/**
 * Session Management and Analytics
 * Implementation of Phase 4 from the technical PRD
 */
export const sessionRouter = createTRPCRouter({
  // Initialize a new session (anonymous or authenticated)
  initSession: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        tempId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate that either userId or tempId is provided
        if (!input.userId && !input.tempId) {
          throw new Error("Either userId or tempId must be provided");
        }

        // Generate a new session ID
        const sessionId = generateSessionId();

        // Initialize session stats
        const initialStats: SessionStats = {
          tokenUsage: {
            whisper: 0,
            gemini: 0,
          },
          apiLatency: {
            whisper: 0,
            gemini: 0,
          },
          errorCounts: {
            whisper: 0,
            gemini: 0,
          },
        };

        // In a real implementation, we would store the session in the database
        // For this demo, we'll just return the session ID and initial stats
        return {
          success: true,
          sessionId,
          isAnonymous: !!input.tempId,
          stats: initialStats,
        };
      } catch (error) {
        console.error("Error initializing session:", error);

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred while initializing session",
        };
      }
    }),

  // Update session stats (for tracking API usage, performance, etc.)
  updateSessionStats: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        apiType: z.enum(["whisper", "gemini"]),
        tokenCount: z.number().optional(),
        latencyMs: z.number().optional(),
        errorOccurred: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // In a real implementation, we would update the stats in the database
        // For this demo, we'll just return success
        return {
          success: true,
          sessionId: input.sessionId,
          message: `Stats updated for ${input.apiType}`,
        };
      } catch (error) {
        console.error("Error updating session stats:", error);

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred while updating stats",
        };
      }
    }),

  // Migrate anonymous session data to a user account
  migrateAnonymousSession: publicProcedure
    .input(
      z.object({
        tempId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // In a real implementation, we would update all session data in the database
        // to associate it with the new userId instead of the tempId

        return {
          success: true,
          message: `Session data migrated from tempId ${input.tempId} to userId ${input.userId}`,
        };
      } catch (error) {
        console.error("Error migrating anonymous session:", error);

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred during session migration",
        };
      }
    }),

  // Get API usage metrics
  getApiMetrics: publicProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
        userId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        // In a real implementation, we would query the database for actual metrics
        // For this demo, we'll return sample metrics

        const sampleMetrics = {
          tokenUsage: {
            whisper: 1000,
            gemini: 3500,
          },
          apiLatency: {
            whisper: 250, // ms
            gemini: 600, // ms
          },
          errorCounts: {
            whisper: 0,
            gemini: 1,
          },
          estimatedCost: 0.07, // $
        };

        return {
          success: true,
          metrics: sampleMetrics,
        };
      } catch (error) {
        console.error("Error retrieving API metrics:", error);

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred while retrieving metrics",
        };
      }
    }),
});

/**
 * Helper function to generate a unique session ID
 */
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
