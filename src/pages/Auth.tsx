import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, AtSign, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Mode = "login" | "signup" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        navigate("/dashboard");
      }
    } else if (mode === "signup") {
      const { error } = await signUp(email, password, displayName, username);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Check your email to verify your account." });
      }
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setResetSent(true);
      }
    }
    setLoading(false);
  };

  const title =
    mode === "login" ? "Welcome Back" : mode === "signup" ? "Join Partouzik" : "Reset Password";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary"
      >
        <Zap className="h-8 w-8 text-primary-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-3xl font-display font-bold text-secondary-foreground"
      >
        {title}
      </motion.h1>

      {mode === "forgot" && resetSent ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col gap-4 text-center"
        >
          <p className="text-secondary-foreground bg-card rounded-2xl p-6 border border-border">
            Check your email to reset your password
          </p>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setResetSent(false);
            }}
            className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </button>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col gap-4"
        >
          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="displayName" className="mb-1.5 block text-sm text-secondary-foreground/70">
                  <User className="inline h-3.5 w-3.5 mr-1" /> Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="h-12 rounded-xl bg-card border-border"
                />
              </div>
              <div>
                <Label htmlFor="username" className="mb-1.5 block text-sm text-secondary-foreground/70">
                  <AtSign className="inline h-3.5 w-3.5 mr-1" /> Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="unique_username"
                  required
                  className="h-12 rounded-xl bg-card border-border"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email" className="mb-1.5 block text-sm text-secondary-foreground/70">
              <Mail className="inline h-3.5 w-3.5 mr-1" /> Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-12 rounded-xl bg-card border-border"
            />
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="block text-sm text-secondary-foreground/70">
                  <Lock className="inline h-3.5 w-3.5 mr-1" /> Password
                </Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-12 rounded-xl bg-card border-border"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 bg-glow font-semibold text-base mt-2"
          >
            {loading
              ? "..."
              : mode === "login"
                ? "Sign In"
                : mode === "signup"
                  ? "Create Account"
                  : "Send reset email"}
          </Button>

          {mode === "forgot" ? (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors text-center"
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          )}
        </motion.form>
      )}
    </div>
  );
};

export default Auth;
