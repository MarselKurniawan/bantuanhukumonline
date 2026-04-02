interface Props {
  lastSeenAt: string | null;
  size?: 'sm' | 'md';
}

export default function OnlineBadge({ lastSeenAt, size = 'sm' }: Props) {
  const now = new Date();
  const lastSeen = lastSeenAt ? new Date(lastSeenAt) : null;
  const isOnline = lastSeen ? (now.getTime() - lastSeen.getTime()) < 24 * 60 * 60 * 1000 : false;

  const dotSize = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
      isOnline 
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
        : 'bg-muted text-muted-foreground border'
    }`}>
      <span className={`${dotSize} rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
