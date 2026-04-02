import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Database, Users, ChevronDown, ChevronRight, Scale } from 'lucide-react';

const menuItems = [
  { label: 'Riwayat Konsultasi', icon: Clock, path: '/' },
  {
    label: 'Master Data',
    icon: Database,
    children: [
      { label: 'Jenis Konsultasi', path: '/master/jenis-konsultasi' },
      { label: 'Jenis Layanan', path: '/master/jenis-layanan' },
      { label: 'Jenis Hukum', path: '/master/jenis-hukum' },
    ],
  },
  {
    label: 'User Management',
    icon: Users,
    children: [
      { label: 'Daftar User', path: '/users' },
      { label: 'Roles', path: '/users/roles' },
    ],
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(['Master Data', 'User Management']);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  return (
    <aside className="w-56 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <Scale className="h-7 w-7 text-secondary" />
        <div className="font-bold text-sm leading-tight">
          Bantuan Hukum <span className="text-secondary">Online</span>
        </div>
      </div>

      <nav className="flex-1 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openMenus.includes(item.label);

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-sidebar-accent transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
                {isOpen && (
                  <div className="ml-11 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-3 py-2 text-xs rounded-sm transition-colors ${
                          location.pathname === child.path
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'hover:bg-sidebar-accent/50'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path!}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
