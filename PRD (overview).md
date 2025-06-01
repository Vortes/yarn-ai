## Product Requirements Document: InsightSpark

**Version:** 1.1  
**Date:** June 1, 2025  
**Author:** Product Team  
**Product Name:** InsightSpark (Working Title)

### 1. Introduction & Overview

InsightSpark is a web application designed to help individual, beginner content creators overcome the challenge of generating genuine and interesting social media content, initially focusing on TikTok. It allows users to articulate their thoughts through audio, which an AI then synthesizes into key points and reflective questions. Through an iterative conversational process, users uncover valuable insights, which are then transformed into structured content outlines for short-form videos. The core problem InsightSpark solves is the significant time and mental effort currently required for ideation and content planning.

### 2. Goals

- **Reduce Ideation Time:** Significantly decrease the time creators spend brainstorming content ideas.
- **Enhance Content Authenticity:** Enable creators to produce content rooted in their genuine thoughts and insights.
- **Simplify Content Structuring:** Provide a clear, actionable outline for creating engaging short-form videos.
- **Empower Beginner Creators:** Offer an accessible tool for those new to content creation to find their voice and develop compelling narratives.
- **Drive User Adoption:** Achieve a target number of active users and outline downloads within the first 6 months post-launch.

### 3. Target Audience

- **Primary Users:** Individual content creators.
- **Experience Level:** Beginners who are just starting their content creation journey.
- **Platform Focus:** Primarily TikTok, with potential for Instagram.
- **Content Niche:** No specific industry; applicable across various niches.

### 4. User Stories

- **As a beginner TikTok creator,** I want to easily record my thoughts on a topic I'm passionate about, so I can get help turning them into content ideas.
- **As a creator struggling with writer's block,** I want an AI to ask me thought-provoking questions based on my ramblings, so I can uncover deeper insights for my videos.
- **As a creator who has many ideas but struggles to structure them,** I want the AI to generate a clear outline for a short-form video based on our conversation, so I know how to shoot and edit it.
- **As a creator who wants to maintain a consistent voice,** I want the AI to understand my niche and style, so the generated outlines feel authentic to my brand.
- **As a busy creator,** I want to be able to upload an existing audio file of my thoughts, so I can use the tool even when I can't record live.
- **As a creator,** I want to be able to download my content outlines in a simple format like PDF or text, so I can easily reference them.
- **As a first-time visitor,** I want to try the app immediately without signing up, so I can see if it's valuable before committing to an account.

### 5. Product Features & Functionality

#### 5.1. Audio Input

##### 5.1.1. Audio Recording:

- Users can initiate an audio recording directly within the web application.
- Maximum recording length: 10 minutes for premium users, 5 minutes for free users.
- A visual timer will display the elapsed recording time.
- A warning notification (e.g., "1 minute remaining") will be shown when the recording time is nearing its limit.
- When the time limit is reached, the recording will automatically stop. The recording will be saved and processed, not deleted.

##### 5.1.2. Audio Upload:

- Users can upload pre-existing audio files.
- Supported formats: Common audio formats (MP3, WAV, M4A, etc.).
- Maximum file size: 500MB for premium users, 100MB for free users.
- A progress bar will indicate the upload status.
- Audio files will be automatically deleted after transcription is complete to reduce storage costs.

#### 5.2. AI-Powered Insight Generation

##### 5.2.1. Therapeutic Framework Selection:

- Before processing their audio, users can select their preferred reflection style from a dropdown menu:
  - **Socratic Questioning:** Challenge assumptions and explore multiple perspectives
  - **Motivational Interviewing:** Explore ambivalence and find authentic positions
  - **Narrative Therapy:** Reframe stories and find unique perspectives
  - **Solution-Focused:** Envision ideal outcomes and practical steps
  - **Cognitive Behavioral:** Identify thought patterns and examine beliefs
- The selected framework will guide the AI's questioning approach throughout the session.

##### 5.2.2. Initial Synthesis & Questioning:

- Upon successful recording or upload, the audio will be processed by the AI (Claude 3.5 Sonnet).
- Audio transcription will be handled by OpenAI Whisper API for cost-effectiveness.
- The AI will synthesize the main points from the user's audio.
- The AI will present these main points back to the user.
- Alongside the main points, the AI will generate several (e.g., 3-5) reflective questions designed to guide the user towards deeper insights.
- The questioning framework will incorporate techniques from the user-selected therapeutic approach:

  1. **Socratic Questioning:** 
     - Asking open-ended questions that challenge assumptions
     - Exploring implications and consequences of ideas
     - Examining multiple perspectives on a topic
     - Example: "You mentioned X is important to your audience; what evidence have you seen that supports this?"

  2. **Motivational Interviewing Techniques:**
     - Asking evocative questions that elicit "change talk"
     - Using reflective listening to clarify and deepen understanding
     - Exploring ambivalence about ideas to find authentic positions
     - Example: "On a scale of 1-10, how confident are you about this insight? What would make it a 10?"

  3. **Narrative Therapy Approaches:**
     - Externalizing problems/topics from the person
     - Identifying unique outcomes or exceptions to dominant stories
     - Helping users re-author their narrative around a topic
     - Example: "If this challenge had a name, what would it be? When has this challenge been less powerful in your life?"

  4. **Solution-Focused Brief Therapy Elements:**
     - Miracle questions to envision ideal outcomes
     - Exception-finding questions to identify when problems don't exist
     - Scaling questions to measure progress and set goals
     - Example: "Imagine you woke up tomorrow and had the perfect content piece on this topic. What would it look like? What would be different?"

  5. **Cognitive Behavioral Techniques:**
     - Identifying cognitive distortions in thinking
     - Challenging black-and-white thinking with nuance
     - Examining evidence for and against beliefs
     - Example: "You mentioned you 'always' struggle with this topic. Have there been any exceptions to this pattern?"

##### 5.2.3. Iterative Conversation Flow:

- Users can respond to the AI's questions via text input or by recording additional audio that gets transcribed into text.
- The AI will process the user's response and generate further synthesis and/or new questions.
- This back-and-forth conversational process is expected to last approximately 3 iterations on average but can vary.
- The conversation is not real-time; users should expect a short processing delay (30-60 seconds) after submitting their response.
- Users can choose to end the conversational insight-discovery phase at any point.

#### 5.3. Content Outline Generation

##### 5.3.1. Outline Trigger:

- After the conversational phase, or when the user decides they have sufficient insights, they can request the AI to generate a content outline.

##### 5.3.2. Outline Content:

- The AI will generate an outline for a short-form video (TikTok format).
- The outline will be based on the insights uncovered during the conversation.
- It will focus on a high-level structure, incorporating storytelling principles.
- Key elements to include:
  - **Hook:** Suggestions for grabbing viewer attention at the beginning.
  - **Main Points/Story Beats:** Key messages or narrative steps derived from the insights.
  - **Call to Action (Optional):** Suggestion for user engagement.
  - **Visual/Shot Ideas (High-Level):** Broad suggestions for visuals that could accompany the points (e.g., "Show [concept]," "Demonstrate [action]").

##### 5.3.3. Niche/Style Customization:

- The system will allow users to provide context about their niche and preferred content style/voice.
- This context will be used by the AI to tailor the tone and suggestions in the generated outline. This could be a simple text input field in user settings or per-session.

#### 5.4. User Account & Management

##### 5.4.1. Anonymous User Experience:

- **First-time visitors** can use the app immediately without signing up.
- Anonymous users get **1 free session** with full functionality.
- Anonymous sessions are tracked using a temporary UUID stored in browser localStorage.
- Session data is temporarily stored in the database with the temporary ID.
- When anonymous users attempt to start a **second session**, they are prompted to "Sign in with Google to continue using the app."

##### 5.4.2. Account Creation & Data Transfer:

- User registration and login via Clerk authentication service (Google OAuth).
- Upon signup, anonymous session data is **automatically transferred** to the new user account.
- Users can access past conversations and outlines after account creation.
- User profile settings for niche/style preferences.

##### 5.4.3. Rate Limiting for Anonymous Users:

- Anonymous users are limited to 1 session per browser using localStorage tracking.
- Simple localStorage flag prevents multiple anonymous sessions (can be bypassed but sufficient for V1).
- Future versions may implement more sophisticated rate limiting.

### 6. Technical Specifications

#### 6.1. Technology Stack (T3 Stack):

- **Frontend:** Next.js with TypeScript and Tailwind CSS
- **Backend:** tRPC for type-safe API calls
- **Database:** Neon PostgreSQL with Prisma ORM
- **Authentication:** Clerk (Google OAuth)
- **File Storage:** UploadThing for audio file handling
- **Deployment:** Vercel

#### 6.2. AI & Audio Processing:

- **AI Model:** Claude 3.5 Sonnet via Anthropic API
- **Transcription:** OpenAI Whisper API
- **Audio Processing:** Capability to handle up to 10 minutes of audio per recording or 500MB per upload
- **Supported Audio Formats:** MP3, WAV, M4A, and other common formats
- **Audio File Lifecycle:** Files automatically deleted after transcription to reduce storage costs

#### 6.3. Anonymous User Implementation:

- **Tracking Method:** Temporary UUID generated and stored in browser localStorage
- **Database Design:** Sessions table supports both authenticated users (`userId`) and anonymous users (`tempId`)
- **Data Migration:** Automatic transfer of anonymous session data to user account upon signup
- **Rate Limiting:** localStorage-based session tracking (1 session per browser)

#### 6.4. Performance & Communication:

- **AI Response Time:** 30-60 seconds for synthesis, question generation, and outline creation
- **Real-time Updates:** Server-sent events for progress updates during AI processing
- **Database Design:** Structured relational data for conversations, insights, and outlines

#### 6.5. Security & Data:

- **Encryption:** Standard encryption for data at rest and in transit
- **Data Retention:** Audio files deleted post-transcription; conversation data and outlines stored indefinitely
- **Content Ownership:** Users own all generated insights and outlines
- **Anonymous Data:** Temporary sessions cleaned up after successful account migration or after 7 days

### 7. Design & UX Considerations

#### 7.1. User Flow:

##### 7.1.1. Anonymous User Flow:

1. User lands on the app (no login required).
2. User selects preferred therapeutic framework from dropdown.
3. Option to Start Recording / Upload Audio.
4. **Recording:** Interface with record/stop button, timer with warnings.
5. **Upload:** File selection interface, progress bar.
6. Audio processing indication with server-sent event updates.
7. Display of AI-synthesized points and initial questions.
8. Text input field or audio recording option for user to respond to AI.
9. Iterative display of AI responses and further questions.
10. Button to "Generate Content Outline."
11. Display of generated outline with "Sign up to save this conversation and get 7 more free sessions" prompt.
12. Options to export the outline (PDF, TXT, MD).

##### 7.1.2. Returning User Flow:

1. User attempts to start a second session.
2. "Sign in with Google to continue" modal appears.
3. After authentication, previous anonymous session is automatically saved to account.
4. User proceeds with normal authenticated flow.

#### 7.2. UI Elements:

- Clean, intuitive, and minimalist design, suitable for beginner users.
- Clear calls to action.
- Easy-to-read typography for conversation and outlines.
- Progress indicators for AI processing.
- Prominent but non-intrusive signup prompts for anonymous users.

#### 7.3. Accessibility:

- Adhere to WCAG 2.1 AA guidelines where feasible.

### 8. Monetization (Freemium Model)

#### 8.1. Anonymous Trial:

- **Sessions:** 1 free session (no signup required)
- **Audio Length:** Up to 5 minutes per recording/upload
- **Features:** Full access to all core features
- **Conversion Prompt:** "Sign up to save this conversation and get 7 more free sessions"

#### 8.2. Free Tier (Registered Users):

- **Sessions:** 8 sessions per month (including the initial anonymous session)
- **Audio Length:** Up to 5 minutes per recording/upload
- **Features:** Access to all core features (recording, upload, AI conversation, outline generation, export)
- **AI Model:** Claude 3.5 Sonnet (same quality as paid tier)

#### 8.3. Premium Tier:

- **Price:** $10/month subscription
- **Sessions:** Unlimited sessions per month
- **Audio Length:** Up to 10 minutes per recording/upload (500MB file size limit)
- **Features:** All features included
- **AI Model:** Claude 3.5 Sonnet

#### 8.4. Updated Cost Analysis:

- **Monthly AI Costs (100 users, 5% conversion, including anonymous sessions):**
  - Anonymous trials (50 users × 1 session): $1.43
  - Free users (45 × 8 sessions): $10.26
  - Paid users (5 × 20 sessions): $2.85
  - Total monthly cost: $14.54
- **Monthly Revenue:** $50 (5 paid users × $10)
- **Monthly Profit:** $35.46 (71% margin)
- **Break-even:** 2 paid users

### 9. Data & Privacy

#### 9.1. Data Retention:

- **Audio Files:** Automatically deleted after transcription is complete
- **Anonymous Sessions:** Stored for 7 days or until account creation, whichever comes first
- **Transcriptions & Conversations:** Stored indefinitely to allow users to access past work
- **Generated Outlines:** Stored indefinitely
- **User Data:** Standard retention practices with option for manual deletion

#### 9.2. Content Ownership:

- The creator owns the insights they uncover and the final content outlines generated based on their input.
- Anonymous session data becomes owned by the user upon account creation.

#### 9.3. Privacy:

- Standard data protection practices for a SaaS application.
- Secure storage and transmission of data.
- Anonymous user data is not linked to personal information until account creation.
- No specific privacy features for sensitive content discussions in V1.

### 10. Export & Integration

#### 10.1. Export Formats:

- PDF
- Plain Text (.txt)
- Markdown (.md)

#### 10.2. Third-Party Integrations:

- None planned for V1.

### 11. Success Metrics

- **Primary Metric:** Number of content outlines downloaded by users.
- **Secondary Metrics:**
  - Number of active users (daily/monthly).
  - **Anonymous to registered conversion rate** (target: 30-40%).
  - **Registered to premium conversion rate** (target: 5%).
  - Average number of conversation iterations per session.
  - Session completion rate (percentage of sessions resulting in an outline).
  - User retention rate.
  - Qualitative feedback from users on the value of generated ideas.
  - Monthly recurring revenue (MRR) growth.

### 12. Future Considerations (Post-V1)

- Support for other social media platforms (e.g., Instagram Reels, YouTube Shorts).
- More advanced outline customization (e.g., specific tones, target audience personas).
- Direct integration with content scheduling tools.
- Team/collaboration features.
- Analytics for users on their most resonant themes or insight patterns.
- Support for video uploads as input.
- Background job processing for better user experience during AI processing.
- Multi-language support.
- **Enhanced rate limiting** for anonymous users (IP-based, browser fingerprinting).

### 13. Out of Scope (For V1)

- Real-time AI responses.
- Multi-user collaboration on a single outline.
- Direct posting to social media platforms.
- Advanced video editing or generation capabilities.
- Support for languages other than English.
- Detailed shot lists or B-roll suggestions beyond high-level ideas.
- Background job processing (users will wait for AI responses).
- CDN for audio delivery (relying on UploadThing's infrastructure).
- Advanced monitoring and error tracking.
- Data caching strategies.
- Advanced anonymous user rate limiting (beyond localStorage).
\`\`\`