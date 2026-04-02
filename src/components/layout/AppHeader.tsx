import { Bell, ChevronDown, User } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="h-14 bg-primary flex items-center justify-end px-6 gap-4">
      <button className="text-primary-foreground hover:opacity-80 transition-opacity">
        <Bell className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 text-primary-foreground">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium">superadmin</span>
        <ChevronDown className="h-3 w-3" />
      </div>
    </header>
  );
}
