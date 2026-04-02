import { User, Phone, CreditCard, Accessibility } from 'lucide-react';

interface Props {
  clientName: string;
  nik?: string;
  nomorWa?: string;
  jenisKelamin?: string;
  penyandangDisabilitas?: boolean;
}

export default function ClientDetailCard({ clientName, nik, nomorWa, jenisKelamin, penyandangDisabilitas }: Props) {
  return (
    <div className="bg-card rounded-lg border">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <User className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-sm">Detail Client</h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {jenisKelamin === 'Perempuan' ? (
              <svg className="h-5 w-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>
            ) : (
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="14" r="5"/><path d="M19 5l-4.5 4.5M19 5h-5M19 5v5"/></svg>
            )}
          </div>
          <div>
            <p className="text-sm font-bold">{clientName}</p>
            {jenisKelamin && <p className="text-xs text-muted-foreground">{jenisKelamin}</p>}
          </div>
        </div>

        <div className="border-t my-2" />

        <div className="space-y-2.5">
          {nik && (
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">NIK</p>
                <p className="text-xs font-mono font-medium">{nik}</p>
              </div>
            </div>
          )}
          {nomorWa && (
            <div className="flex items-center gap-2.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Nomor WA</p>
                <p className="text-xs font-medium">{nomorWa}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <Accessibility className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Penyandang Disabilitas</p>
              {penyandangDisabilitas ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold mt-0.5">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4" r="2"/><path d="M12 6v6M8 12h8l-2 8H10l-2-8"/></svg>
                  Ya
                </span>
              ) : (
                <p className="text-xs font-medium text-muted-foreground">Tidak</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
