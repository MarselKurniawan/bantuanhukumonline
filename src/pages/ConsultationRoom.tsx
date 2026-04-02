import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { consultations } from '@/data/mockData';
import { useTimer } from '@/hooks/useTimer';
import ChatRoom from '@/components/consultation/ChatRoom';
import ConsultationDetail from '@/components/consultation/ConsultationDetail';
import RatingPanel from '@/components/consultation/RatingPanel';
import CameraModal from '@/components/consultation/CameraModal';

export default function ConsultationRoom() {
  const { id } = useParams();
  const consultation = consultations.find((c) => c.id === id);
  const timer = useTimer();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'start' | 'end'>('start');
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  if (!consultation) {
    return <div className="text-center py-20 text-muted-foreground">Konsultasi tidak ditemukan</div>;
  }

  const isOffline = consultation.consultationType === 'offline';
  const isChat = consultation.consultationType === 'chat';
  const isVideo = consultation.consultationType === 'video_call';

  const handleStartOffline = () => {
    setCameraMode('start');
    setCameraOpen(true);
  };

  const handleEndOffline = () => {
    setCameraMode('end');
    setCameraOpen(true);
  };

  const handleCameraCapture = (_imageData: string) => {
    if (cameraMode === 'start') {
      setStarted(true);
      timer.start();
    } else {
      setEnded(true);
      timer.stop();
    }
  };

  const handleStartChat = () => {
    setChatOpen(true);
    setStarted(true);
    timer.start();
  };

  const handleEndChat = () => {
    setChatOpen(false);
    setEnded(true);
    timer.stop();
  };

  const handleStartVideo = () => {
    setChatOpen(true);
    setStarted(true);
    timer.start();
  };

  const handleEndVideo = () => {
    setEnded(true);
    timer.stop();
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground flex items-center gap-1">
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Detail Konsultasi</span>
      </nav>

      <h1 className="text-xl font-bold text-muted-foreground">Ruang Konsultasi</h1>

      {/* Action buttons */}
      {isOffline && (
        <div className="flex gap-3">
          {!started && (
            <Button onClick={handleStartOffline}>📷 Mulai Konsultasi (Foto)</Button>
          )}
          {started && !ended && (
            <Button variant="destructive" onClick={handleEndOffline}>📷 Akhiri Konsultasi (Foto)</Button>
          )}
        </div>
      )}

      {isChat && !chatOpen && !ended && (
        <Button onClick={handleStartChat}>💬 Buka Chat Konsultasi</Button>
      )}

      {isChat && chatOpen && !ended && (
        <Button variant="destructive" onClick={handleEndChat}>Akhiri Konsultasi</Button>
      )}

      {isVideo && !started && (
        <Button onClick={handleStartVideo}>🎥 Mulai Video Konsultasi</Button>
      )}

      {isVideo && started && !ended && (
        <Button variant="destructive" onClick={handleEndVideo}>Akhiri Konsultasi</Button>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat / Offline area */}
        <div className="lg:col-span-1 bg-card rounded-lg border min-h-[500px] flex flex-col">
          {(isChat || isVideo) && chatOpen ? (
            <ChatRoom clientName={consultation.clientName} disabled={ended} />
          ) : isOffline && started ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
              <div className="text-6xl">🏢</div>
              <p className="text-muted-foreground text-center text-sm">
                Konsultasi offline sedang berlangsung
              </p>
              {ended && (
                <p className="text-success font-semibold">Konsultasi telah selesai</p>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted-foreground text-sm">
              {isOffline ? 'Klik "Mulai Konsultasi" untuk memulai' : 'Klik tombol di atas untuk memulai'}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          <ConsultationDetail
            consultation={consultation}
            timerFormatted={timer.formatted}
            timerRunning={timer.isRunning}
          />
        </div>

        {/* Video call + Rating panel */}
        <div className="lg:col-span-1 space-y-4">
          {isVideo && started && !ended && (
            <div className="bg-card rounded-lg border p-5 space-y-3">
              <h3 className="font-bold text-lg">Video Call</h3>
              <div className="aspect-video bg-foreground/5 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">🎥</div>
                  <p className="text-sm">Video call area</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => window.open('https://meet.google.com', '_blank')}>
                🎥 Join Video Call
              </Button>
            </div>
          )}

          {(ended || consultation.status === 'completed') && <RatingPanel />}
        </div>
      </div>

      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
        title={cameraMode === 'start' ? 'Foto Mulai Konsultasi' : 'Foto Akhiri Konsultasi'}
      />
    </div>
  );
}
