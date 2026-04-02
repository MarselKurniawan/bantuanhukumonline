import { Consultation } from '@/types/consultation';
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ConsultationTimer from './ConsultationTimer';

interface Props {
  consultation: Consultation;
  timerFormatted: string;
  timerRunning: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning',
  in_progress: 'bg-info/20 text-info border-info',
  completed: 'bg-success/20 text-success border-success',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const typeLabels: Record<string, string> = {
  chat: 'Chat Online',
  offline: 'Offline',
  video_call: 'Video Call',
};

export default function ConsultationDetail({ consultation, timerFormatted, timerRunning }: Props) {
  return (
    <div className="bg-card rounded-lg border p-5 space-y-4">
      <div>
        <h3 className="font-bold text-lg">Detail Konsultasi</h3>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className={statusColors[consultation.status]}>
            {statusLabels[consultation.status]}
          </Badge>
          <Badge variant="outline" className="bg-info/10 text-info border-info">
            💬 {typeLabels[consultation.consultationType]}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <span>Lawyer</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <span>{consultation.clientName}</span>
        </div>
      </div>

      <div className="border-t pt-4 space-y-2 text-sm">
        <h4 className="font-bold">Informasi Konsultasi</h4>
        <div>
          <span className="font-semibold">Nama Kasus</span>
          <p className="text-muted-foreground">{consultation.caseName}</p>
        </div>
        <div>
          <span className="font-semibold">Jenis Hukum</span>
          <p className="text-muted-foreground">{consultation.lawType}</p>
        </div>
        <div>
          <span className="font-semibold">Tanggal Konsultasi</span>
          <p className="text-muted-foreground">{consultation.date}</p>
        </div>
        <div>
          <span className="font-semibold">Agenda</span>
          <p className="text-muted-foreground">{consultation.agenda}</p>
        </div>
        <div>
          <span className="font-semibold">Durasi</span>
          <ConsultationTimer formatted={timerFormatted} isRunning={timerRunning} />
        </div>
      </div>
    </div>
  );
}
