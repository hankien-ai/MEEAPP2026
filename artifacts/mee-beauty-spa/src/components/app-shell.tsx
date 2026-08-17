import { useEffect, useState } from 'react';
import { BarChart3, CalendarDays, ChevronDown, CircleDollarSign, ClipboardCheck, Grid2X2, HeartHandshake, LayoutDashboard, Menu, Moon, PackageOpen, PanelLeftClose, Receipt, Settings, ShoppingCart, Sparkles, Sun, Users, WalletCards, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { demoBranch } from '@/data/demo';

const primaryNav = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/customers', label: 'Khách hàng', icon: Users },
  { href: '/booking', label: 'Lịch hẹn', icon: CalendarDays },
  { href: '/pos', label: 'Bán hàng', icon: ShoppingCart },
];
const workspaceNav = [
  { href: '/catalog', label: 'Danh mục', icon: Grid2X2 },
  { href: '/packages', label: 'Gói liệu trình', icon: PackageOpen },
  { href: '/staff', label: 'Đội ngũ', icon: HeartHandshake },
  { href: '/attendance', label: 'Chấm công', icon: ClipboardCheck },
  { href: '/loyalty', label: 'Loyalty', icon: Sparkles },
  { href: '/reports', label: 'Báo cáo', icon: BarChart3 },
  { href: '/expenses', label: 'Chi phí', icon: WalletCards },
];

function NavLink({ href, label, icon: Icon, onNavigate }: { href: string; label: string; icon: typeof LayoutDashboard; onNavigate?: () => void }) {
  const [location] = useLocation();
  const active = href === '/dashboard' ? location === '/dashboard' || location === '/' : location === href || location.startsWith(`${href}/`);
  return <Link href={href} className={`nav-item ${active ? 'active' : ''}`} onClick={onNavigate} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={17} strokeWidth={active ? 2.4 : 1.8} /><span>{label}</span></Link>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('mee-theme') as 'light' | 'dark') ?? 'light');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [location] = useLocation();
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('mee-theme', theme); }, [theme]);
  const toggleTheme = () => setTheme((value) => value === 'light' ? 'dark' : 'light');
  const closeDrawer = () => setDrawerOpen(false);
  return <div className="app-shell app-noise">
    <aside className={`sidebar ${drawerOpen ? 'mobile-drawer-open' : ''}`} data-testid="sidebar-navigation">
      <div className="mb-7 flex items-center gap-3 px-2"><div className="brand-mark">M</div><div className="brand-copy"><div className="font-display text-xl leading-none">mee</div><div className="mt-1 font-mono-app text-[9px] uppercase tracking-[.16em] text-sidebar-foreground/45">beauty spa</div></div><button className="mobile-only btn btn-ghost ml-auto" onClick={closeDrawer} data-testid="button-close-drawer"><X size={18} /></button></div>
      <div className="mb-5 rounded-xl border border-sidebar-border bg-sidebar-accent/55 px-3 py-3 branch-copy"><div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[.12em] text-sidebar-foreground/45">Chi nhánh</span><ChevronDown size={13} className="text-sidebar-foreground/45" /></div><div className="mt-2 text-xs font-bold">{demoBranch.name}</div><div className="mt-1 text-[10px] text-sidebar-foreground/50">Đang vận hành</div></div>
      <div className="nav-label">Điều hành</div>{primaryNav.map((item) => <NavLink key={item.href} {...item} onNavigate={closeDrawer} />)}
      <div className="nav-label">Không gian làm việc</div>{workspaceNav.map((item) => <NavLink key={item.href} {...item} onNavigate={closeDrawer} />)}
      <div className="mt-auto space-y-1">
        <NavLink href="/settings" label="Thiết lập" icon={Settings} onNavigate={closeDrawer} />
        <div className="mt-4 flex items-center gap-2 border-t border-sidebar-border px-2 pt-4"><div className="avatar small bg-sidebar-primary text-sidebar-primary-foreground">DA</div><div className="sidebar-footer-copy min-w-0 flex-1"><div className="truncate text-xs font-bold">DEV ADMIN</div><div className="truncate text-[10px] text-sidebar-foreground/45">Quản trị viên</div></div><button className="btn btn-ghost !p-2 text-sidebar-foreground/60" onClick={toggleTheme} data-testid="button-toggle-theme" aria-label="Đổi giao diện">{theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}</button></div>
      </div>
    </aside>
    {drawerOpen && <button className="fixed inset-0 z-40 hidden bg-black/20 max-sm:block" onClick={closeDrawer} aria-label="Đóng menu" data-testid="button-overlay-drawer" />}
    <div className="main-area">
      <header className="topbar"><div className="flex items-center gap-3"><button className="mobile-only btn btn-ghost !px-2" onClick={() => setDrawerOpen(true)} data-testid="button-open-drawer"><Menu size={19} /></button><div className="text-sm font-bold">{location === '/' || location === '/dashboard' ? 'Chào buổi sáng, đội MEE' : 'MEE BEAUTY SPA'}</div></div><div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-secondary-foreground sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> DEV ADMIN</div><button className="btn btn-ghost !p-2" onClick={toggleTheme} data-testid="button-toggle-theme-top" aria-label="Đổi giao diện">{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button><Link href="/settings" className="avatar small" data-testid="link-profile-admin">DA</Link></div></header>
      <main>{children}</main>
      <nav className="bottom-nav">{[primaryNav[0], primaryNav[1], primaryNav[2], workspaceNav[0], workspaceNav[5]].map((item) => { const Icon = item.icon; const active = location === item.href || (item.href === '/dashboard' && (location === '/' || location === '/dashboard')); return <Link href={item.href} key={item.href} className={active ? 'active' : ''} data-testid={`link-bottom-${item.label}`}><Icon size={18} /><span>{item.label}</span></Link>; })}</nav>
    </div>
  </div>;
}