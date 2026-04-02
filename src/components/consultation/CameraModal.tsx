import { useState, useRef, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
  title: string;
}

export default function CameraModal({ open, onClose, onCapture, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setCameraActive(true);
    } catch {
      alert('Tidak dapat mengakses kamera. Silakan gunakan upload foto.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const data = canvas.toDataURL('image/jpeg');
      setCaptured(data);
      stopCamera();
    }
  }, [stopCamera]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCaptured(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (captured) {
      onCapture(captured);
      setCaptured(null);
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCaptured(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {captured ? (
            <div className="space-y-3">
              <img src={captured} alt="Captured" className="w-full rounded-lg" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCaptured(null)}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Ulangi
                </Button>
                <Button className="flex-1" onClick={handleConfirm}>
                  <Check className="h-4 w-4 mr-2" /> Konfirmasi
                </Button>
              </div>
            </div>
          ) : cameraActive ? (
            <div className="space-y-3">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-foreground" />
              <Button className="w-full" onClick={takePhoto}>
                <Camera className="h-4 w-4 mr-2" /> Ambil Foto
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 items-center py-8">
                <Camera className="h-16 w-16 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  Ambil foto atau upload gambar sebagai bukti konsultasi
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={startCamera}>
                  <Camera className="h-4 w-4 mr-2" /> Buka Kamera
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Upload
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
