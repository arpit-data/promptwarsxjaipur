import { Link } from "@tanstack/react-router";
import { Sparkles, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function SiteNav() {
  const { user, profile, signOut } = useAuth();

  async function handleSignOut() {
    try { await signOut(); toast.success("Signed out"); } catch { /* ignore */ }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-gradient">MindMate</span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/coach">AI Coach</NavLink>
          {user && <NavLink to="/journal">Journal</NavLink>}
          {user && <NavLink to="/analytics">Analytics</NavLink>}

          {user ? (
            <div className="ml-2 flex items-center gap-1">
              <Link to="/profile" className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-[color:var(--lavender)] text-xs font-bold text-primary-foreground" aria-label="View profile">
                {profile?.name?.charAt(0)?.toUpperCase() || <User className="h-3.5 w-3.5" />}
              </Link>
              <button onClick={handleSignOut} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="ml-2 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-full px-4 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      activeProps={{ className: "bg-foreground text-background hover:bg-foreground hover:text-background" }}
      activeOptions={{ exact: true }}
    >
      {children}
    </Link>
  );
}
