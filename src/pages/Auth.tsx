import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        navigate("/dashboard");
      }
    } else {
      const { error } = await signUp(email, password, displayName, username);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Check your email to verify your account." });
      }
    }
    setLoading(false);
  };

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
        {isLogin ? "Welcome Back" : "Join Partouzik"}
      </motion.h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        {!isLogin && (
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

        <div>
          <Label htmlFor="password" className="mb-1.5 block text-sm text-secondary-foreground/70">
            <Lock className="inline h-3.5 w-3.5 mr-1" /> Password
          </Label>
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

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 bg-glow font-semibold text-base mt-2"
        >
          {loading ? "..." : isLogin ? "Sign In" : "Create Account"}
        </Button>

        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors text-center"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </motion.form>
    </div>
  );
};

export default Auth;
