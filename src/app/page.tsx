import { ChatContainer } from "~/components/chat/chat-container";
import { HydrateClient } from "~/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <ChatContainer />
    </HydrateClient>
  );
}
