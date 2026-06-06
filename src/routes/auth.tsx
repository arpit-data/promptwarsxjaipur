/** @module auth — Authentication page with sign-in and registration tabs */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { EXAM_TYPES } from "@/types";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In · MindMate AI" },
      { name: "description", content: "Sign in or create your MindMate AI account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  if (loading) return <PageShell><div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div></PageShell>;

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-6 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-3xl">Welcome to MindMate</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your wellness companion through every exam journey</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2" aria-label="Sign in or register">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm signIn={signIn} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm signUp={signUp} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageShell>
  );
}

function SignInForm({ signIn }: { signIn: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setPending(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back! 🎉");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error?.message || "Sign in failed. Check your credentials.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <Label htmlFor="signin-email">Email</Label>
        <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" aria-required="true" />
      </div>
      <div>
        <Label htmlFor="signin-password">Password</Label>
        <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" aria-required="true" />
      </div>
      <Button type="submit" disabled={pending} className="w-full rounded-full bg-gradient-to-r from-primary to-[color:var(--lavender)]" aria-label="Sign in to your account">
        {pending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}

function RegisterForm({ signUp }: { signUp: (data: any) => Promise<void> }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", classLevel: "", examType: "", examDate: "" });
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.examType || !form.examDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setPending(true);
    try {
      await signUp(form);
      toast.success("Account created! Welcome to MindMate 🌟");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error?.message || "Registration failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <Label htmlFor="reg-name">Full Name</Label>
        <Input id="reg-name" value={form.name} onChange={update("name")} placeholder="Your name" required aria-required="true" />
      </div>
      <div>
        <Label htmlFor="reg-email">Email</Label>
        <Input id="reg-email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" required autoComplete="email" aria-required="true" />
      </div>
      <div>
        <Label htmlFor="reg-password">Password</Label>
        <Input id="reg-password" type="password" value={form.password} onChange={update("password")} placeholder="Min 6 characters" required minLength={6} autoComplete="new-password" aria-required="true" />
      </div>
      <div>
        <Label htmlFor="reg-class">Class / Year</Label>
        <Input id="reg-class" value={form.classLevel} onChange={update("classLevel")} placeholder="e.g. 12th, B.Tech 3rd year" />
      </div>
      <div>
        <Label htmlFor="reg-exam">Exam Type</Label>
        <Select value={form.examType} onValueChange={(v) => setForm((f) => ({ ...f, examType: v }))}>
          <SelectTrigger id="reg-exam" aria-label="Select your target exam">
            <SelectValue placeholder="Select exam" />
          </SelectTrigger>
          <SelectContent>
            {EXAM_TYPES.map((exam) => (
              <SelectItem key={exam} value={exam}>{exam}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="reg-date">Target Exam Date</Label>
        <Input id="reg-date" type="date" value={form.examDate} onChange={update("examDate")} required aria-required="true" />
      </div>
      <Button type="submit" disabled={pending} className="w-full rounded-full bg-gradient-to-r from-primary to-[color:var(--lavender)]" aria-label="Create your account">
        {pending ? "Creating account..." : "Start Your Journey ✨"}
      </Button>
    </form>
  );
}
