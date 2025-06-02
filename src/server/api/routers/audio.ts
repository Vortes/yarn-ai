import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Define the streaming update types
const streamUpdateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("uploading"),
    progress: z.number(),
    message: z.string(),
  }),
  z.object({
    type: z.literal("transcribing"),
    progress: z.number(),
    message: z.string(),
  }),
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
    type: z.literal("streaming_questions"),
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

// Supported audio formats as per PRD and OpenAI documentation
const SUPPORTED_AUDIO_FORMATS = [
  "mp3",
  "mp4",
  "m4a",
  "wav",
  "webm",
  "flac",
  "aac",
  "ogg",
  "opus",
] as const;

// File size limits as per PRD
const MAX_FILE_SIZE_FREE = 100 * 1024 * 1024; // 100MB for free users
const MAX_FILE_SIZE_PREMIUM = 500 * 1024 * 1024; // 500MB for premium users
const MAX_DURATION_FREE = 5 * 60; // 5 minutes for free users
const MAX_DURATION_PREMIUM = 10 * 60; // 10 minutes for premium users

// Types for OpenAI client and responses
interface OpenAITranscriptionResponse {
  text: string;
}

interface OpenAIClient {
  audio: {
    transcriptions: {
      create: (params: {
        file: File;
        model: string;
        language?: string;
        response_format?: string;
        temperature?: number;
      }) => Promise<OpenAITranscriptionResponse>;
    };
  };
}

/**
 * Validates audio file format and size
 */
function validateAudioFile(url: string, isPremium = false): void {
  // Extract file extension from URL
  const urlPath = new URL(url).pathname;
  const extension = urlPath.split(".").pop()?.toLowerCase();

  if (
    !extension ||
    !(SUPPORTED_AUDIO_FORMATS as readonly string[]).includes(extension)
  ) {
    throw new Error(
      `Unsupported audio format. Supported formats: ${SUPPORTED_AUDIO_FORMATS.join(", ")}`,
    );
  }
}

/**
 * Downloads and validates audio file from URL
 */
async function downloadAndValidateAudio(
  url: string,
  isPremium = false,
): Promise<File> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch audio file: ${response.status} ${response.statusText}`,
      );
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.startsWith("audio/")) {
      throw new Error("Invalid file type. Expected audio file.");
    }

    // Check file size
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      const fileSize = parseInt(contentLength);
      const maxSize = isPremium ? MAX_FILE_SIZE_PREMIUM : MAX_FILE_SIZE_FREE;

      if (fileSize > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        throw new Error(
          `File size exceeds limit. Maximum size: ${maxSizeMB}MB`,
        );
      }
    }

    const audioBlob = await response.blob();

    // Create File object with proper name and type
    const urlPath = new URL(url).pathname;
    const filename = urlPath.split("/").pop() ?? "audio.mp3";
    const file = new File([audioBlob], filename, {
      type: audioBlob.type || "audio/mpeg",
    });

    return file;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Audio download failed: ${error.message}`);
    }
    throw new Error("Audio download failed: Unknown error");
  }
}

/**
 * Transcribes audio using OpenAI Whisper with optimized parameters
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function transcribeAudio(file: File, openaiClient: any): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const transcription = await openaiClient.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en", // Optimize for English as per PRD
      response_format: "verbose_json", // Get additional metadata
      temperature: 0.0, // Use deterministic output
    });

    // Access the text from the verbose response
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const transcriptionText = transcription.text as string;

    if (!transcriptionText?.trim()) {
      throw new Error("No speech detected in audio file");
    }

    return transcriptionText.trim();
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific OpenAI API errors
      if (error.message.includes("Invalid file format")) {
        throw new Error(
          "Unsupported audio format. Please use MP3, WAV, M4A, or other supported formats.",
        );
      }
      if (error.message.includes("File too large")) {
        throw new Error("Audio file is too large. Please use a smaller file.");
      }
      if (error.message.includes("duration")) {
        throw new Error(
          "Audio file is too long. Maximum duration is 10 minutes.",
        );
      }
      throw new Error(`Transcription failed: ${error.message}`);
    }
    throw new Error("Transcription failed: Unknown error");
  }
}

/**
 * Audio Transcription Service Integration
 * Implementation following OpenAI best practices and PRD specifications
 */
export const audioRouter = createTRPCRouter({
  transcribe: publicProcedure
    .input(
      z.object({
        audioFileUrl: z.string().url(),
        isPremium: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate audio file format
        validateAudioFile(input.audioFileUrl, input.isPremium);

        // Download and validate the audio file
        const audioFile = await downloadAndValidateAudio(
          input.audioFileUrl,
          input.isPremium,
        );

        // Transcribe the audio using OpenAI Whisper
        const transcriptionText = await transcribeAudio(audioFile, ctx.openai);

        return {
          success: true,
          transcription: transcriptionText,
        };
      } catch (error) {
        console.error("Error transcribing audio:", error);

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred during transcription",
        };
      }
    }),

  // SSE subscription for full audio processing with real-time updates
  processAudioStream: publicProcedure
    .input(
      z.object({
        audioFileUrl: z.string().url(),
        framework: z.string().optional().default("cognitive-behavioral"),
        isPremium: z.boolean().optional().default(false),
      }),
    )
    .subscription(async function* (opts) {
      const { input, ctx } = opts;

      try {
        // Step 1: Validate and download audio file
        yield {
          type: "uploading",
          progress: 10,
          message: "Validating and processing audio file...",
        };

        // Validate audio file format first
        validateAudioFile(input.audioFileUrl, input.isPremium);

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Download and validate the audio file
        const audioFile = await downloadAndValidateAudio(
          input.audioFileUrl,
          input.isPremium,
        );

        // Step 2: Transcription using OpenAI Whisper
        yield {
          type: "transcribing",
          progress: 30,
          message: "Transcribing audio with Whisper...",
        };

        const transcriptionText = await transcribeAudio(audioFile, ctx.openai);

        // Step 3: AI Analysis preparation
        yield {
          type: "analyzing",
          progress: 60,
          message: "Analyzing content for insights...",
        };

        await new Promise((resolve) => setTimeout(resolve, 800));

        // Generate summary and questions using Gemini streaming
        const prompt = `
          You are a skilled thought partner and insight facilitator. Your role is to help people organize their thoughts and uncover deeper insights about what they're experiencing.

          Someone just shared this with you: "${transcriptionText}"

          Please analyze what they've shared and provide a structured, insightful response that helps them see their situation more clearly. Use the following format:

          **SECTION 1: What You're Experiencing**
          - Identify the key states, patterns, or dynamics they're describing
          - Highlight any cycles or recurring themes
          - Name the core experiences or challenges

          **SECTION 2: What You Want**  
          - Clarify what they're seeking or hoping to achieve
          - Identify their underlying goals or desires
          - Highlight what they want to move toward

          **SECTION 3: What You Already Know Works**
          - Acknowledge insights, strategies, or approaches they've already identified
          - Validate their existing wisdom and self-awareness
          - Recognize patterns of what has been helpful

          **SECTION 4: The Real Challenge You've Identified**
          - Name the core issue or pattern at the heart of what they're sharing
          - Identify root causes rather than surface symptoms
          - Point to the fundamental dynamic that seems to drive other issues

          **SECTION 5: Questions to Consider**
          - Ask 3-4 thoughtful questions that help them explore deeper
          - Questions should be specific, practical, and insightful
          - End with one question that feels like the most important next exploration

          Make sure to:
          - Be validating and acknowledge their self-awareness when appropriate
          - Use their exact language and examples when possible
          - Focus on patterns and insights rather than just summarizing
          - Ask questions that lead to actionable insights
          - Keep the tone warm but insightful

          Format your response as valid JSON:
          {
            "summary": "A thoughtfully structured response following the exact format above, with clear section headers and bullet points. Include all 5 sections in this single summary field.",
            "questions": ["question 1", "question 2", "question 3", "question 4"]
          }
        `;

        // Step 4: Start streaming AI response
        yield {
          type: "generating",
          progress: 85,
          message: "Generating thoughtful response...",
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

        // Step 5: Complete
        yield {
          type: "complete",
          progress: 100,
          result: {
            transcription: transcriptionText,
            summary: aiResult.summary,
            questions: aiResult.questions,
          },
        };
      } catch (error) {
        console.error("Error in audio processing stream:", error);
        yield {
          type: "error",
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    }),
});
