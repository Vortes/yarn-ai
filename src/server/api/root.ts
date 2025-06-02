import { postRouter } from "~/server/api/routers/post";
import { audioRouter } from "~/server/api/routers/audio";
import { textRouter } from "~/server/api/routers/text";
import { synthesisRouter } from "~/server/api/routers/synthesis";
import { conversationRouter } from "~/server/api/routers/conversation";
import { outlineRouter } from "~/server/api/routers/outline";
import { sessionRouter } from "~/server/api/routers/session";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  audio: audioRouter,
  text: textRouter,
  synthesis: synthesisRouter,
  conversation: conversationRouter,
  outline: outlineRouter,
  session: sessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
