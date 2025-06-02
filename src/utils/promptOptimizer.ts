/**
 * Prompt Optimization Utilities
 * Implementation of Phase 4 (Token Usage Optimization) from the technical PRD
 */

/**
 * Estimates the number of tokens in a string
 * This is a simple approximation - actual token count depends on the specific tokenizer
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // Simple approximation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Optimizes a prompt to reduce token usage
 * @param prompt - The original prompt
 * @param options - Optimization options
 * @returns Optimized prompt
 */
export function optimizePrompt(
  prompt: string,
  options: {
    maxTokens?: number;
    preserveInstructions?: boolean;
    preserveContext?: boolean;
  } = {},
): string {
  const {
    maxTokens = 8000,
    preserveInstructions = true,
    preserveContext = true,
  } = options;

  // If the prompt is already within limits, return it as is
  if (estimateTokenCount(prompt) <= maxTokens) {
    return prompt;
  }

  // Split the prompt into sections (instructions, context, user input)
  const sections = splitPromptIntoSections(prompt);

  // Preserve instructions if specified
  let optimizedPrompt = preserveInstructions
    ? sections.instructions
    : summarizeSection(sections.instructions);

  // Add context (potentially summarized) if there's room
  const remainingTokens = maxTokens - estimateTokenCount(optimizedPrompt);

  if (remainingTokens > 200) {
    // If we need to preserve context but it's too long, summarize it
    const contextSection =
      preserveContext && estimateTokenCount(sections.context) <= remainingTokens
        ? sections.context
        : summarizeSection(sections.context);

    // Add as much context as fits within token limits
    optimizedPrompt += contextSection;
  }

  return optimizedPrompt;
}

/**
 * Splits a prompt into logical sections (instructions, context, user input)
 * @param prompt - The full prompt to split
 * @returns Object containing sections
 */
function splitPromptIntoSections(prompt: string): {
  instructions: string;
  context: string;
  userInput: string;
} {
  // This is a simplified implementation - in reality, you'd need more sophisticated parsing

  // Look for markers that typically separate instructions from context
  const instructionsEndMarker = prompt.indexOf("Transcribed text:");
  const contextEndMarker = prompt.indexOf("The user's latest response:");

  if (instructionsEndMarker === -1 || contextEndMarker === -1) {
    // If we can't identify clear sections, make a best guess
    const lines = prompt.split("\n");
    const thirdOfLines = Math.floor(lines.length / 3);

    return {
      instructions: lines.slice(0, thirdOfLines).join("\n"),
      context: lines.slice(thirdOfLines, thirdOfLines * 2).join("\n"),
      userInput: lines.slice(thirdOfLines * 2).join("\n"),
    };
  }

  return {
    instructions: prompt.substring(0, instructionsEndMarker),
    context: prompt.substring(instructionsEndMarker, contextEndMarker),
    userInput: prompt.substring(contextEndMarker),
  };
}

/**
 * Creates a summarized version of a section to reduce token usage
 * @param section - The section to summarize
 * @returns Summarized section
 */
function summarizeSection(section: string): string {
  // In a real implementation, you might use an LLM to summarize content
  // For this demo, we'll just truncate with a notice

  // Preserve the first 3 lines and last 3 lines
  const lines = section.split("\n");

  if (lines.length <= 8) {
    return section;
  }

  const firstLines = lines.slice(0, 3).join("\n");
  const lastLines = lines.slice(-3).join("\n");

  return `${firstLines}\n\n[Content summarized to reduce token usage]\n\n${lastLines}`;
}

/**
 * Measures and reports token usage for monitoring
 * @param prompt - The prompt sent to the LLM
 * @param response - The response from the LLM
 * @returns Token usage statistics
 */
export function trackTokenUsage(
  prompt: string,
  response: string,
): { promptTokens: number; responseTokens: number; totalTokens: number } {
  const promptTokens = estimateTokenCount(prompt);
  const responseTokens = estimateTokenCount(response);

  return {
    promptTokens,
    responseTokens,
    totalTokens: promptTokens + responseTokens,
  };
}
