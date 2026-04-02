import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function RatingPanel() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');

  const submit = () => {
    if (rating === 0) {
      toast.error('Silakan pilih rating terlebih dahulu');
      return;
    }
    toast.success('Rating berhasil dikirim!');
  };

  return (
    <div className="bg-card rounded-lg border p-5 space-y-4">
      <h3 className="font-bold text-lg">Beri Rating Pengacara</h3>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Rating Pengacara:</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 ${
                  i <= (hover || rating) ? 'fill-secondary text-secondary' : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Stiker dan Ulasan:</p>
        {rating > 0 ? (
          <div className="text-4xl mb-3">{rating >= 4 ? '⭐' : rating >= 2 ? '👍' : '😐'}</div>
        ) : (
          <p className="text-muted-foreground text-sm mb-3">Pilih rating untuk melihat stiker.</p>
        )}
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Tulis Ulasan Anda:</p>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Bagaimana pengalaman Anda dengan pengacara ini?"
          rows={4}
        />
      </div>

      <Button onClick={submit} className="w-full">
        Kirim Rating
      </Button>
    </div>
  );
}
