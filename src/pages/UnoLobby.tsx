import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { unoAction } from "@/hooks/useUnoRoom";
import { Auth } from "@/components/Auth";
import { ArrowLeft } from "lucide-react";

const UnoLobby = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [passcode, setPasscode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinPass, setJoinPass] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: prof } = await supabase.from("profiles").select("username").eq("id", data.user.id).maybeSingle();
        setUsername(prof?.username || data.user.email?.split("@")[0] || "Player");
      }
    });
  }, []);

  const ensureAuth = () => {
    if (!user) { setShowAuth(true); return false; }
    return true;
  };

  const create = async () => {
    if (!ensureAuth()) return;
    setBusy(true);
    try {
      const res: any = await unoAction("create", { username, maxPlayers, passcode: passcode || undefined });
      toast({ title: "Room created", description: `Code: ${res.room.code}` });
      navigate(`/uno/${res.room.code}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const join = async () => {
    if (!ensureAuth()) return;
    setBusy(true);
    try {
      await unoAction("join", { code: joinCode, username, passcode: joinPass || undefined });
      navigate(`/uno/${joinCode}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent">
          UNO Online
        </h1>
        <p className="text-muted-foreground mb-8">No Mercy rules · Stacking · Draw-until-play · Elimination at 25 cards</p>

        {!user && (
          <Card className="mb-6 border-primary/40">
            <CardContent className="p-4 flex items-center justify-between">
              <p>Sign in to create or join rooms.</p>
              <Button onClick={() => setShowAuth(true)}>Sign In</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Create Room</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Display name</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div>
                <Label>Max players (2-6)</Label>
                <Input type="number" min={2} max={6} value={maxPlayers}
                  onChange={e => setMaxPlayers(Number(e.target.value))} />
              </div>
              <div>
                <Label>Passcode (optional)</Label>
                <Input value={passcode} onChange={e => setPasscode(e.target.value)} placeholder="Leave blank for public" />
              </div>
              <Button className="w-full" onClick={create} disabled={busy || !username}>Create Room</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Join Room</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Display name</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div>
                <Label>Room code</Label>
                <Input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="6-digit code" maxLength={6} />
              </div>
              <div>
                <Label>Passcode (if required)</Label>
                <Input value={joinPass} onChange={e => setJoinPass(e.target.value)} />
              </div>
              <Button className="w-full" onClick={join} disabled={busy || !joinCode || !username}>Join Room</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader><CardTitle>No Mercy Rules</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>• Match top card by color or value. Wilds always playable.</p>
            <p>• <b>Stacking:</b> +2 and +4 cards stack — next player must add a +2/+4 or draw the total.</p>
            <p>• <b>Draw until playable:</b> if you can't play, you keep drawing until you get a card you can play.</p>
            <p>• <b>Skip/Reverse/+2/+4</b> apply to the next player after you play.</p>
            <p>• <b>UNO call:</b> tap "Call UNO" when you're down to one card.</p>
            <p>• <b>Elimination:</b> if your hand reaches 25 cards, you're out. Last player standing (or first to 0) wins.</p>
          </CardContent>
        </Card>
      </div>
      <Auth open={showAuth} onClose={() => { setShowAuth(false); supabase.auth.getUser().then(({ data }) => setUser(data.user)); }} />
    </div>
  );
};

export default UnoLobby;
