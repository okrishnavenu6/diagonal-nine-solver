import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUnoRoom, unoAction } from "@/hooks/useUnoRoom";
import { UnoCard } from "@/components/uno/UnoCard";
import { isPlayableClient, type UnoColor } from "@/utils/unoTypes";
import { ArrowLeft, RotateCw, ChevronRight } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const UnoRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const { room, players, loading } = useUnoRoom(code);
  const [pendingWild, setPendingWild] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const me = players.find(p => p.user_id === userId);
  const isHost = userId && room && userId === room.host_id;
  const myTurn = me && room?.status === "playing" && me.seat === room.current_seat && !me.eliminated;

  const run = async (action: string, payload: Record<string, any> = {}) => {
    setBusy(true);
    try { await unoAction(action, { roomId: room?.id, ...payload }); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const playCard = async (cardId: string, color?: UnoColor) => {
    await run("play", { cardId, chosenColor: color });
  };

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!room) return (
    <div className="p-8 text-center">
      Room not found.
      <div className="mt-4"><Link to="/uno" className="underline">Back to lobby</Link></div>
    </div>
  );

  const top = room.discard_top;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to="/uno" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Lobby
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-sm">Room code: <span className="font-mono font-bold text-lg">{room.code}</span></div>
            <Button size="sm" variant="outline" onClick={() => { run("leave"); navigate("/uno"); }}>Leave</Button>
          </div>
        </div>

        {/* Waiting room */}
        {room.status === "waiting" && (
          <Card>
            <CardHeader><CardTitle>Waiting for players ({players.length}/{room.max_players})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {players.map(p => (
                  <div key={p.id} className="flex justify-between p-3 bg-muted rounded">
                    <span>Seat {p.seat + 1}: <b>{p.username}</b> {p.user_id === room.host_id && "(Host)"}</span>
                  </div>
                ))}
              </div>
              {isHost ? (
                <Button className="w-full" onClick={() => run("start")} disabled={busy || players.length < 2}>
                  Start Game
                </Button>
              ) : (
                <p className="text-center text-muted-foreground">Waiting for host to start…</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Game */}
        {room.status === "playing" && (
          <div className="space-y-6">
            {/* Opponents */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {players.filter(p => p.user_id !== userId).map(p => (
                <Card key={p.id} className={p.seat === room.current_seat ? "border-primary ring-2 ring-primary" : ""}>
                  <CardContent className="p-3 text-center">
                    <div className="font-semibold">{p.username}</div>
                    <div className="text-xs text-muted-foreground">Seat {p.seat + 1}</div>
                    <div className="flex justify-center gap-1 my-2">
                      {p.hand.slice(0, 5).map((_, i) => <UnoCard key={i} faceDown size="sm" />)}
                    </div>
                    <div className="text-sm">{p.hand.length} cards {p.eliminated && "💀"}</div>
                    {p.hand.length === 1 && p.said_uno && <div className="text-xs text-yellow-500 font-bold">UNO!</div>}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Table */}
            <Card>
              <CardContent className="p-6 flex items-center justify-center gap-8">
                <div className="text-center">
                  <UnoCard faceDown size="lg" onClick={myTurn && !busy ? () => run("draw") : undefined} />
                  <div className="text-xs mt-2">Draw{room.draw_stack > 0 && ` (+${room.draw_stack})`}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{room.direction === 1 ? <ChevronRight /> : <RotateCw />}</div>
                  <div className="text-xs">Dir</div>
                </div>
                <div className="text-center">
                  <UnoCard card={top} size="lg" />
                  <div className="text-xs mt-2">Discard</div>
                </div>
              </CardContent>
            </Card>

            {/* My hand */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>You: {me?.username} {me?.eliminated && "(Eliminated)"} — {me?.hand.length || 0} cards</span>
                  {myTurn && <span className="text-primary">Your turn</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  {me?.hand.map(card => {
                    const playable = !!myTurn && isPlayableClient(card, top, room.draw_stack);
                    return (
                      <UnoCard
                        key={card.id}
                        card={card}
                        playable={playable}
                        onClick={playable && !busy ? () => {
                          if (card.color === "wild") setPendingWild(card.id);
                          else playCard(card.id);
                        } : undefined}
                      />
                    );
                  })}
                </div>
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" disabled={!myTurn || busy} onClick={() => run("draw")}>
                    Draw {room.draw_stack > 0 ? `(${room.draw_stack})` : ""}
                  </Button>
                  <Button variant="outline" disabled={busy || (me?.hand.length || 0) !== 1} onClick={() => run("uno")}>
                    Call UNO
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Finished */}
        {room.status === "finished" && (
          <Card className="text-center">
            <CardHeader><CardTitle className="text-3xl">🏆 Game Over</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xl mb-4">
                Winner: <b>{players.find(p => p.seat === room.winner_seat)?.username || "—"}</b>
              </p>
              <Button onClick={() => navigate("/uno")}>Back to Lobby</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Wild color picker */}
      <Dialog open={!!pendingWild} onOpenChange={() => setPendingWild(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Choose a color</DialogTitle></DialogHeader>
          <div className="grid grid-cols-4 gap-3">
            {(["red", "yellow", "green", "blue"] as UnoColor[]).map(c => (
              <button
                key={c}
                onClick={() => { const id = pendingWild!; setPendingWild(null); playCard(id, c); }}
                className={`h-20 rounded-lg font-bold text-white ${
                  c === "red" ? "bg-red-600" : c === "yellow" ? "bg-yellow-400 text-black" :
                  c === "green" ? "bg-green-600" : "bg-blue-600"
                }`}
              >{c.toUpperCase()}</button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnoRoom;
