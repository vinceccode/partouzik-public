import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check the URL hash for an error from Supabase (expired, invalid, etc.)
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const errorDescription = params.get("error_description") || params.get("error");
    if (errorDescription) {
      setLinkError(errorDescription.replace(/\+/g, " "));
      return;
    }

    // 2. Listen for the PASSWORD_RECOVERY event Supabase emits after parsing the hash.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setReady(true);
      }
    });

    // 3. Fallback: if the user already had a recovery session (e.g. refresh), enable the form.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    // 4. Safety timeout — if nothing happens, surface a clear error.
    const timeout = setTimeout(() => {
      setReady((current) => {
        if (!current) {
          setLinkError("This reset link is invalid or has expired. Please request a new one.");
        }
        return current;
      });
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
      await supabase.auth.signOut();
      navigate("/auth");
    }
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
        Nouveau mot de passe
      </motion.h1>

      {linkError ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col gap-4"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-secondary-foreground">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p>{linkError}</p>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            Back to sign in
          </Button>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col gap-4"
        >
          <div>
            <Label htmlFor="password" className="mb-1.5 block text-sm text-secondary-foreground/70">
              <Lock className="inline h-3.5 w-3.5 mr-1" /> Nouveau mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={!ready}
              className="h-12 rounded-xl bg-card border-border"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="mb-1.5 block text-sm text-secondary-foreground/70">
              <Lock className="inline h-3.5 w-3.5 mr-1" /> Confirmer le mot de passe
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={!ready}
              className="h-12 rounded-xl bg-card border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !ready}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 bg-glow font-semibold text-base mt-2"
          >
            {loading
              ? "..."
              : ready
                ? "Mettre à jour"
                : "Vérification du lien..."}
          </Button>
        </motion.form>
      )}
    </div>
  );
};

export default ResetPassword;
