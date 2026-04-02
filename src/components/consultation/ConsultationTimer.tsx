import { Clock } from 'lucide-react';

interface Props {
  formatted: string;
  isRunning: boolean;
}

export default function ConsultationTimer({ formatted, isRunning }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-success animate-pulse-dot' : 'bg-muted-foreground'}`} />
      <Clock className="h-4 w-4 text-primary" />
      <span className="font-semibold text-primary">{formatted}</span>
    </div>
  );
}
