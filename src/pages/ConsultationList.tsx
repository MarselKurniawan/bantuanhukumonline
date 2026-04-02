import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, ExternalLink, Trash2, UserPlus, Monitor, MessageCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { consultations } from '@/data/mockData';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  in_progress: 'bg-info/20 text-info',
  completed: 'bg-success/20 text-success',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const typeIcons: Record<string, typeof Monitor> = {
  offline: Monitor,
  chat: MessageCircle,
  video_call: Video,
};

export default function ConsultationList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = consultations.filter(
    (c) =>
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.caseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-card rounded-lg border">
      <div className="flex justify-end p-4 border-b">
        <Button onClick={() => navigate('/consultation/new')}>
          <UserPlus className="h-4 w-4 mr-2" /> Buat Konsultasi
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-1" /> Filters (0)
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Export Data
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Show <select className="border rounded px-2 py-1 mx-1 bg-background"><option>10</option></select> entries
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-2 text-left font-semibold">No</th>
                <th className="py-3 px-2 text-left font-semibold">Profil</th>
                <th className="py-3 px-2 text-left font-semibold">Nama Kasus</th>
                <th className="py-3 px-2 text-center font-semibold">Jenis Konsultasi</th>
                <th className="py-3 px-2 text-center font-semibold">Jenis Layanan</th>
                <th className="py-3 px-2 text-center font-semibold">Jenis Hukum</th>
                <th className="py-3 px-2 text-center font-semibold">Tanggal Konsultasi</th>
                <th className="py-3 px-2 text-center font-semibold">Status</th>
                <th className="py-3 px-2 text-center font-semibold">Agenda</th>
                <th className="py-3 px-2 text-center font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const TypeIcon = typeIcons[c.consultationType];
                return (
                  <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-2">{c.no}</td>
                    <td className="py-4 px-2">{c.clientName}</td>
                    <td className="py-4 px-2">{c.caseName}</td>
                    <td className="py-4 px-2 text-center">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <TypeIcon className="h-3 w-3" />
                        {c.consultationType === 'offline' ? 'Offline' : c.consultationType === 'chat' ? 'Chat' : 'Video'}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-center text-xs">{c.serviceType}</td>
                    <td className="py-4 px-2 text-center">{c.lawType}</td>
                    <td className="py-4 px-2 text-center">{c.date}</td>
                    <td className="py-4 px-2 text-center">
                      <Badge className={`${statusColors[c.status]} border-0 text-xs`}>
                        <span className="mr-1">●</span> {statusLabels[c.status]}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-center">{c.agenda}</td>
                    <td className="py-4 px-2 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => navigate(`/consultation/${c.id}`)}
                          className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
