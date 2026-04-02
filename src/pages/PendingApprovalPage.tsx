import { Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function PendingApprovalPage() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const isRejected = profile?.approval_status === 'rejected';

  const handleReRegister = async () => {
    await signOut();
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 text-center">
          {isRejected ? (
            <>
              <div className="h-16 w-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">Pendaftaran Ditolak</h1>
              <p className="text-sm text-muted-foreground mb-4">
                Akun Anda ({profile?.email}) telah ditolak oleh admin.
              </p>
              {(profile as any)?.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-left">
                  <p className="text-xs font-semibold text-red-800 mb-1">Alasan Penolakan:</p>
                  <p className="text-sm text-red-700">{(profile as any).rejection_reason}</p>
                </div>
              )}
              <div className="space-y-2">
                <Button onClick={handleReRegister} className="w-full">
                  Daftar Ulang
                </Button>
                <Button variant="outline" onClick={signOut} className="w-full">
                  Keluar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">Menunggu Persetujuan</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Akun Anda ({profile?.email}) sedang menunggu persetujuan dari admin. Anda akan mendapat akses setelah akun disetujui.
              </p>
              <Button variant="outline" onClick={signOut} className="w-full">
                Keluar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
