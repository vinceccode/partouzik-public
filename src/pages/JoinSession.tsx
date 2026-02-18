import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useJoinByToken } from "@/hooks/useSessions";

const JoinSession = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const joinByToken = useJoinByToken();
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/auth?redirect=/join/${token}`);
      return;
    }
    if (!token) return;

    joinByToken.mutateAsync(token).then((session) => {
      navigate(`/sessions/${session.id}/live`);
    }).catch((e) => {
      setError(e.message);
    });
  }, [user, authLoading, token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
        <Zap className="h-8 w-8 text-primary-foreground" />
      </motion.div>
      {error ? (
        <p className="text-destructive text-center">{error}</p>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Joining session...
        </div>
      )}
    </div>
  );
};

export default JoinSession;
