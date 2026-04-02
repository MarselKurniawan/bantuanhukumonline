import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/types/consultation';
import { mockMessages } from '@/data/mockData';

interface Props {
  clientName: string;
  disabled?: boolean;
}

export default function ChatRoom({ clientName, disabled }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || disabled) return;
    const newMsg: ChatMessage = {
      id: String(messages.length + 1),
      sender: 'Konsultan',
      message: input.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-bold text-primary">Chat Room</h3>
        <span className="text-sm text-info font-medium">{clientName}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-chat-other/30">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className="text-xs text-muted-foreground mb-1">
              <span className="font-semibold">{msg.sender}</span> {msg.time}
            </div>
            <div
              className={`inline-block max-w-[80%] px-4 py-3 rounded-xl text-sm ${
                msg.isUser
                  ? 'bg-chat-other text-chat-other-foreground rounded-tl-sm'
                  : 'bg-chat-user text-chat-user-foreground rounded-tl-sm'
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ketik pesan..."
          disabled={disabled}
          className="flex-1"
        />
        <Button size="icon" onClick={sendMessage} disabled={disabled || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
