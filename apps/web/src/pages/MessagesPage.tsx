import { useEffect, useMemo, useState } from "react";
import { Send, Search } from "lucide-react";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/auth";
import { getSocket } from "../lib/socket";
import { resolveMediaUrl } from "../lib/media";

type Conversation = {
  id: string;
  lastMessageAt: string;
  participants: Array<{ userId: string; user: { id: string; name: string; avatar?: string | null } }>;
  messages: Array<{ id: string; content: string; createdAt: string }>;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "TEXT" | "IMAGE" | "SESSION_PROPOSAL";
  createdAt: string;
};

function otherParticipant(conv: Conversation, myId: string) {
  return conv.participants.map((p) => p.user).find((u) => u.id !== myId) ?? conv.participants[0]?.user;
}

export default function MessagesPage() {
  const { accessToken, user } = useAuthStore();
  const myId = user?.id ?? "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => (otherParticipant(c, myId)?.name ?? "").toLowerCase().includes(q));
  }, [conversations, myId, query]);

  useEffect(() => {
    if (!accessToken) return;

    (async () => {
      const res = await apiFetch<{ conversations: Conversation[] }>("/api/conversations", { accessToken });
      setConversations(res.conversations);
      if (!selectedId && res.conversations[0]) setSelectedId(res.conversations[0].id);
    })();
  }, [accessToken, selectedId]);

  useEffect(() => {
    if (!accessToken || !selectedId) return;

    (async () => {
      const res = await apiFetch<{ messages: Message[] }>(`/api/conversations/${selectedId}/messages`, {
        accessToken
      });
      setMessages(res.messages);
    })();
  }, [accessToken, selectedId]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    socket.emit("join:room", { userId: user.id });

    const onMessage = (m: Message) => {
      setMessages((prev) => {
        if (m.conversationId !== selectedId) return prev;
        if (prev.some((p) => p.id === m.id)) return prev;
        return [...prev, m];
      });
    };

    socket.on("message:new", onMessage);

    return () => {
      socket.off("message:new", onMessage);
    };
  }, [selectedId, user?.id]);

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;
  const other = selectedConversation ? otherParticipant(selectedConversation, myId) : null;

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-border bg-bgCard p-4 shadow-card">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-bgElevated px-3 py-2">
          <Search className="h-4 w-4 text-textMuted" />
          <input
            className="w-full bg-transparent text-sm text-textPrimary placeholder:text-textMuted focus:outline-none"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="rounded-2xl border border-border bg-bgElevated p-4 text-sm text-textSecondary">
              No conversations yet.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const op = otherParticipant(c, myId);
              const last = c.messages[0]?.content ?? "";
              const avatarUrl = resolveMediaUrl(op?.avatar ?? null);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={[
                    "w-full rounded-2xl border p-3 text-left",
                    c.id === selectedId
                      ? "border-accentPrimary bg-white/5"
                      : "border-border bg-bgElevated hover:border-accentPrimary"
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={op?.name ?? "Avatar"}
                        className="h-10 w-10 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full border border-border bg-bgCard" />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{op?.name ?? "Conversation"}</div>
                      <div className="truncate text-xs text-textSecondary">{last}</div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex min-h-[70vh] flex-col rounded-2xl border border-border bg-bgCard shadow-card">
        <div className="border-b border-border p-4">
          <div className="text-sm font-semibold">{other?.name ?? "Messages"}</div>
          <div className="mt-1 text-xs text-textSecondary">Live chat via Socket.io</div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto p-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-bgElevated p-4 text-sm text-textSecondary">
              No messages yet. Say hi.
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === myId;
              return (
                <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={[
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      mine
                        ? "bg-gradient-to-r from-[#7C6AF7] to-[#9B6AF7] text-white"
                        : "border border-border bg-bgElevated text-textPrimary"
                    ].join(" ")}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          className="border-t border-border p-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!accessToken || !selectedId) return;
            const content = draft.trim();
            if (!content) return;
            setDraft("");
            const res = await apiFetch<{ message: Message }>(`/api/conversations/${selectedId}/messages`, {
              method: "POST",
              accessToken,
              body: JSON.stringify({ content, type: "TEXT" })
            });
            setMessages((prev) => (prev.some((p) => p.id === res.message.id) ? prev : [...prev, res.message]));
          }}
        >
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-xl border border-border bg-bgElevated px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[rgba(124,106,247,0.22)]"
              placeholder="Type a message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="submit"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#7C6AF7] to-[#9B6AF7] shadow-glow"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
