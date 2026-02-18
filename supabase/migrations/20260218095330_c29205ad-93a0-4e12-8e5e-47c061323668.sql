
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Friendships table
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Helper: check friendship
CREATE OR REPLACE FUNCTION public.are_friends(_user_a UUID, _user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((user_id = _user_a AND friend_id = _user_b) OR (user_id = _user_b AND friend_id = _user_a))
  )
$$;

-- Sessions table
CREATE TYPE public.session_status AS ENUM ('waiting', 'active', 'paused', 'ended');

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.session_status NOT NULL DEFAULT 'waiting',
  invite_token UUID NOT NULL DEFAULT gen_random_uuid(),
  current_turn_index INT NOT NULL DEFAULT 0,
  turn_timeout_seconds INT NOT NULL DEFAULT 120,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Session participants
CREATE TYPE public.turn_status AS ENUM ('waiting', 'upcoming_turn', 'current_turn', 'skipped', 'played');

CREATE TABLE public.session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  turn_order INT NOT NULL DEFAULT 0,
  turn_status public.turn_status NOT NULL DEFAULT 'waiting',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Tracks table
CREATE TYPE public.music_platform AS ENUM ('spotify', 'apple_music', 'youtube', 'other');

CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_name TEXT NOT NULL,
  platform public.music_platform NOT NULL DEFAULT 'spotify',
  platform_url TEXT,
  play_order INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is session participant
CREATE OR REPLACE FUNCTION public.is_session_participant(_session_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.session_participants
    WHERE session_id = _session_id AND user_id = _user_id
  )
$$;

-- Helper: check if user is session admin
CREATE OR REPLACE FUNCTION public.is_session_admin(_session_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sessions
    WHERE id = _session_id AND created_by = _user_id
  )
$$;

-- RLS: profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view friends profiles" ON public.profiles FOR SELECT USING (public.are_friends(auth.uid(), id));
CREATE POLICY "Users can view session co-participants" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.session_participants sp1
    JOIN public.session_participants sp2 ON sp1.session_id = sp2.session_id
    WHERE sp1.user_id = auth.uid() AND sp2.user_id = profiles.id
  )
);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS: friendships
CREATE POLICY "Users can view own friendships" ON public.friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can send friend requests" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Users can update friendships they received" ON public.friendships FOR UPDATE USING (auth.uid() = friend_id);
CREATE POLICY "Users can delete own friendships" ON public.friendships FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS: sessions
CREATE POLICY "Participants can view sessions" ON public.sessions FOR SELECT USING (public.is_session_participant(id, auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Users can create sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update their sessions" ON public.sessions FOR UPDATE USING (auth.uid() = created_by);

-- RLS: session_participants
CREATE POLICY "Participants can view participants" ON public.session_participants FOR SELECT USING (public.is_session_participant(session_id, auth.uid()));
CREATE POLICY "Session admin can add participants" ON public.session_participants FOR INSERT WITH CHECK (public.is_session_admin(session_id, auth.uid()) OR auth.uid() = user_id);
CREATE POLICY "Session admin can update participants" ON public.session_participants FOR UPDATE USING (public.is_session_admin(session_id, auth.uid()) OR auth.uid() = user_id);

-- RLS: tracks
CREATE POLICY "Participants can view tracks" ON public.tracks FOR SELECT USING (public.is_session_participant(session_id, auth.uid()));
CREATE POLICY "Participants can submit tracks" ON public.tracks FOR INSERT WITH CHECK (auth.uid() = submitted_by AND public.is_session_participant(session_id, auth.uid()));
CREATE POLICY "Track owners can update" ON public.tracks FOR UPDATE USING (auth.uid() = submitted_by);

-- Allow anyone to look up a session by invite token (for joining)
CREATE POLICY "Anyone can find session by invite token" ON public.sessions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Enable realtime for session_participants and tracks
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
