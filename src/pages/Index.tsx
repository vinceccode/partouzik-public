import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-secondary">
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/80 to-secondary" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary animate-pulse-glow"
        >
          <Zap className="h-10 w-10 text-primary-foreground" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-3 text-5xl font-display font-bold text-secondary-foreground text-glow">
          Partouzik
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mb-10 max-w-xs text-lg text-muted-foreground">
          Take turns playing music with your crew. No noise, no strangers.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex w-full max-w-xs flex-col gap-3">
          <Button
            size="lg"
            className="w-full gap-2 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 bg-glow"
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
          {!user && (
            <Button
              variant="ghost" size="lg"
              className="w-full text-base text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary-foreground/5"
              onClick={() => navigate("/auth")}
            >
              I already have an account
            </Button>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="absolute bottom-8 text-muted-foreground text-xs">
        Private • Secure • Yours
      </motion.div>
    </div>
  );
};

export default Index;
