-- Allow session creators to delete their sessions
CREATE POLICY "Session admin can delete session"
ON public.sessions
FOR DELETE
USING (auth.uid() = created_by);

-- Allow session creators to delete participants of their sessions
CREATE POLICY "Session admin can delete participants"
ON public.session_participants
FOR DELETE
USING (public.is_session_admin(session_id, auth.uid()));

-- Allow session creators to delete tracks of their sessions
CREATE POLICY "Session admin can delete tracks"
ON public.tracks
FOR DELETE
USING (public.is_session_admin(session_id, auth.uid()));