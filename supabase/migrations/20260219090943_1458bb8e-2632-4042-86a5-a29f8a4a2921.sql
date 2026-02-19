
CREATE OR REPLACE FUNCTION public.send_friend_request(_username text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _friend_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO _friend_id FROM public.profiles WHERE username = _username;

  IF _friend_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF _friend_id = _user_id THEN
    RAISE EXCEPTION 'Cannot add yourself';
  END IF;

  -- Check if friendship already exists
  IF EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (user_id = _user_id AND friend_id = _friend_id)
       OR (user_id = _friend_id AND friend_id = _user_id)
  ) THEN
    RAISE EXCEPTION 'Friend request already exists';
  END IF;

  INSERT INTO public.friendships (user_id, friend_id, status)
  VALUES (_user_id, _friend_id, 'pending');
END;
$$;
