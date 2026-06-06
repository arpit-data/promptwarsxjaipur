import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, Suspense } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/contexts/AuthContext";
import { detectCrisis } from "@/lib/safety";
import { CrisisModal } from "@/components/CrisisModal";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import type { Mesh } from "three";


export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI Wellness Coach · MindMate AI" },
      { name: "description", content: "A warm AI companion for students. Talk through anxiety, focus, comparison, and exam pressure." },
    ],
  }),
  component: Coach,
});

const PROMPTS = [
  "I feel anxious about my exams.",
  "I cannot focus today.",
  "I keep comparing myself to others.",
  "Help me create a study-wellness plan.",
];

function Orb({ mood }: { mood: "calm" | "supportive" | "happy" }) {
  const ref = useRef<Mesh>(null);
  const color = mood === "happy" ? "#f4c95d" : mood === "supportive" ? "#c9b6ff" : "#a8d8ff";
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.4;
  });
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={ref} args={[1, 64, 64]}>
        <MeshDistortMaterial color={color} emissive={color} emissiveIntensity={0.6} distort={0.5} speed={2.4} roughness={0.1} />
      </Sphere>
      <Sphere args={[1.4, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </Sphere>
    </Float>
  );
}

function Coach() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<"calm" | "supportive" | "happy">("calm");
  const [crisisOpen, setCrisisOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const isLoading = status === "submitted" || status === "streaming";

  async function submit(text: string) {
    const t = text.trim();
    if (!t || isLoading) return;

    // Safety check: detect crisis phrases before sending to AI
    const safetyResult = detectCrisis(t);
    if (safetyResult.isCrisis) {
      setCrisisOpen(true);
      setInput("");
      return;
    }

    setInput("");
    // shift orb mood based on keywords
    const lower = t.toLowerCase();
    if (/(anxious|stress|overwhelm|panic|fear|scared|sad|tired|burn)/.test(lower)) setMood("supportive");
    else if (/(happy|good|grateful|won|did it|amazing)/.test(lower)) setMood("happy");
    else setMood("calm");
    await sendMessage({ text: t });
  }

  if (!user) return null;

  return (
    <PageShell>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-12 lg:grid-cols-[320px_1fr]">
        {/* Orb sidebar */}
        <aside className="glass relative flex flex-col items-center rounded-3xl p-6 lg:sticky lg:top-28 lg:h-[70dvh]">
          <div className="h-48 w-full">
            <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.6} />
                <pointLight position={[2, 2, 2]} intensity={1.2} color="#ffd2c2" />
                <pointLight position={[-2, -1, 2]} intensity={0.7} color="#c9b6ff" />
                <Orb mood={mood} />
              </Suspense>
            </Canvas>
          </div>
          <h2 className="mt-2 font-display text-2xl">MindMate</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {mood === "supportive"
              ? "I'm right here with you."
              : mood === "happy"
              ? "Love this energy."
              : "Take a breath. I'm listening."}
          </p>
          <div className="mt-6 w-full space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Try saying</p>
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => submit(p)}
                disabled={isLoading}
                className="block w-full rounded-2xl bg-muted/60 px-3 py-2 text-left text-xs text-foreground/80 transition hover:bg-card hover:text-foreground disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <section className="flex h-[80dvh] flex-col">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4 pr-1">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8 text-center"
              >
                <Sparkles className="mx-auto h-6 w-6 text-primary" />
                <h3 className="mt-3 font-display text-2xl">Hey, I'm MindMate.</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Whatever's on your mind — exam pressure, late-night spirals, the comparison game — let's talk it through. No judgment, no toxic positivity.
                </p>
              </motion.div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((m: UIMessage) => (
                <Message key={m.id} message={m} />
              ))}
            </AnimatePresence>
            {status === "submitted" && (
              <div className="flex gap-2 px-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                MindMate is thinking…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="glass flex items-end gap-2 rounded-3xl p-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              placeholder="Share what's on your mind…"
              rows={1}
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 outline-none placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-[color:var(--lavender)] text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-40"
              aria-label="Send message"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </form>
        </section>
      </div>
      <CrisisModal open={crisisOpen} onAcknowledge={() => setCrisisOpen(false)} />
    </PageShell>
  );
}

function Message({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {isUser ? (
        <div className="max-w-[80%] rounded-3xl rounded-br-md bg-foreground px-5 py-3 text-background">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
        </div>
      ) : (
        <div className="max-w-[85%]">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{text}</p>
        </div>
      )}
    </motion.div>
  );
}
