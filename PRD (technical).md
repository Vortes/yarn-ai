# InsightSpark: AI MVP Development Guide

**Version:** 1.1
**Date:** June 1, 2025
**Based on PRD Version:** 1.2

## 1. Overview

This document outlines the phased development plan for the AI components of InsightSpark, a web application designed to help content creators generate insights and content outlines through AI-powered conversations. The AI's primary role is to transcribe user audio, engage in a reflective dialogue using therapeutic questioning techniques, and finally generate a structured content outline.

## 2. Core AI Stack & Services

- **Primary LLM:**
  - **Development:** Gemini 2.5 Flash (via Google AI API)
  - **Production:** Anthropic Claude 3.5 Sonnet (via API)
- **Audio Transcription:** OpenAI Whisper API
- **Backend Communication:** tRPC (AI logic will be exposed via tRPC procedures)

## 3. Development Phases

### Phase 1: Core Audio Processing & Initial Interaction (MVP v0.1)

**Goal:** Enable basic audio input, transcription, and a first-pass AI response.

**Tasks:**

1.  **Audio Transcription Service Integration:**

    - Implement a tRPC procedure that accepts an audio file (from UploadThing).
    - Integrate with OpenAI Whisper API to transcribe the audio to text.
    - Handle API errors and responses.
    - Return the transcription text.
    - **Input:** Audio file URL/blob.
    - **Output:** Plain text transcription.

2.  **Initial Synthesis & Basic Question Generation:**

    - Create a tRPC procedure that takes transcribed text as input.
    - Develop a prompt for Claude 3.5 Sonnet to:
      - Summarize the main points from the transcription.
      - Generate 2-3 open-ended, reflective questions based on the summary.
      - For this initial phase, focus on a single, simple questioning style (e.g., basic Socratic or general reflective questions) before implementing the full therapeutic framework selection.
    - **Input:** Transcribed text.
    - **Output:** JSON object `{ summary: string, questions: string[] }`.

3.  **Basic Error Handling & Logging:**
    - Implement basic error handling for API calls (Whisper, Claude).
    - Log key events and errors for debugging.

**Acceptance Criteria for Phase 1:**

- User can upload/record audio, and it gets transcribed.
- The transcription is sent to Claude, and a summary + basic questions are returned.
- The system handles common API errors gracefully.

---

### Phase 2: Implementing Therapeutic Frameworks & Iterative Conversation (MVP v0.2)

**Goal:** Implement the full conversational AI flow with user-selectable therapeutic frameworks.

**Tasks:**

1.  **Therapeutic Framework Selection Logic:**

    - Modify the AI tRPC procedure to accept a parameter indicating the user-selected therapeutic framework (e.g., `framework: "socratic" | "narrative" | ...`).
    - Develop distinct system prompts and/or instruction sets for the LLM (Gemini 2.5 Flash in development, Claude 3.5 Sonnet in production) for each of the 5 specified therapeutic frameworks:
      - Socratic Questioning
      - Motivational Interviewing Techniques
      - Narrative Therapy Approaches
      - Solution-Focused Brief Therapy Elements
      - Cognitive Behavioral Techniques
    - Ensure the AI's questions align with the principles of the selected framework.

2.  **Iterative Conversation Handling:**

    - Develop a tRPC procedure to handle user responses (text or new transcribed audio) to AI questions.
    - This procedure should take:
      - Current conversation history (or relevant context).
      - User's latest response.
      - Selected therapeutic framework.
    - Prompt the LLM (Gemini 2.5 Flash in development, Claude 3.5 Sonnet in production) to:
      - Acknowledge/synthesize the user's response.
      - Generate new reflective questions based on the ongoing conversation and selected framework.
      - Maintain conversational context.
    - **Input:** `{ conversationHistory: object[], userResponse: string, framework: string }`.
    - **Output:** JSON object `{ newSummary?: string, newQuestions: string[] }`.

3.  **Context Management:**
    - Implement a strategy for managing conversation history to be passed to Claude, ensuring it stays within token limits while retaining essential context. This might involve summarizing older parts of the conversation.

**Acceptance Criteria for Phase 2:**

- Users can select a therapeutic framework, and the AI's questions reflect that choice.
- The AI can engage in at least 3-4 turns of conversation, maintaining context.
- The system can handle both text and audio responses from the user for follow-up questions.

---

### Phase 3: Content Outline Generation (MVP v0.3)

**Goal:** Enable the AI to generate a structured content outline based on the conversation.

**Tasks:**

1.  **Outline Generation Logic:**

    - Create a tRPC procedure that takes the full conversation history (or a summary of key insights) and user's niche/style preferences.
    - Develop a prompt for the LLM (Gemini 2.5 Flash in development, Claude 3.5 Sonnet in production) to generate a content outline for a short-form TikTok video.
    - The outline should include:
      - Hook suggestions.
      - Main Points/Story Beats.
      - Optional Call to Action.
      - High-level Visual/Shot Ideas.
    - The prompt should instruct the LLM to use storytelling principles and tailor the tone based on the provided niche/style.
    - **Input:** `{ conversationSummary: string, nicheStylePreferences?: string }`.
    - **Output:** JSON object representing the structured outline (e.g., `{ hook: string, mainPoints: string[], callToAction?: string, visualIdeas: string[] }`).

2.  **Prompt Engineering & Refinement:**
    - Based on internal testing and initial user feedback (if available), iterate on all LLM prompts (synthesis, questioning for each framework, outline generation) to improve:
      - Quality of insights.
      - Relevance and depth of questions.
      - Clarity and usefulness of outlines.
      - Adherence to therapeutic framework principles.
      - Tone and style consistency.
    - Ensure prompts work effectively with both Gemini 2.5 Flash (development) and Claude 3.5 Sonnet (production).

**Acceptance Criteria for Phase 3:**

- The AI can generate a structured content outline based on the preceding conversation.
- The outline includes all specified components (hook, main points, etc.).
- The outline reflects any user-provided niche/style preferences.

---

### Phase 4: Anonymous User Handling & Refinements (MVP v0.4)

**Goal:** Ensure AI functionalities work seamlessly for anonymous users and refine prompts based on testing.

**Tasks:**

1.  **Anonymous Session AI Interaction:**

    - Verify that all AI-related tRPC procedures function correctly for anonymous users (identified by `tempId` instead of `userId`).
    - Ensure that conversation history and generated outlines for anonymous users are correctly associated with their temporary ID.

2.  **Prompt Engineering & Refinement:**

    - Based on internal testing and initial user feedback (if available), iterate on all Claude prompts (synthesis, questioning for each framework, outline generation) to improve:
      - Quality of insights.
      - Relevance and depth of questions.
      - Clarity and usefulness of outlines.
      - Adherence to therapeutic framework principles.
      - Tone and style consistency.

3.  **Token Usage Optimization:**
    - Review prompts and context management strategies to optimize token usage for both Whisper and Claude APIs, balancing cost and quality.

**Acceptance Criteria for Phase 4:**

- Anonymous users can complete a full session (audio input, conversation, outline generation).
- Prompts are refined, leading to demonstrably better AI output quality.
- Token usage is monitored and within acceptable limits for the cost model.

## 4. Key AI Performance Metrics & Quality Assurance

- **Question Relevance:** How relevant are the AI's questions to the user's input and selected framework? (Qualitative assessment)
- **Insight Depth:** Does the AI help users uncover non-obvious insights? (Qualitative assessment)
- **Outline Quality:** Is the generated outline actionable, structured, and creative? (Qualitative assessment)
- **Framework Adherence:** Does the AI's conversational style match the selected therapeutic framework? (Qualitative assessment)
- **Transcription Accuracy:** (Monitored via Whisper API, spot-checking)
- **API Latency:** Track average response times for Whisper and LLM API calls.
- **Token Consumption:** Monitor average tokens per session for cost control.
- **Error Rates:** Track API error rates from AI services.

## 5. High-Level AI-Related API Endpoints (tRPC Procedures)

1.  `processInitialAudio`:

    - Input: `{ audioFile: string | Blob, selectedFramework: string }`
    - Output: `{ sessionId: string, summary: string, questions: string[] }`
    - Internally handles: Transcription, initial synthesis, first set of questions.

2.  `continueConversation`:

    - Input: `{ sessionId: string, userResponse: string (text or new transcription), conversationHistory: object[] }`
    - Output: `{ newSummary?: string, newQuestions: string[] }`

3.  `generateContentOutline`:
    - Input: `{ sessionId: string, conversationSummary: string, nicheStylePreferences?: string }`
    - Output: `{ outline: { hook: string, mainPoints: string[], ... } }`

_(Note: `sessionId` will be used to retrieve/store conversation context and associate with `userId` or `tempId` on the backend.)_

This phased approach should allow for iterative development and testing of the AI functionalities. Regular review and refinement of prompts will be crucial throughout the process.
\`\`\`
