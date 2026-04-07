import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Phone, Mail, Calendar, Search, UserCircle, Plus, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import OnlineBadge from '@/components/shared/OnlineBadge';

export default function ClientListPage() {
  const { role } = useAuth();
  const [clients, setClients] = useState<(Profile & { role?: string })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    nama: '', nik: '', nomorWa: '', tanggalLahir: '', jenisKelamin: 'Laki-laki',
    penyandangDisabilitas: 'false', email: '', password: '',
  });

  // Edit state
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ nama: '', nik: '', nomorWa: '', tanggalLahir: '', jenisKelamin: 'Laki-laki', penyandangDisabilitas: 'false' });
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteUser, setDeleteUser] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = role === 'superadmin' || role === 'admin';

  const fetchClients = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id, role').eq('role', 'client');
    if (!roles) { setLoading(false); return; }
    const userIds = roles.map(r => r.user_id);
    if (userIds.length === 0) { setClients([]); setLoading(false); return; }
    const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', userIds).eq('approval_status', 'approved');
    setClients((profiles as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.nama || !addForm.email || !addForm.password) { toast.error('Nama, Email, dan Password wajib diisi'); return; }
    if (addForm.nik && addForm.nik.length !== 16) { toast.error('NIK harus tepat 16 digit'); return; }
    if (addForm.password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setAdding(true);
    const res = await supabase.functions.invoke('create-user', {
      body: { email: addForm.email, password: addForm.password, nama: addForm.nama, nomor_wa: addForm.nomorWa || null, role: 'client', nik: addForm.nik || null, tanggal_lahir: addForm.tanggalLahir || null, jenis_kelamin: addForm.jenisKelamin, penyandang_disabilitas: addForm.penyandangDisabilitas === 'true' },
    });
    if (res.error || res.data?.error) { toast.error(res.data?.error || res.error?.message || 'Gagal'); setAdding(false); return; }
    toast.success('Client berhasil ditambahkan');
    setShowAdd(false);
    setAddForm({ nama: '', nik: '', nomorWa: '', tanggalLahir: '', jenisKelamin: 'Laki-laki', penyandangDisabilitas: 'false', email: '', password: '' });
    setAdding(false);
    fetchClients();
  };

  const openEdit = (c: Profile) => {
    setEditUser(c);
    setEditForm({ nama: c.nama, nik: c.nik || '', nomorWa: c.nomor_wa || '', tanggalLahir: c.tanggal_lahir || '', jenisKelamin: c.jenis_kelamin || 'Laki-laki', penyandangDisabilitas: (c as any).penyandang_disabilitas ? 'true' : 'false' });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser || !editForm.nama) { toast.error('Nama wajib diisi'); return; }
    setSaving(true);
    const res = await supabase.functions.invoke('manage-user', {
      body: { action: 'update', user_id: editUser.user_id, profile_data: { nama: editForm.nama, nik: editForm.nik || null, nomor_wa: editForm.nomorWa || null, tanggal_lahir: editForm.tanggalLahir || null, jenis_kelamin: editForm.jenisKelamin, penyandang_disabilitas: editForm.penyandangDisabilitas === 'true' } },
    });
    if (res.error || res.data?.error) { toast.error(res.data?.error || 'Gagal menyimpan'); setSaving(false); return; }
    toast.success('Data berhasil diperbarui');
    setEditUser(null);
    setSaving(false);
    fetchClients();
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    const res = await supabase.functions.invoke('manage-user', {
      body: { action: 'delete', user_id: deleteUser.user_id },
    });
    if (res.error || res.data?.error) { toast.error(res.data?.error || 'Gagal menghapus'); setDeleting(false); return; }
    toast.success('User berhasil dihapus');
    setDeleteUser(null);
    setDeleting(false);
    fetchClients();
  };

  const filtered = clients.filter(c =>
    c.nama.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.nik?.includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Daftar Client</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data client yang terdaftar</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowAdd(true)} className="gap-2 font-semibold">
            <Plus className="h-4 w-4" /> Tambah Client
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, email, atau NIK..." className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <UserCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Tidak ada client ditemukan</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {c.jenis_kelamin === 'Perempuan' ? (
                  <svg className="h-5 w-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>
                ) : (
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="14" r="5"/><path d="M19 5l-4.5 4.5M19 5h-5M19 5v5"/></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground truncate">{c.nama}</p>
                  <OnlineBadge lastSeenAt={(c as any).last_seen_at} />
                  {(c as any).penyandang_disabilitas && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold">♿ Disabilitas</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  {c.nik && <span>NIK: {c.nik}</span>}
                  {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                  {c.nomor_wa && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.nomor_wa}</span>}
                  {c.tanggal_lahir && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{c.tanggal_lahir}</span>}
                </div>
              </div>
              {canManage && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteUser(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tambah Client</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3.5">
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Nama Lengkap</Label><Input value={addForm.nama} onChange={(e) => setAddForm(p => ({ ...p, nama: e.target.value }))} placeholder="Nama lengkap" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">NIK (16 digit)</Label><Input value={addForm.nik} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); setAddForm(p => ({ ...p, nik: v })); }} placeholder="Masukkan 16 digit NIK" maxLength={16} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-semibold">Jenis Kelamin</Label><Select value={addForm.jenisKelamin} onValueChange={(v) => setAddForm(p => ({ ...p, jenisKelamin: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold">Disabilitas</Label><Select value={addForm.penyandangDisabilitas} onValueChange={(v) => setAddForm(p => ({ ...p, penyandangDisabilitas: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="false">Tidak</SelectItem><SelectItem value="true">Ya</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Nomor WhatsApp</Label><Input value={addForm.nomorWa} onChange={(e) => setAddForm(p => ({ ...p, nomorWa: e.target.value }))} placeholder="08xxxxxxxxxx" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Tanggal Lahir</Label><Input type="date" value={addForm.tanggalLahir} onChange={(e) => setAddForm(p => ({ ...p, tanggalLahir: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Email</Label><Input type="email" value={addForm.email} onChange={(e) => setAddForm(p => ({ ...p, email: e.target.value }))} placeholder="email@contoh.com" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Password</Label><div className="relative"><Input type={showPw ? 'text' : 'password'} value={addForm.password} onChange={(e) => setAddForm(p => ({ ...p, password: e.target.value }))} placeholder="Minimal 6 karakter" /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            <Button type="submit" className="w-full font-bold" disabled={adding}>{adding ? 'Memproses...' : 'Simpan'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3.5">
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Nama Lengkap</Label><Input value={editForm.nama} onChange={(e) => setEditForm(p => ({ ...p, nama: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">NIK</Label><Input value={editForm.nik} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); setEditForm(p => ({ ...p, nik: v })); }} maxLength={16} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-semibold">Jenis Kelamin</Label><Select value={editForm.jenisKelamin} onValueChange={(v) => setEditForm(p => ({ ...p, jenisKelamin: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold">Disabilitas</Label><Select value={editForm.penyandangDisabilitas} onValueChange={(v) => setEditForm(p => ({ ...p, penyandangDisabilitas: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="false">Tidak</SelectItem><SelectItem value="true">Ya</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Nomor WhatsApp</Label><Input value={editForm.nomorWa} onChange={(e) => setEditForm(p => ({ ...p, nomorWa: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Tanggal Lahir</Label><Input type="date" value={editForm.tanggalLahir} onChange={(e) => setEditForm(p => ({ ...p, tanggalLahir: e.target.value }))} /></div>
            <Button type="submit" className="w-full font-bold" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(o) => !o && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus <strong>{deleteUser?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleting ? 'Menghapus...' : 'Hapus'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
