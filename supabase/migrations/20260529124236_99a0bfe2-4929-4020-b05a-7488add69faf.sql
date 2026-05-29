
-- ROOMS
CREATE TABLE public.uno_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  max_players int NOT NULL DEFAULT 4,
  has_passcode boolean NOT NULL DEFAULT false,
  passcode_hash text,
  rules text NOT NULL DEFAULT 'no_mercy',
  current_seat int NOT NULL DEFAULT 0,
  direction int NOT NULL DEFAULT 1,
  draw_stack int NOT NULL DEFAULT 0,
  discard_top jsonb,
  deck jsonb NOT NULL DEFAULT '[]'::jsonb,
  winner_seat int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);

GRANT SELECT ON public.uno_rooms TO authenticated;
GRANT ALL ON public.uno_rooms TO service_role;
ALTER TABLE public.uno_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read rooms" ON public.uno_rooms FOR SELECT TO authenticated USING (true);

-- PLAYERS
CREATE TABLE public.uno_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.uno_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  username text NOT NULL,
  seat int NOT NULL,
  hand jsonb NOT NULL DEFAULT '[]'::jsonb,
  said_uno boolean NOT NULL DEFAULT false,
  eliminated boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, seat),
  UNIQUE (room_id, user_id)
);

GRANT SELECT ON public.uno_players TO authenticated;
GRANT ALL ON public.uno_players TO service_role;
ALTER TABLE public.uno_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read players" ON public.uno_players FOR SELECT TO authenticated USING (true);

-- MOVES (log)
CREATE TABLE public.uno_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.uno_rooms(id) ON DELETE CASCADE,
  seat int NOT NULL,
  action text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.uno_moves TO authenticated;
GRANT ALL ON public.uno_moves TO service_role;
ALTER TABLE public.uno_moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read moves" ON public.uno_moves FOR SELECT TO authenticated USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.uno_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uno_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uno_moves;

ALTER TABLE public.uno_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.uno_players REPLICA IDENTITY FULL;
ALTER TABLE public.uno_moves REPLICA IDENTITY FULL;

-- Updated_at trigger
CREATE TRIGGER uno_rooms_updated_at
BEFORE UPDATE ON public.uno_rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_uno_rooms_code ON public.uno_rooms(code);
CREATE INDEX idx_uno_players_room ON public.uno_players(room_id);
CREATE INDEX idx_uno_moves_room ON public.uno_moves(room_id, created_at);
