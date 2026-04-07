import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Plus, UserCircle, Mail, Phone, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import OnlineBadge from '@/components/shared/OnlineBadge';

export default function LawyerListPage() {
  const { role } = useAuth();
  const [lawyers, setLawyers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ nama: '', nomorWa: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [adding, setAdding] = useState(false);

  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ nama: '', nomorWa: '' });
  const [saving, setSaving] = useState(false);

  const [deleteUser, setDeleteUser] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = role === 'superadmin' || role === 'admin';

  const fetchLawyers = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'lawyer');
    if (!roles || roles.length === 0) { setLawyers([]); setLoading(false); return; }
    const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', roles.map(r => r.user_id));
    setLawyers((profiles as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLawyers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.nama || !addForm.email || !addForm.password) { toast.error('Nama, Email, dan Password wajib diisi'); return; }
    if (addForm.password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setAdding(true);
    const res = await supabase.functions.invoke('create-user', {
      body: { email: addForm.email, password: addForm.password, nama: addForm.nama, nomor_wa: addForm.nomorWa, role: 'lawyer' },
    });
    if (res.error || res.data?.error) { toast.error(res.data?.error || res.error?.message || 'Gagal'); setAdding(false); return; }
    toast.success('Lawyer berhasil ditambahkan');
    setShowAdd(false);
    setAddForm({ nama: '', nomorWa: '', email: '', password: '' });
    setAdding(false);
    fetchLawyers();
  };

  const openEdit = (l: Profile) => {
    setEditUser(l);
    setEditForm({ nama: l.nama, nomorWa: l.nomor_wa || '' });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser || !editForm.nama) { toast.error('Nama wajib diisi'); return; }
    setSaving(true);
    const res = await supabase.functions.invoke('manage-user', {
      body: { action: 'update', user_id: editUser.user_id, profile_data: { nama: editForm.nama, nomor_wa: editForm.nomorWa || null } },
    });
    if (res.error || res.data?.error) { toast.error(res.data?.error || 'Gagal'); setSaving(false); return; }
    toast.success('Data berhasil diperbarui');
    setEditUser(null);
    setSaving(false);
    fetchLawyers();
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    const res = await supabase.functions.invoke('manage-user', {
      body: { action: 'delete', user_id: deleteUser.user_id },
    });
    if (res.error || res.data?.error) { toast.error(res.data?.error || 'Gagal'); setDeleting(false); return; }
    toast.success('User berhasil dihapus');
    setDeleteUser(null);
    setDeleting(false);
    fetchLawyers();
  };

  const filtered = lawyers.filter(c =>
    c.nama.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Daftar Lawyer</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data lawyer</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowAdd(true)} className="gap-2 font-semibold">
            <Plus className="h-4 w-4" /> Tambah Lawyer
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <UserCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Tidak ada lawyer ditemukan</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((l) => (
            <div key={l.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">{l.nama}</p>
                  <OnlineBadge lastSeenAt={(l as any).last_seen_at} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  {l.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{l.email}</span>}
                  {l.nomor_wa && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{l.nomor_wa}</span>}
                </div>
              </div>
              {canManage && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(l)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteUser(l)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Lawyer Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Tambah Lawyer</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Nama</Label><Input value={addForm.nama} onChange={(e) => setAddForm(p => ({ ...p, nama: e.target.value }))} placeholder="Nama lawyer" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Nomor WhatsApp</Label><Input value={addForm.nomorWa} onChange={(e) => setAddForm(p => ({ ...p, nomorWa: e.target.value }))} placeholder="08xxxxxxxxxx" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Email</Label><Input type="email" value={addForm.email} onChange={(e) => setAddForm(p => ({ ...p, email: e.target.value }))} placeholder="email@contoh.com" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Password</Label><div className="relative"><Input type={showPw ? 'text' : 'password'} value={addForm.password} onChange={(e) => setAddForm(p => ({ ...p, password: e.target.value }))} placeholder="Minimal 6 karakter" /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            <Button type="submit" className="w-full font-bold" disabled={adding}>{adding ? 'Memproses...' : 'Simpan'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Lawyer</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Nama</Label><Input value={editForm.nama} onChange={(e) => setEditForm(p => ({ ...p, nama: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-semibold">Nomor WhatsApp</Label><Input value={editForm.nomorWa} onChange={(e) => setEditForm(p => ({ ...p, nomorWa: e.target.value }))} /></div>
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
