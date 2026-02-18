import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useFriends() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["friends", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("*, friend:profiles!friendships_friend_id_fkey(*), requester:profiles!friendships_user_id_fkey(*)")
        .or(`user_id.eq.${user!.id},friend_id.eq.${user!.id}`)
        .eq("status", "accepted");
      if (error) throw error;
      return (data || []).map((f: any) => {
        const isSender = f.user_id === user!.id;
        return { ...f, profile: isSender ? f.friend : f.requester };
      });
    },
  });
}

export function useFriendRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["friend-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("*, requester:profiles!friendships_user_id_fkey(*)")
        .eq("friend_id", user!.id)
        .eq("status", "pending");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (friendUsername: string) => {
      // Find user by username
      const { data: friend, error: findError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", friendUsername)
        .single();
      if (findError || !friend) throw new Error("User not found");
      if (friend.id === user!.id) throw new Error("Can't add yourself");
      const { error } = await supabase.from("friendships").insert({
        user_id: user!.id,
        friend_id: friend.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friends"] }),
  });
}

export function useAcceptFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });
}

export function useDeclineFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friend-requests"] }),
  });
}
