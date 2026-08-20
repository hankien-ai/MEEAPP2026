
============================================================
FILE: src/components/app-shell.tsx
============================================================
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
============================================================
FILE: src/components/error-boundary.tsx
============================================================
import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  /** Changing this clears a caught error. Pass the route to recover on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

function DefaultFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          This part of the app hit an error. The rest of the app is still
          running.
        </p>
        {/* Dev only: messages can carry API responses and other internals. */}
        {import.meta.env.DEV ? (
          <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-3 text-left text-xs text-gray-800">
            {error.message || String(error)}
          </pre>
        ) : null}
        <button
          type="button"
          onClick={resetError}
          className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      'ErrorBoundary caught an error:',
      toError(error),
      info.componentStack,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error !== null &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    const Fallback = this.props.FallbackComponent ?? DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}

============================================================
FILE: src/components/primitives.tsx
============================================================
import { type ReactNode } from 'react';
import { Check, CircleAlert, LoaderCircle, X } from 'lucide-react';

export function PageHeader({ kicker, title, subtitle, actions }: { kicker: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4" data-testid={`header-${title.toLowerCase().replaceAll(' ', '-')}`}>
      <div><div className="page-kicker">{kicker}</div><h1 className="page-title">{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className = '', testId }: { children: ReactNode; className?: string; testId?: string }) {
  return <section className={`panel ${className}`} data-testid={testId}>{children}</section>;
}

export function PanelHeader({ title, caption, actions }: { title: string; caption?: string; actions?: ReactNode }) {
  return <div className="panel-header"><div><h2 className="panel-title">{title}</h2>{caption && <p className="panel-caption">{caption}</p>}</div>{actions}</div>;
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'coral' | 'green' | 'ink' }) {
  return <span className={`tag ${tone === 'coral' ? 'tag-coral' : tone === 'green' ? 'tag-green' : tone === 'ink' ? 'tag-ink' : ''}`}>{children}</span>;
}

export function LoadingBlock({ rows = 4 }: { rows?: number }) {
  return <div className="space-y-3 p-5" data-testid="loading-skeleton">{Array.from({ length: rows }).map((_, index) => <div className="skeleton h-10 w-full" key={index} />)}</div>;
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: typeof CircleAlert; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state" data-testid="empty-state"><div className="empty-icon"><Icon size={21} /></div><h3 className="font-bold text-sm">{title}</h3><p className="mt-2 max-w-sm text-xs text-muted-foreground">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function ErrorState({ retry }: { retry?: () => void }) {
  return <div className="empty-state" data-testid="error-state"><div className="empty-icon" style={{ color: 'hsl(var(--destructive))' }}><CircleAlert size={21} /></div><h3 className="font-bold text-sm">Không thể tải dữ liệu</h3><p className="mt-2 max-w-sm text-xs text-muted-foreground">Có lỗi tạm thời ở khu vực demo. Thử tải lại để tiếp tục.</p>{retry && <button className="btn btn-soft mt-5" onClick={retry} data-testid="button-retry">Thử lại</button>}</div>;
}

export function Modal({ title, description, children, onClose }: { title: string; description?: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-label={title} data-testid="modal-dialog"><div className="panel-header"><div><h2 className="panel-title">{title}</h2>{description && <p className="panel-caption">{description}</p>}</div><button className="btn btn-ghost" onClick={onClose} aria-label="Đóng" data-testid="button-close-modal"><X size={17} /></button></div>{children}</div></div>;
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="toast-inline" role="status" data-testid="status-toast"><span className="inline-flex items-center gap-2"><Check size={15} />{message}</span><button className="ml-3 opacity-70 hover:opacity-100" onClick={onClose} data-testid="button-close-toast"><X size={14} /></button></div>;
}

export function LoadingButton({ children, loading, onClick, testId, type = 'button' }: { children: ReactNode; loading?: boolean; onClick?: () => void; testId: string; type?: 'button' | 'submit' }) {
  return <button className="btn btn-primary" type={type} onClick={onClick} disabled={loading} data-testid={testId}>{loading ? <LoaderCircle size={15} className="animate-spin" /> : null}{children}</button>;
}