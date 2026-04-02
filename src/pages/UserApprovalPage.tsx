import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, User, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1); gain1.connect(audioCtx.destination);
    osc1.frequency.value = 800; osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc1.start(audioCtx.currentTime); osc1.stop(audioCtx.currentTime + 0.3);
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2); gain2.connect(audioCtx.destination);
    osc2.frequency.value = 1000; osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc2.start(audioCtx.currentTime + 0.15); osc2.stop(audioCtx.currentTime + 0.5);
  } catch (e) { console.log('Audio notification not supported'); }
}

export default function UserApprovalPage() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevCountRef = useRef<number | null>(null);

  // Rejection modal
  const [rejectTarget, setRejectTarget] = useState<Profile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchPending = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });
    const newData = (data as Profile[]) || [];
    
    if (prevCountRef.current !== null && newData.length > prevCountRef.current) {
      const newCount = newData.length - prevCountRef.current;
      if (soundEnabled) playNotificationSound();
      toast.info(`🔔 ${newCount} pendaftaran baru masuk!`, {
        description: newData[0]?.nama ? `${newData[0].nama} baru saja mendaftar` : undefined,
        duration: 5000,
      });
    }
    prevCountRef.current = newData.length;
    
    setPendingUsers(newData);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
    const channel = supabase
      .channel('pending-users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload: any) => {
        if (payload.new.approval_status === 'pending') fetchPending();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => fetchPending())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [soundEnabled]);

  const handleApprove = async (profile: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: 'approved', approved_by: user?.id, approved_at: new Date().toISOString() })
      .eq('id', profile.id);
    if (error) toast.error('Gagal: ' + error.message);
    else { toast.success(`${profile.nama} berhasil disetujui`); fetchPending(); }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { toast.error('Alasan penolakan wajib diisi'); return; }
    setRejecting(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        approval_status: 'rejected',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectReason.trim(),
      } as any)
      .eq('id', rejectTarget.id);
    setRejecting(false);
    if (error) toast.error('Gagal: ' + error.message);
    else {
      toast.success(`${rejectTarget.nama} ditolak`);
      setRejectTarget(null);
      setRejectReason('');
      fetchPending();
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Memuat data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Persetujuan User</h1>
          <p className="text-sm text-muted-foreground mt-1">Setujui atau tolak pendaftaran user baru</p>
        </div>
        <Button
          variant={soundEnabled ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => { setSoundEnabled(!soundEnabled); toast.info(soundEnabled ? 'Notifikasi suara dimatikan' : 'Notifikasi suara diaktifkan'); }}
        >
          {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          {soundEnabled ? 'Suara On' : 'Suara Off'}
        </Button>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Tidak ada pendaftaran yang menunggu persetujuan</p>
        </div>
      ) : (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-600 animate-pulse" />
            <p className="text-sm text-amber-800 font-medium">{pendingUsers.length} pendaftaran menunggu persetujuan</p>
          </div>
          <div className="grid gap-4">
            {pendingUsers.map((p) => (
              <div key={p.id} className="bg-card rounded-xl border border-border p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{p.nama || 'Tanpa Nama'}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        {p.nik && <span>NIK: {p.nik}</span>}
                        {p.nomor_wa && <span>WA: {p.nomor_wa}</span>}
                        {p.tanggal_lahir && <span>Lahir: {p.tanggal_lahir}</span>}
                        {p.jenis_kelamin && <span>{p.jenis_kelamin}</span>}
                        {p.penyandang_disabilitas && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold">♿ Disabilitas</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span className="text-xs text-amber-600 font-medium">Menunggu persetujuan</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setRejectTarget(p); setRejectReason(''); }}>
                      <XCircle className="h-4 w-4 mr-1" /> Tolak
                    </Button>
                    <Button size="sm" className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(p)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Setujui
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Rejection reason modal */}
      <Dialog open={!!rejectTarget} onOpenChange={(v) => !v && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak Pendaftaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Anda akan menolak pendaftaran <strong>{rejectTarget?.nama}</strong>. Masukkan alasan penolakan:
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Data NIK tidak valid, dokumen tidak lengkap..."
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectTarget(null)}>Batal</Button>
              <Button variant="destructive" onClick={handleReject} disabled={rejecting || !rejectReason.trim()}>
                {rejecting ? 'Memproses...' : 'Tolak Pendaftaran'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
