# PROJECT EXPORT - MEE BEAUTY SPA

Generated: Wed Aug 19 03:42:46 PM UTC 2026
Project root: /home/runner/workspace/artifacts/mee-beauty-spa

============================================================
PROJECT STRUCTURE
============================================================
src/App.tsx
src/components/app-shell.tsx
src/components/error-boundary.tsx
src/components/primitives.tsx
src/components/ui/accordion.tsx
src/components/ui/alert-dialog.tsx
src/components/ui/alert.tsx
src/components/ui/aspect-ratio.tsx
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/breadcrumb.tsx
src/components/ui/button-group.tsx
src/components/ui/button.tsx
src/components/ui/calendar.tsx
src/components/ui/card.tsx
src/components/ui/carousel.tsx
src/components/ui/chart.tsx
src/components/ui/checkbox.tsx
src/components/ui/collapsible.tsx
src/components/ui/command.tsx
src/components/ui/context-menu.tsx
src/components/ui/dialog.tsx
src/components/ui/drawer.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/empty.tsx
src/components/ui/field.tsx
src/components/ui/form.tsx
src/components/ui/hover-card.tsx
src/components/ui/input-group.tsx
src/components/ui/input-otp.tsx
src/components/ui/input.tsx
src/components/ui/item.tsx
src/components/ui/kbd.tsx
src/components/ui/label.tsx
src/components/ui/menubar.tsx
src/components/ui/navigation-menu.tsx
src/components/ui/pagination.tsx
src/components/ui/popover.tsx
src/components/ui/progress.tsx
src/components/ui/radio-group.tsx
src/components/ui/resizable.tsx
src/components/ui/scroll-area.tsx
src/components/ui/select.tsx
src/components/ui/separator.tsx
src/components/ui/sheet.tsx
src/components/ui/sidebar.tsx
src/components/ui/skeleton.tsx
src/components/ui/slider.tsx
src/components/ui/sonner.tsx
src/components/ui/spinner.tsx
src/components/ui/switch.tsx
src/components/ui/table.tsx
src/components/ui/tabs.tsx
src/components/ui/textarea.tsx
src/components/ui/toaster.tsx
src/components/ui/toast.tsx
src/components/ui/toggle-group.tsx
src/components/ui/toggle.tsx
src/components/ui/tooltip.tsx
src/data/demo.ts
src/hooks/use-mobile.tsx
src/hooks/use-toast.ts
src/index.css
src/lib/utils.ts
src/main.tsx
src/pages/catalog.tsx
src/pages/customers.tsx
src/pages/dashboard.tsx
src/pages/not-found.tsx
src/pages/operations.tsx
src/pages/staff.tsx
src/services/catalog-service.ts
src/services/customer.service.ts
src/services/demo-service.ts
src/services/expense.service.ts
src/services/operations.service.ts
src/services/package.service.ts
src/services/seed.service.ts
src/services/staff.service.ts
src/services/supabase.ts
src/types/domain.ts

============================================================
PACKAGE.JSON
============================================================
{
  "name": "@workspace/mee-beauty-spa",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --config vite.config.ts --host 0.0.0.0",
    "build": "vite build --config vite.config.ts",
    "serve": "vite preview --config vite.config.ts --host 0.0.0.0",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@replit/vite-plugin-cartographer": "catalog:",
    "@replit/vite-plugin-dev-banner": "catalog:",
    "@replit/vite-plugin-runtime-error-modal": "catalog:",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "catalog:",
    "@tanstack/react-query": "catalog:",
    "@types/node": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@vitejs/plugin-react": "catalog:",
    "@workspace/api-client-react": "workspace:*",
    "class-variance-authority": "catalog:",
    "clsx": "catalog:",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "catalog:",
    "input-otp": "^1.4.2",
    "lucide-react": "catalog:",
    "next-themes": "^0.4.6",
    "react": "catalog:",
    "react-day-picker": "^9.11.1",
    "react-dom": "catalog:",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.2",
    "sonner": "^2.0.7",
    "tailwind-merge": "catalog:",
    "tailwindcss": "catalog:",
    "tw-animate-css": "^1.4.0",
    "vaul": "^1.1.2",
    "vite": "catalog:",
    "wouter": "^3.3.5",
    "zod": "catalog:"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.112.3"
  }
}

============================================================
TSCONFIG FILES
============================================================

############################################################
FILE: ./tsconfig.json
############################################################
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "noEmit": true,
    "jsx": "preserve",
    "lib": ["esnext", "dom", "dom.iterable"],
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "references": [
    {
      "path": "../../lib/api-client-react"
    }
  ]
}


############################################################
FILE: ./vite.config.ts
############################################################
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});


============================================================
SOURCE FILES
============================================================

############################################################
FILE: src/App.tsx
############################################################

import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import DashboardPage from '@/pages/dashboard';
import { CustomerProfilePage, CustomersPage } from '@/pages/customers';
import CatalogPage from '@/pages/catalog';
import { AttendancePage, BookingPage, ExpensesPage, LoyaltyPage, PackagesPage, PosPage, ReportsPage, SettingsPage, StaffPage } from '@/pages/operations';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return <AppShell><RoutedErrorBoundary><Switch>
    <Route path="/" component={DashboardPage} />
    <Route path="/dashboard" component={DashboardPage} />
    <Route path="/customers" component={CustomersPage} />
    <Route path="/customers/:id" component={CustomerProfilePage} />
    <Route path="/catalog" component={CatalogPage} />
    <Route path="/catalog/services" component={CatalogPage} />
    <Route path="/catalog/products" component={CatalogPage} />
    <Route path="/packages" component={PackagesPage} />
    <Route path="/pos" component={PosPage} />
    <Route path="/staff" component={StaffPage} />
    <Route path="/staff/commissions" component={StaffPage} />
    <Route path="/attendance" component={AttendancePage} />
    <Route path="/loyalty" component={LoyaltyPage} />
    <Route path="/reports" component={ReportsPage} />
    <Route path="/booking" component={BookingPage} />
    <Route path="/expenses" component={ExpensesPage} />
    <Route path="/settings" component={SettingsPage} />
    <Route component={NotFound} />
  </Switch></RoutedErrorBoundary></AppShell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
############################################################
END FILE: src/App.tsx
############################################################

############################################################
FILE: src/components/app-shell.tsx
############################################################

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
############################################################
END FILE: src/components/app-shell.tsx
############################################################

############################################################
FILE: src/components/error-boundary.tsx
############################################################

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

############################################################
END FILE: src/components/error-boundary.tsx
############################################################

############################################################
FILE: src/components/primitives.tsx
############################################################

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
############################################################
END FILE: src/components/primitives.tsx
############################################################

############################################################
FILE: src/components/ui/accordion.tsx
############################################################

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

############################################################
END FILE: src/components/ui/accordion.tsx
############################################################

############################################################
FILE: src/components/ui/alert-dialog.tsx
############################################################

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: 'outline' }),
      'mt-2 sm:mt-0',
      className,
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

############################################################
END FILE: src/components/ui/alert-dialog.tsx
############################################################

############################################################
FILE: src/components/ui/alert.tsx
############################################################

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };

############################################################
END FILE: src/components/ui/alert.tsx
############################################################

############################################################
FILE: src/components/ui/aspect-ratio.tsx
############################################################

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };

############################################################
END FILE: src/components/ui/aspect-ratio.tsx
############################################################

############################################################
FILE: src/components/ui/avatar.tsx
############################################################

'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

############################################################
END FILE: src/components/ui/avatar.tsx
############################################################

############################################################
FILE: src/components/ui/badge.tsx
############################################################

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  // @replit
  // Whitespace-nowrap: Badges should never wrap.
  'whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2' +
    ' hover-elevate ',
  {
    variants: {
      variant: {
        default:
          // @replit shadow-xs instead of shadow, no hover because we use hover-elevate
          'border-transparent bg-primary text-primary-foreground shadow-xs',
        secondary:
          // @replit no hover because we use hover-elevate
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          // @replit shadow-xs instead of shadow, no hover because we use hover-elevate
          'border-transparent bg-destructive text-destructive-foreground shadow-xs',
        // @replit shadow-xs" - use badge outline variable
        outline: 'text-foreground border [border-color:var(--badge-outline)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

############################################################
END FILE: src/components/ui/badge.tsx
############################################################

############################################################
FILE: src/components/ui/breadcrumb.tsx
############################################################

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
      className,
    )}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center gap-1.5', className)}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn('font-normal text-foreground', className)}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:w-3.5 [&>svg]:h-3.5', className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis';

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

############################################################
END FILE: src/components/ui/breadcrumb.tsx
############################################################

############################################################
FILE: src/components/ui/button-group.tsx
############################################################

import { Slot } from '@radix-ui/react-slot';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonGroupVariants = cva(
  "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
        vertical:
          'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
);

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      className={cn(
        "bg-muted shadow-xs flex items-center gap-2 rounded-md border px-4 text-sm font-medium [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto',
        className,
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};

############################################################
END FILE: src/components/ui/button-group.tsx
############################################################

############################################################
FILE: src/components/ui/button.tsx
############################################################

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0' +
    ' hover-elevate active-elevate-2',
  {
    variants: {
      variant: {
        default:
          // @replit: no hover, and add primary border
          'bg-primary text-primary-foreground border border-primary-border',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm border-destructive-border',
        outline:
          // @replit Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color. Uses shadow-xs. no shadow on active
          // No hover state
          ' border [border-color:var(--button-outline)] shadow-xs active:shadow-none ',
        secondary:
          // @replit border, no hover, no shadow, secondary border.
          'border bg-secondary text-secondary-foreground border border-secondary-border ',
        // @replit no hover, transparent border
        ghost: 'border border-transparent',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        // @replit changed sizes
        default: 'min-h-9 px-4 py-2',
        sm: 'min-h-8 rounded-md px-3 text-xs',
        lg: 'min-h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

############################################################
END FILE: src/components/ui/button.tsx
############################################################

############################################################
FILE: src/components/ui/calendar.tsx
############################################################

'use client';

import * as React from 'react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn(
          'relative flex flex-col gap-4 md:flex-row',
          defaultClassNames.months,
        ),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          'bg-popover absolute inset-0 opacity-0',
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          'select-none font-medium',
          captionLayout === 'label'
            ? 'text-sm'
            : '[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5',
          defaultClassNames.caption_label,
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal',
          defaultClassNames.weekday,
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn(
          'w-[--cell-size] select-none',
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          'text-muted-foreground select-none text-[0.8rem]',
          defaultClassNames.week_number,
        ),
        day: cn(
          'group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
          defaultClassNames.day,
        ),
        range_start: cn(
          'bg-accent rounded-l-md',
          defaultClassNames.range_start,
        ),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('bg-accent rounded-r-md', defaultClassNames.range_end),
        today: cn(
          'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none',
          defaultClassNames.today,
        ),
        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside,
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled,
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('size-4', className)} {...props} />
            );
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-4', className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn('size-4', className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };

############################################################
END FILE: src/components/ui/calendar.tsx
############################################################

############################################################
FILE: src/components/ui/card.tsx
############################################################

import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border bg-card text-card-foreground shadow',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

############################################################
END FILE: src/components/ui/card.tsx
############################################################

############################################################
FILE: src/components/ui/carousel.tsx
############################################################

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = 'horizontal',
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins,
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on('reInit', onSelect);
      api.on('select', onSelect);

      return () => {
        api?.off('select', onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative', className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = 'Carousel';

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className,
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute  h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-left-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-right-12 top-1/2 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = 'CarouselNext';

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};

############################################################
END FILE: src/components/ui/carousel.tsx
############################################################

############################################################
FILE: src/components/ui/chart.tsx
############################################################

import * as React from 'react';
import { cn } from '@/lib/utils';
import * as RechartsPrimitive from 'recharts';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >['children'];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<'div'> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: 'line' | 'dot' | 'dashed';
      nameKey?: string;
      labelKey?: string;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || 'value'}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === 'string'
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn('font-medium', labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn('font-medium', labelClassName)}>{value}</div>;
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== 'dot';

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload
            .filter((item) => item.type !== 'none')
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || 'value'}`;
              const itemConfig = getPayloadConfigFromPayload(config, item, key);
              const indicatorColor = color || item.payload.fill || item.color;

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                    indicator === 'dot' && 'items-center',
                  )}
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                              {
                                'h-2.5 w-2.5': indicator === 'dot',
                                'w-1': indicator === 'line',
                                'w-0 border-[1.5px] border-dashed bg-transparent':
                                  indicator === 'dashed',
                                'my-0.5': nestLabel && indicator === 'dashed',
                              },
                            )}
                            style={
                              {
                                '--color-bg': indicatorColor,
                                '--color-border': indicatorColor,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          'flex flex-1 justify-between leading-none',
                          nestLabel ? 'items-end' : 'items-center',
                        )}
                      >
                        <div className="grid gap-1.5">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-muted-foreground">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                        {item.value && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = 'ChartTooltip';

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    Pick<RechartsPrimitive.LegendProps, 'payload' | 'verticalAlign'> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey },
    ref,
  ) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-4',
          verticalAlign === 'top' ? 'pb-3' : 'pt-3',
          className,
        )}
      >
        {payload
          .filter((item) => item.type !== 'none')
          .map((item) => {
            const key = `${nameKey || item.dataKey || 'value'}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);

            return (
              <div
                key={item.value}
                className={cn(
                  'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
                )}
              >
                {itemConfig?.icon && !hideIcon ? (
                  <itemConfig.icon />
                ) : (
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )}
                {itemConfig?.label}
              </div>
            );
          })}
      </div>
    );
  },
);
ChartLegendContent.displayName = 'ChartLegend';

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

############################################################
END FILE: src/components/ui/chart.tsx
############################################################

############################################################
FILE: src/components/ui/checkbox.tsx
############################################################

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('grid place-content-center text-current')}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

############################################################
END FILE: src/components/ui/checkbox.tsx
############################################################

############################################################
FILE: src/components/ui/collapsible.tsx
############################################################

'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

############################################################
END FILE: src/components/ui/collapsible.tsx
############################################################

############################################################
FILE: src/components/ui/command.tsx
############################################################

'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      className,
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

############################################################
END FILE: src/components/ui/command.tsx
############################################################

############################################################
FILE: src/components/ui/context-menu.tsx
############################################################

import * as React from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]',
      className,
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        'z-50 max-h-[--radix-context-menu-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]',
        className,
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold text-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
ContextMenuShortcut.displayName = 'ContextMenuShortcut';

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

############################################################
END FILE: src/components/ui/context-menu.tsx
############################################################

############################################################
FILE: src/components/ui/dialog.tsx
############################################################

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg max-h-[85vh] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

############################################################
END FILE: src/components/ui/dialog.tsx
############################################################

############################################################
FILE: src/components/ui/drawer.tsx
############################################################

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Drawer as DrawerPrimitive } from 'vaul';

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/80', className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)}
    {...props}
  />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mt-auto flex flex-col gap-2 p-4', className)}
    {...props}
  />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

############################################################
END FILE: src/components/ui/drawer.tsx
############################################################

############################################################
FILE: src/components/ui/dropdown-menu.tsx
############################################################

'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]',
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};

############################################################
END FILE: src/components/ui/dropdown-menu.tsx
############################################################

############################################################
FILE: src/components/ui/empty.tsx
############################################################

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg border-dashed p-6 text-center md:p-12',
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        'flex max-w-sm flex-col items-center gap-2 text-center',
        className,
      )}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-lg font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        'flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm',
        className,
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
};

############################################################
END FILE: src/components/ui/empty.tsx
############################################################

############################################################
FILE: src/components/ui/field.tsx
############################################################

'use client';

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'flex flex-col gap-6',
        'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        'mb-3 font-medium',
        'data-[variant=legend]:text-base',
        'data-[variant=label]:text-sm',
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva(
  'group/field data-[invalid=true]:text-destructive flex w-full gap-3',
  {
    variants: {
      orientation: {
        vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
        horizontal: [
          'flex-row items-center',
          '[&>[data-slot=field-label]]:flex-auto',
          'has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px has-[>[data-slot=field-content]]:items-start',
        ],
        responsive: [
          '@md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto flex-col [&>*]:w-full [&>.sr-only]:w-auto',
          '@md/field-group:[&>[data-slot=field-label]]:flex-auto',
          '@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
        ],
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  },
);

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        'group/field-content flex flex-1 flex-col gap-1.5 leading-snug',
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>[data-slot=field]]:p-4',
        'has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10',
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        'flex w-fit items-center gap-2 text-sm font-medium leading-snug group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-muted-foreground text-sm font-normal leading-normal group-has-[[data-orientation=horizontal]]/field:text-balance',
        'nth-last-2:-mt-1 last:mt-0 [[data-variant=legend]+&]:-mt-1.5',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        'relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2',
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors) {
      return null;
    }

    if (errors?.length === 1 && errors[0]?.message) {
      return errors[0].message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {errors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-destructive text-sm font-normal', className)}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};

############################################################
END FILE: src/components/ui/field.tsx
############################################################

############################################################
FILE: src/components/ui/form.tsx
############################################################

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  if (!itemContext) {
    throw new Error('useFormField should be used within <FormItem>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-[0.8rem] text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-[0.8rem] font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};

############################################################
END FILE: src/components/ui/form.tsx
############################################################

############################################################
FILE: src/components/ui/hover-card.tsx
############################################################

import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cn } from '@/lib/utils';

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      'z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-hover-card-content-transform-origin]',
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };

############################################################
END FILE: src/components/ui/hover-card.tsx
############################################################

############################################################
FILE: src/components/ui/input-group.tsx
############################################################

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]',
        'h-9 has-[>textarea]:h-auto',

        // Variants based on alignment.
        'has-[>[data-align=inline-start]]:[&>input]:pl-2',
        'has-[>[data-align=inline-end]]:[&>input]:pr-2',
        'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
        'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',

        // Focus state.
        'has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1',

        // Error state.
        'has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40',

        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        'inline-start':
          'order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]',
        'inline-end':
          'order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]',
        'block-start':
          '[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5',
        'block-end':
          '[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  'flex items-center gap-2 text-sm shadow-none',
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: 'h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5',
        'icon-xs':
          'size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0',
        'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
);

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};

############################################################
END FILE: src/components/ui/input-group.tsx
############################################################

############################################################
FILE: src/components/ui/input-otp.tsx
############################################################

import * as React from 'react';
import { cn } from '@/lib/utils';
import { OTPInput, OTPInputContext } from 'input-otp';
import { Minus } from 'lucide-react';

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-2 has-[:disabled]:opacity-50',
      containerClassName,
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
));
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'z-10 ring-1 ring-ring',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus />
  </div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

############################################################
END FILE: src/components/ui/input-otp.tsx
############################################################

############################################################
FILE: src/components/ui/input.tsx
############################################################

import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };

############################################################
END FILE: src/components/ui/input.tsx
############################################################

############################################################
FILE: src/components/ui/item.tsx
############################################################

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

function ItemGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn('group/item-group flex flex-col', className)}
      {...props}
    />
  );
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn('my-0', className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  'group/item [a]:hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 [a]:transition-colors flex flex-wrap items-center rounded-md border border-transparent text-sm outline-none transition-colors duration-100 focus-visible:ring-[3px]',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border-border',
        muted: 'bg-muted/50',
      },
      size: {
        default: 'gap-4 p-4 ',
        sm: 'gap-2.5 px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Item({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  );
}

const itemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted size-8 rounded-sm border [&_svg:not([class*='size-'])]:size-4",
        image:
          'size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function ItemMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        'flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none',
        className,
      )}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        'flex w-fit items-center gap-2 text-sm font-medium leading-snug',
        className,
      )}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        'text-muted-foreground line-clamp-2 text-balance text-sm font-normal leading-normal',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-actions"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  );
}

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className,
      )}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className,
      )}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
};

############################################################
END FILE: src/components/ui/item.tsx
############################################################

############################################################
FILE: src/components/ui/kbd.tsx
############################################################

import { cn } from '@/lib/utils';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium',
        "[&_svg:not([class*='size-'])]:size-3",
        '[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10',
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };

############################################################
END FILE: src/components/ui/kbd.tsx
############################################################

############################################################
FILE: src/components/ui/label.tsx
############################################################

'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

############################################################
END FILE: src/components/ui/label.tsx
############################################################

############################################################
FILE: src/components/ui/menubar.tsx
############################################################

import * as React from 'react';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup {...props} />;
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      'flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm',
      className,
    )}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-menubar-content-transform-origin]',
      className,
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = 'start', alignOffset = -4, sideOffset = 8, ...props },
    ref,
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-menubar-content-transform-origin]',
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  ),
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
MenubarShortcut.displayname = 'MenubarShortcut';

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};

############################################################
END FILE: src/components/ui/menubar.tsx
############################################################

############################################################
FILE: src/components/ui/navigation-menu.tsx
############################################################

import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      'relative z-10 flex max-w-max flex-1 items-center justify-center',
      className,
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      'group flex flex-1 list-none items-center justify-center space-x-1',
      className,
    )}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent',
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), 'group', className)}
    {...props}
  >
    {children}{' '}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      'left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ',
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn('absolute left-0 top-full flex justify-center')}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        'origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in',
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};

############################################################
END FILE: src/components/ui/navigation-menu.tsx
############################################################

############################################################
FILE: src/components/ui/pagination.tsx
############################################################

import * as React from 'react';
import { ButtonProps, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

############################################################
END FILE: src/components/ui/pagination.tsx
############################################################

############################################################
FILE: src/components/ui/popover.tsx
############################################################

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

############################################################
END FILE: src/components/ui/popover.tsx
############################################################

############################################################
FILE: src/components/ui/progress.tsx
############################################################

'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

############################################################
END FILE: src/components/ui/progress.tsx
############################################################

############################################################
FILE: src/components/ui/radio-group.tsx
############################################################

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

############################################################
END FILE: src/components/ui/radio-group.tsx
############################################################

############################################################
FILE: src/components/ui/resizable.tsx
############################################################

'use client';

import * as ResizablePrimitive from 'react-resizable-panels';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
      className,
    )}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

############################################################
END FILE: src/components/ui/resizable.tsx
############################################################

############################################################
FILE: src/components/ui/scroll-area.tsx
############################################################

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };

############################################################
END FILE: src/components/ui/scroll-area.tsx
############################################################

############################################################
FILE: src/components/ui/select.tsx
############################################################

'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

############################################################
END FILE: src/components/ui/select.tsx
############################################################

############################################################
FILE: src/components/ui/separator.tsx
############################################################

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };

############################################################
END FILE: src/components/ui/separator.tsx
############################################################

############################################################
FILE: src/components/ui/sheet.tsx
############################################################

'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

############################################################
END FILE: src/components/ui/sheet.tsx
############################################################

############################################################
FILE: src/components/ui/sidebar.tsx
############################################################

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import { PanelLeftIcon } from 'lucide-react';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0 [&>button]:hidden"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          'relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--spacing-4))]'
            : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]',
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          // Adjust the padding for floating and inset variants.
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--spacing-4)+2px)]'
            : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l',
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar();

  // Note: Tailwind v3.4 doesn't support "in-" selectors. So the rail won't work perfectly.
  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        'hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex',
        'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'bg-background relative flex w-full flex-1 flex-col',
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn('bg-background h-8 w-full shadow-none', className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('bg-sidebar-border mx-2 w-auto', className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        'text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn('w-full text-sm', className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:w-8! group-data-[collapsible=icon]:h-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : 'button';
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        'text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none',
        'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<'div'> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-[var(--skeleton-width)] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn('group/menu-sub-item relative', className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
  size?: 'sm' | 'md';
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline outline-2 outline-transparent outline-offset-2 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

############################################################
END FILE: src/components/ui/sidebar.tsx
############################################################

############################################################
FILE: src/components/ui/skeleton.tsx
############################################################

import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-primary/10', className)}
      {...props}
    />
  );
}

export { Skeleton };

############################################################
END FILE: src/components/ui/skeleton.tsx
############################################################

############################################################
FILE: src/components/ui/slider.tsx
############################################################

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

############################################################
END FILE: src/components/ui/slider.tsx
############################################################

############################################################
FILE: src/components/ui/sonner.tsx
############################################################

'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

############################################################
END FILE: src/components/ui/sonner.tsx
############################################################

############################################################
FILE: src/components/ui/spinner.tsx
############################################################

import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };

############################################################
END FILE: src/components/ui/spinner.tsx
############################################################

############################################################
FILE: src/components/ui/switch.tsx
############################################################

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

############################################################
END FILE: src/components/ui/switch.tsx
############################################################

############################################################
FILE: src/components/ui/table.tsx
############################################################

import * as React from 'react';
import { cn } from '@/lib/utils';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

############################################################
END FILE: src/components/ui/table.tsx
############################################################

############################################################
FILE: src/components/ui/tabs.tsx
############################################################

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };

############################################################
END FILE: src/components/ui/tabs.tsx
############################################################

############################################################
FILE: src/components/ui/textarea.tsx
############################################################

import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };

############################################################
END FILE: src/components/ui/textarea.tsx
############################################################

############################################################
FILE: src/components/ui/toaster.tsx
############################################################

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

############################################################
END FILE: src/components/ui/toaster.tsx
############################################################

############################################################
FILE: src/components/ui/toast.tsx
############################################################

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};

############################################################
END FILE: src/components/ui/toast.tsx
############################################################

############################################################
FILE: src/components/ui/toggle-group.tsx
############################################################

'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { toggleVariants } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { type VariantProps } from 'class-variance-authority';

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: 'default',
  variant: 'default',
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn('flex items-center justify-center gap-1', className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };

############################################################
END FILE: src/components/ui/toggle-group.tsx
############################################################

############################################################
FILE: src/components/ui/toggle.tsx
############################################################

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-2 min-w-9',
        sm: 'h-8 px-1.5 min-w-8',
        lg: 'h-10 px-2.5 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };

############################################################
END FILE: src/components/ui/toggle.tsx
############################################################

############################################################
FILE: src/components/ui/tooltip.tsx
############################################################

'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

############################################################
END FILE: src/components/ui/tooltip.tsx
############################################################

############################################################
FILE: src/data/demo.ts
############################################################

import type { Branch, CatalogItem, Customer, Expense, PackageTemplate, Staff } from '@/types/domain';

export const demoOrganization = { id: 'org-mee', name: 'MEE BEAUTY SPA', phone: '028 7300 6868', defaultCurrency: 'VND' as const };
export const demoBranch: Branch = { id: 'branch-q1', organizationId: 'org-mee', name: 'MEE · Quận 1', address: '42 Nguyễn Huệ, Bến Nghé, Quận 1, TP. HCM', phone: '028 7300 6868', timezone: 'Asia/Ho_Chi_Minh' };

export const demoCustomers: Customer[] = [
  { id: 'cus-001', fullName: 'Nguyễn Minh Anh', phone: '090 324 7816', email: 'minhanh.nguyen@example.vn', birthday: '1994-09-14', gender: 'Nữ', joinedAt: '2023-06-18', lastVisit: '2024-06-28', visitCount: 18, totalSpend: 14850000, loyaltyPoints: 1280, tags: ['Thân thiết', 'Da nhạy cảm'], note: 'Ưu tiên sản phẩm không hương liệu.' },
  { id: 'cus-002', fullName: 'Trần Ngọc Mai', phone: '091 824 0963', gender: 'Nữ', joinedAt: '2024-01-10', lastVisit: '2024-06-30', visitCount: 7, totalSpend: 6240000, loyaltyPoints: 540, tags: ['Mới quay lại'] },
  { id: 'cus-003', fullName: 'Phạm Gia Hân', phone: '093 117 4820', gender: 'Nữ', joinedAt: '2023-10-04', lastVisit: '2024-06-26', visitCount: 12, totalSpend: 9320000, loyaltyPoints: 860, tags: ['VIP'] },
  { id: 'cus-004', fullName: 'Lê Hoàng Nam', phone: '098 441 2207', gender: 'Nam', joinedAt: '2024-03-21', lastVisit: '2024-06-21', visitCount: 4, totalSpend: 3180000, loyaltyPoints: 270, tags: ['Chăm sóc da'] },
  { id: 'cus-005', fullName: 'Võ Khánh Linh', phone: '090 682 1134', gender: 'Nữ', joinedAt: '2024-05-02', lastVisit: '2024-06-29', visitCount: 3, totalSpend: 1870000, loyaltyPoints: 140, tags: ['Da dầu'] },
];

export const demoCatalog: CatalogItem[] = [
  { id: 'svc-001', organizationId: 'org-mee', name: 'Chăm sóc da chuyên sâu', kind: 'service', category: 'Facial', price: 680000, durationMinutes: 75, active: true, description: 'Làm sạch, cấp ẩm và phục hồi hàng rào da.' },
  { id: 'svc-002', organizationId: 'org-mee', name: 'Massage trị liệu cổ vai gáy', kind: 'service', category: 'Body', price: 520000, durationMinutes: 60, active: true, description: 'Thư giãn sâu với tinh dầu tràm.' },
  { id: 'svc-003', organizationId: 'org-mee', name: 'Gội đầu dưỡng sinh', kind: 'service', category: 'Wellness', price: 390000, durationMinutes: 45, active: true, description: 'Liệu trình làm sạch nhẹ và ấn huyệt đầu.' },
  { id: 'svc-004', organizationId: 'org-mee', name: 'Điều trị mụn cơ bản', kind: 'service', category: 'Treatment', price: 850000, durationMinutes: 90, active: true, description: 'Phác đồ làm dịu và hỗ trợ giảm viêm.' },
  { id: 'prd-001', organizationId: 'org-mee', name: 'Tinh chất phục hồi MEE', kind: 'product', category: 'Skincare', price: 790000, stock: 18, unit: 'chai', active: true, description: '30ml · Panthenol 5% và B5.' },
  { id: 'prd-002', organizationId: 'org-mee', name: 'Kem chống nắng Daily Veil', kind: 'product', category: 'Skincare', price: 420000, stock: 31, unit: 'tuýp', active: true, description: '50ml · SPF 50 PA++++.' },
  { id: 'prd-003', organizationId: 'org-mee', name: 'Dầu massage hoa trà', kind: 'product', category: 'Body care', price: 560000, stock: 9, unit: 'chai', active: true, description: '100ml · Dùng cho da nhạy cảm.' },
  { id: 'prd-004', organizationId: 'org-mee', name: 'Mặt nạ ngủ cấp ẩm', kind: 'product', category: 'Skincare', price: 350000, stock: 4, unit: 'hũ', active: true, description: '60g · Kết cấu gel mỏng nhẹ.' },
];

export const demoPackages: PackageTemplate[] = [
  { id: 'pkg-001', name: 'MEE Reset · 05 buổi', description: 'Gội đầu dưỡng sinh và massage cổ vai gáy', price: 4200000, validityDays: 90, items: [{ catalogItemId: 'svc-003', quantity: 5 }, { catalogItemId: 'svc-002', quantity: 2 }], active: true },
  { id: 'pkg-002', name: 'Da khoẻ mỗi ngày', description: 'Liệu trình làm sạch và phục hồi theo tháng', price: 5800000, validityDays: 120, items: [{ catalogItemId: 'svc-001', quantity: 4 }, { catalogItemId: 'svc-004', quantity: 2 }], active: true },
  { id: 'pkg-003', name: 'MEE Ritual · 10 buổi', description: 'Chăm sóc body và facial cho lịch trình bận rộn', price: 9600000, validityDays: 180, items: [{ catalogItemId: 'svc-001', quantity: 5 }, { catalogItemId: 'svc-002', quantity: 5 }], active: true },
];

export const demoStaff: Staff[] = [
  { id: 'stf-001', fullName: 'Đỗ Thu Hà', role: 'Quản lý chi nhánh', phone: '090 881 2290', branchId: 'branch-q1', status: 'Đang làm việc', startDate: '2022-08-15', commissionRate: 8 },
  { id: 'stf-002', fullName: 'Nguyễn Thảo Vy', role: 'Kỹ thuật viên', phone: '093 682 5517', branchId: 'branch-q1', status: 'Đang làm việc', startDate: '2023-03-10', commissionRate: 6 },
  { id: 'stf-003', fullName: 'Bùi Thanh Trúc', role: 'Kỹ thuật viên', phone: '097 411 8824', branchId: 'branch-q1', status: 'Đang làm việc', startDate: '2023-11-02', commissionRate: 6 },
  { id: 'stf-004', fullName: 'Lâm Mỹ Duyên', role: 'Lễ tân', phone: '090 511 3308', branchId: 'branch-q1', status: 'Tạm nghỉ', startDate: '2024-02-19', commissionRate: 2 },
];

export const demoExpenses: Expense[] = [
  { id: 'exp-001', category: 'Vật tư tiêu hao', description: 'Bông tẩy trang và khăn hấp', amount: 1260000, date: '2024-06-30', status: 'Đã ghi nhận' },
  { id: 'exp-002', category: 'Vận hành', description: 'Bảo trì máy lạnh tầng 2', amount: 850000, date: '2024-06-28', status: 'Chờ duyệt' },
  { id: 'exp-003', category: 'Hàng hoá', description: 'Nhập tinh chất phục hồi MEE', amount: 4740000, date: '2024-06-26', status: 'Đã ghi nhận' },
];

export const formatVnd = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
export const initials = (name: string) => name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase();
export const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
############################################################
END FILE: src/data/demo.ts
############################################################

############################################################
FILE: src/hooks/use-mobile.tsx
############################################################

import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}

############################################################
END FILE: src/hooks/use-mobile.tsx
############################################################

############################################################
FILE: src/hooks/use-toast.ts
############################################################

import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, 'id'>;

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };

############################################################
END FILE: src/hooks/use-toast.ts
############################################################

############################################################
FILE: src/index.css
############################################################

@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600&display=swap');
@import 'tailwindcss';
@import 'tw-animate-css';
@plugin "@tailwindcss/typography";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-card-border: hsl(var(--card-border));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-popover-border: hsl(var(--popover-border));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-sidebar: hsl(var(--sidebar));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --font-sans: var(--app-font-sans);
  --font-serif: var(--app-font-serif);
  --font-mono: var(--app-font-mono);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --background: 35 30% 96%;
  --foreground: 158 27% 18%;
  --border: 36 20% 87%;
  --input: 36 20% 82%;
  --ring: 161 34% 42%;
  --card: 38 33% 99%;
  --card-foreground: 158 27% 18%;
  --card-border: 36 24% 88%;
  --popover: 38 33% 99%;
  --popover-foreground: 158 27% 18%;
  --popover-border: 36 24% 88%;
  --primary: 161 34% 33%;
  --primary-foreground: 38 33% 98%;
  --secondary: 37 30% 91%;
  --secondary-foreground: 159 26% 22%;
  --muted: 37 23% 92%;
  --muted-foreground: 158 12% 48%;
  --accent: 14 53% 69%;
  --accent-foreground: 16 37% 24%;
  --destructive: 4 61% 52%;
  --destructive-foreground: 38 33% 98%;
  --sidebar: 160 32% 20%;
  --sidebar-foreground: 39 34% 92%;
  --sidebar-border: 160 25% 29%;
  --sidebar-primary: 14 53% 69%;
  --sidebar-primary-foreground: 16 37% 22%;
  --sidebar-accent: 160 25% 27%;
  --sidebar-accent-foreground: 39 34% 96%;
  --app-font-sans: 'Manrope', sans-serif;
  --app-font-serif: 'Playfair Display', Georgia, serif;
  --app-font-mono: 'DM Mono', monospace;
  --radius: 0.9rem;
  --shadow-soft: 0 10px 35px rgba(48, 72, 61, 0.08);
  --shadow-float: 0 20px 60px rgba(48, 72, 61, 0.14);
}

.dark {
  --background: 163 21% 12%;
  --foreground: 38 25% 92%;
  --border: 160 16% 25%;
  --input: 160 16% 28%;
  --ring: 14 53% 69%;
  --card: 160 20% 16%;
  --card-foreground: 38 25% 92%;
  --card-border: 160 16% 26%;
  --popover: 160 20% 16%;
  --popover-foreground: 38 25% 92%;
  --popover-border: 160 16% 26%;
  --primary: 14 53% 69%;
  --primary-foreground: 16 37% 17%;
  --secondary: 160 18% 23%;
  --secondary-foreground: 38 25% 92%;
  --muted: 160 16% 23%;
  --muted-foreground: 38 13% 66%;
  --accent: 161 34% 45%;
  --accent-foreground: 38 25% 95%;
  --destructive: 4 61% 60%;
  --destructive-foreground: 38 25% 96%;
  --sidebar: 160 25% 9%;
  --sidebar-foreground: 38 25% 92%;
  --sidebar-border: 160 16% 20%;
  --sidebar-primary: 14 53% 69%;
  --sidebar-primary-foreground: 16 37% 17%;
  --sidebar-accent: 160 18% 18%;
  --sidebar-accent-foreground: 38 25% 92%;
}

@layer base {
  * { @apply border-border; }
  body { @apply font-sans antialiased bg-background text-foreground; margin: 0; }
  button, input, select, textarea { font: inherit; }
  button { cursor: pointer; }
  ::selection { background: hsl(var(--accent) / .35); }
}

@layer utilities {
  .font-display { font-family: var(--app-font-serif); }
  .font-mono-app { font-family: var(--app-font-mono); }
  .app-noise::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: .035;
    z-index: 50;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
  }
}

.app-shell { min-height: 100dvh; display: flex; }
.sidebar { width: 248px; flex: 0 0 248px; background: hsl(var(--sidebar)); color: hsl(var(--sidebar-foreground)); padding: 24px 14px; display: flex; flex-direction: column; }
.brand-mark { width: 36px; height: 36px; display: grid; place-items: center; background: hsl(var(--sidebar-primary)); color: hsl(var(--sidebar-primary-foreground)); border-radius: 11px 11px 11px 4px; font-family: var(--app-font-serif); font-size: 22px; }
.nav-label { padding: 0 12px; margin: 24px 0 8px; font-size: 10px; text-transform: uppercase; letter-spacing: .14em; color: hsl(var(--sidebar-foreground) / .47); font-weight: 800; }
.nav-item { display: flex; align-items: center; gap: 11px; min-height: 40px; padding: 0 12px; color: hsl(var(--sidebar-foreground) / .72); font-size: 13px; border-radius: 10px; transition: background .2s, color .2s, transform .2s; text-decoration: none; }
.nav-item:hover { background: hsl(var(--sidebar-accent)); color: hsl(var(--sidebar-accent-foreground)); transform: translateX(2px); }
.nav-item.active { background: hsl(var(--sidebar-accent)); color: hsl(var(--sidebar-primary)); font-weight: 800; }
.main-area { flex: 1; min-width: 0; background: hsl(var(--background)); }
.topbar { height: 76px; padding: 0 34px; border-bottom: 1px solid hsl(var(--border)); display: flex; align-items: center; justify-content: space-between; background: hsl(var(--background) / .88); backdrop-filter: blur(16px); position: sticky; top: 0; z-index: 20; }
.page-wrap { max-width: 1440px; margin: 0 auto; padding: 30px 34px 60px; }
.page-kicker { color: hsl(var(--primary)); font-family: var(--app-font-mono); text-transform: uppercase; font-size: 10px; letter-spacing: .14em; font-weight: 500; }
.page-title { font-size: clamp(26px, 3vw, 36px); letter-spacing: -.045em; line-height: 1.08; font-weight: 800; margin: 5px 0 0; }
.page-subtitle { color: hsl(var(--muted-foreground)); font-size: 13px; margin-top: 8px; }
.panel { background: hsl(var(--card)); border: 1px solid hsl(var(--card-border)); border-radius: 16px; box-shadow: var(--shadow-soft); }
.panel-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 19px 20px; border-bottom: 1px solid hsl(var(--border)); }
.panel-title { font-size: 14px; font-weight: 800; letter-spacing: -.02em; }
.panel-caption { color: hsl(var(--muted-foreground)); font-size: 12px; margin-top: 3px; }
.btn { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 10px; padding: 0 14px; border: 1px solid transparent; font-size: 12px; font-weight: 800; transition: transform .2s, background .2s, border-color .2s; }
.btn:hover { transform: translateY(-1px); }
.btn-primary { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
.btn-primary:hover { background: hsl(var(--primary) / .88); }
.btn-soft { background: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); border-color: hsl(var(--border)); }
.btn-ghost { background: transparent; color: hsl(var(--muted-foreground)); }
.btn-ghost:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.btn-danger { background: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); }
.input { width: 100%; height: 40px; border: 1px solid hsl(var(--input)); border-radius: 9px; padding: 0 12px; background: hsl(var(--card)); color: hsl(var(--foreground)); outline: none; font-size: 13px; }
.input:focus { border-color: hsl(var(--ring)); box-shadow: 0 0 0 3px hsl(var(--ring) / .12); }
.label { display: block; color: hsl(var(--muted-foreground)); font-size: 11px; font-weight: 800; margin-bottom: 7px; }
.tag { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 99px; background: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); font-size: 10px; font-weight: 800; }
.tag-coral { background: hsl(var(--accent) / .26); color: hsl(var(--accent-foreground)); }
.tag-green { background: hsl(var(--primary) / .13); color: hsl(var(--primary)); }
.tag-ink { background: hsl(var(--foreground) / .08); color: hsl(var(--foreground)); }
.metric-card { padding: 18px 20px; min-height: 130px; position: relative; overflow: hidden; }
.metric-card::after { content: ''; position: absolute; width: 90px; height: 90px; border-radius: 50%; right: -28px; bottom: -38px; background: hsl(var(--accent) / .16); }
.metric-label { color: hsl(var(--muted-foreground)); font-size: 11px; font-weight: 800; }
.metric-value { font-family: var(--app-font-mono); font-size: 25px; letter-spacing: -.06em; margin-top: 12px; }
.metric-note { font-size: 11px; color: hsl(var(--primary)); margin-top: 7px; font-weight: 700; }
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; min-width: 650px; border-collapse: collapse; font-size: 12px; }
.data-table th { padding: 12px 20px; text-align: left; color: hsl(var(--muted-foreground)); font-size: 10px; text-transform: uppercase; letter-spacing: .1em; font-weight: 800; background: hsl(var(--muted) / .5); }
.data-table td { padding: 15px 20px; border-top: 1px solid hsl(var(--border)); vertical-align: middle; }
.data-table tbody tr { transition: background .2s; }
.data-table tbody tr:hover { background: hsl(var(--muted) / .55); }
.avatar { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 11px; background: hsl(var(--accent) / .28); color: hsl(var(--accent-foreground)); font-weight: 800; font-size: 11px; }
.avatar.small { width: 28px; height: 28px; border-radius: 9px; font-size: 10px; }
.progress-track { height: 7px; overflow: hidden; border-radius: 99px; background: hsl(var(--secondary)); }
.progress-fill { height: 100%; border-radius: inherit; background: hsl(var(--primary)); }
.skeleton { background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--card)) 50%, hsl(var(--muted)) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
.empty-state { display: grid; place-items: center; text-align: center; padding: 52px 24px; }
.empty-icon { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 15px; background: hsl(var(--secondary)); color: hsl(var(--primary)); margin: 0 auto 14px; }
.bottom-nav { display: none; }
.mobile-only { display: none; }
.modal-backdrop { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 20px; background: hsl(160 28% 12% / .44); backdrop-filter: blur(6px); }
.modal { width: min(520px, 100%); max-height: calc(100dvh - 40px); overflow: auto; background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 18px; box-shadow: var(--shadow-float); animation: modal-in .22s ease-out; }
.toast-inline { position: fixed; right: 22px; bottom: 22px; z-index: 70; padding: 12px 15px; border-radius: 11px; color: hsl(var(--primary-foreground)); background: hsl(var(--primary)); font-size: 12px; font-weight: 800; box-shadow: var(--shadow-float); animation: toast-in .25s ease-out; }
.hero-dashboard { padding: 26px; border-radius: 18px; color: hsl(var(--primary-foreground)); background: linear-gradient(112deg, hsl(var(--primary)) 0%, hsl(160 29% 39%) 56%, hsl(14 41% 58%) 130%); position: relative; overflow: hidden; }
.hero-dashboard::after { content: ''; position: absolute; width: 240px; height: 240px; right: 4%; top: -115px; border: 1px solid hsl(var(--primary-foreground) / .18); border-radius: 50%; box-shadow: 0 0 0 28px hsl(var(--primary-foreground) / .04), 0 0 0 56px hsl(var(--primary-foreground) / .04); }
.hero-dashboard > * { position: relative; z-index: 1; }
.quick-action { min-height: 82px; display: flex; flex-direction: column; justify-content: space-between; padding: 14px; border: 1px solid hsl(var(--border)); border-radius: 13px; background: hsl(var(--card)); transition: transform .2s, border-color .2s; }
.quick-action:hover { transform: translateY(-2px); border-color: hsl(var(--primary) / .5); }
.quick-action svg { color: hsl(var(--primary)); }
.section-grid { display: grid; gap: 18px; }
.two-col { grid-template-columns: minmax(0, 1.45fr) minmax(290px, .85fr); }
.three-col { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.catalog-card { padding: 19px; min-height: 174px; position: relative; transition: transform .2s, box-shadow .2s; }
.catalog-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-float); }
.catalog-orb { width: 40px; height: 40px; border-radius: 14px 14px 14px 4px; display: grid; place-items: center; background: hsl(var(--accent) / .22); color: hsl(var(--accent-foreground)); }
.tab-bar { display: flex; gap: 5px; border-bottom: 1px solid hsl(var(--border)); }
.tab { padding: 11px 13px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: hsl(var(--muted-foreground)); font-size: 12px; font-weight: 800; }
.tab.active { border-color: hsl(var(--primary)); color: hsl(var(--primary)); }
.timeline-item { display: flex; gap: 13px; padding: 13px 20px; border-top: 1px solid hsl(var(--border)); }
.timeline-dot { flex: 0 0 9px; width: 9px; height: 9px; margin-top: 5px; border-radius: 50%; background: hsl(var(--accent)); box-shadow: 0 0 0 4px hsl(var(--accent) / .13); }
.notice { display: flex; gap: 10px; padding: 13px 15px; border: 1px solid hsl(var(--accent) / .35); background: hsl(var(--accent) / .1); border-radius: 11px; color: hsl(var(--accent-foreground)); font-size: 12px; }
.switch { width: 40px; height: 23px; padding: 3px; border-radius: 99px; border: 0; background: hsl(var(--muted-foreground) / .28); }
.switch[data-on='true'] { background: hsl(var(--primary)); }
.switch span { display: block; width: 17px; height: 17px; border-radius: 50%; background: hsl(var(--card)); transition: transform .2s; }
.switch[data-on='true'] span { transform: translateX(17px); }
@keyframes shimmer { to { background-position: -200% 0; } }
@keyframes modal-in { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 900px) {
  .sidebar { width: 72px; flex-basis: 72px; padding: 19px 10px; align-items: center; }
  .sidebar .brand-copy, .sidebar .nav-label, .sidebar .nav-item span, .sidebar .branch-copy, .sidebar .sidebar-footer-copy { display: none; }
  .nav-item { width: 46px; justify-content: center; padding: 0; }
  .two-col, .three-col { grid-template-columns: 1fr; }
}
@media (max-width: 680px) {
  .app-shell { display: block; }
  .sidebar { display: none; }
  .sidebar.mobile-drawer-open { display: flex; position: fixed; inset: 0 auto 0 0; z-index: 50; width: 248px; flex-basis: 248px; align-items: stretch; padding: 24px 14px; box-shadow: var(--shadow-float); }
  .sidebar.mobile-drawer-open .brand-copy, .sidebar.mobile-drawer-open .nav-label, .sidebar.mobile-drawer-open .nav-item span, .sidebar.mobile-drawer-open .branch-copy, .sidebar.mobile-drawer-open .sidebar-footer-copy { display: block; }
  .sidebar.mobile-drawer-open .nav-item { width: auto; justify-content: flex-start; padding: 0 12px; }
  .sidebar.mobile-drawer-open .mobile-only { display: inline-flex; }
  .topbar { height: 64px; padding: 0 17px; }
  .mobile-only { display: inline-flex; }
  .page-wrap { padding: 22px 16px 90px; }
  .page-title { font-size: 27px; }
  .hide-mobile { display: none !important; }
  .bottom-nav { position: fixed; display: grid; grid-template-columns: repeat(5, 1fr); bottom: 0; left: 0; right: 0; z-index: 30; padding: 8px 8px calc(8px + env(safe-area-inset-bottom)); background: hsl(var(--card) / .94); backdrop-filter: blur(16px); border-top: 1px solid hsl(var(--border)); }
  .bottom-nav a { display: flex; flex-direction: column; align-items: center; gap: 4px; color: hsl(var(--muted-foreground)); text-decoration: none; font-size: 9px; font-weight: 800; }
  .bottom-nav a.active { color: hsl(var(--primary)); }
  .metric-card { min-height: 112px; }
  .hero-dashboard { padding: 21px; }
  .panel-header { align-items: flex-start; flex-wrap: wrap; }
  .data-table { min-width: 590px; }
}
############################################################
END FILE: src/index.css
############################################################

############################################################
FILE: src/lib/utils.ts
############################################################

import { twMerge } from 'tailwind-merge';

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

############################################################
END FILE: src/lib/utils.ts
############################################################

############################################################
FILE: src/main.tsx
############################################################

import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

############################################################
END FILE: src/main.tsx
############################################################

############################################################
FILE: src/pages/catalog.tsx
############################################################

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchServices,
  fetchProducts,
  toggleCatalogItemStatus,
} from "../services/catalog-service";
import { ServiceItemDomain, ProductItemDomain } from "../types/domain";

export const CatalogPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"SERVICES" | "PRODUCTS">(
    "SERVICES",
  );
  const [services, setServices] = useState<ServiceItemDomain[]>([]);
  const [products, setProducts] = useState<ProductItemDomain[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (activeTab === "SERVICES") {
        const data = await fetchServices(search);
        setServices(data);
      } else {
        const data = await fetchProducts(search);
        setProducts(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi tải dữ liệu từ Supabase");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleStatus = async (
    id: string,
    currentStatus: "active" | "inactive",
  ) => {
    try {
      const nextStatus = currentStatus === "active" ? "inactive" : "active";
      await toggleCatalogItemStatus(id, nextStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catalog Management</h1>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded ${activeTab === "SERVICES" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("SERVICES")}
          >
            Services
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "PRODUCTS" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("PRODUCTS")}
          >
            Products
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder={`Tìm kiếm ${activeTab === "SERVICES" ? "dịch vụ" : "sản phẩm"}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded"
        />
      </div>

      {errorMessage && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded border border-red-300">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p>Đang tải dữ liệu từ Supabase...</p>
      ) : activeTab === "SERVICES" ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-2 text-left border">Tên dịch vụ</th>
              <th className="p-2 text-left border">Danh mục</th>
              <th className="p-2 text-right border">Giá (VNĐ)</th>
              <th className="p-2 text-right border">Thời lượng (phút)</th>
              <th className="p-2 text-center border">Trạng thái</th>
              <th className="p-2 text-center border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {services.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.category}</td>
                <td className="p-2 border text-right">
                  {item.price.toLocaleString()}
                </td>
                <td className="p-2 border text-right">
                  {item.service_details.duration_minutes}
                </td>
                <td className="p-2 border text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${item.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="text-sm text-blue-600 underline"
                  >
                    Đổi trạng thái
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-2 text-left border">Tên sản phẩm</th>
              <th className="p-2 text-left border">Danh mục</th>
              <th className="p-2 text-right border">Giá bán (VNĐ)</th>
              <th className="p-2 text-right border">Tồn kho</th>
              <th className="p-2 text-right border">Tồn tối thiểu</th>
              <th className="p-2 text-left border">Đơn vị</th>
              <th className="p-2 text-center border">Trạng thái</th>
              <th className="p-2 text-center border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.category}</td>
                <td className="p-2 border text-right">
                  {item.product_details.selling_price.toLocaleString()}
                </td>
                <td className="p-2 border text-right font-medium">
                  {item.product_details.stock_quantity}
                </td>
                <td className="p-2 border text-right">
                  {item.product_details.minimum_stock}
                </td>
                <td className="p-2 border">{item.product_details.unit}</td>
                <td className="p-2 border text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${item.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="text-sm text-blue-600 underline"
                  >
                    Đổi trạng thái
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Thêm export default để sửa lỗi Vite runtime error

export const ServicesPage = CatalogPage;
export const ProductsPage = CatalogPage;
export const CombosPage = CatalogPage;
export const PricingPage = CatalogPage;
export default CatalogPage;

############################################################
END FILE: src/pages/catalog.tsx
############################################################

############################################################
FILE: src/pages/customers.tsx
############################################################

import React, { useEffect, useState, useCallback } from "react";
import { customerService } from "../services/customer.service";
import { Customer, CreateCustomerInput } from "../types/domain";

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<CreateCustomerInput>({
    full_name: "",
    phone: "",
    email: "",
    date_of_birth: "",
    gender: "",
    address: "",
    notes: "",
  });

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getCustomers(searchQuery);
      setCustomers(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã có lỗi xảy ra khi tải danh sách khách hàng.",
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        full_name: customer.full_name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        date_of_birth: customer.date_of_birth || "",
        gender: customer.gender || "",
        address: customer.address || "",
        notes: customer.notes || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        date_of_birth: "",
        gender: "",
        address: "",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) {
      alert("Vui lòng điền Họ tên và Số điện thoại.");
      return;
    }

    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, formData);
      } else {
        await customerService.createCustomer(formData);
      }
      handleCloseModal();
      loadCustomers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Thao tác không thành công.");
    }
  };

  const handleArchive = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn lưu trữ khách hàng này?")) {
      try {
        await customerService.archiveCustomer(id);
        loadCustomers();
      } catch (err: unknown) {
        alert(
          err instanceof Error ? err.message : "Không thể lưu trữ khách hàng.",
        );
      }
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Quản lý Khách hàng</h2>
        <button
          onClick={() => handleOpenModal()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          + Thêm khách hàng
        </button>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Tìm theo tên, điện thoại, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={loadCustomers}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Làm mới
        </button>
      </div>

      {loading && <div>Đang tải danh sách khách hàng...</div>}
      {error && (
        <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            border: "1px dashed #ccc",
            borderRadius: "4px",
          }}
        >
          Không tìm thấy khách hàng nào.
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <th style={{ padding: "12px" }}>Họ tên</th>
              <th style={{ padding: "12px" }}>Điện thoại</th>
              <th style={{ padding: "12px" }}>Email</th>
              <th style={{ padding: "12px" }}>Ngày sinh</th>
              <th style={{ padding: "12px" }}>Giới tính</th>
              <th style={{ padding: "12px" }}>Tổng chi tiêu</th>
              <th style={{ padding: "12px" }}>Điểm tích lũy</th>
              <th style={{ padding: "12px" }}>Lần ghé gần nhất</th>
              <th style={{ padding: "12px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={{ padding: "12px" }}>{c.full_name || c.fullName}</td>
                <td style={{ padding: "12px" }}>{c.phone}</td>
                <td style={{ padding: "12px" }}>{c.email || "—"}</td>
                <td style={{ padding: "12px" }}>{c.date_of_birth || "—"}</td>
                <td style={{ padding: "12px" }}>{c.gender || "—"}</td>
                <td style={{ padding: "12px" }}>
                  {(c.total_spend ?? c.totalSpend) !== undefined
                    ? `${(c.total_spend ?? c.totalSpend ?? 0).toLocaleString("vi-VN")} đ`
                    : "Chưa có dữ liệu"}
                </td>
                <td style={{ padding: "12px" }}>
                  {(c.loyalty_points ?? c.loyaltyPoints) !== undefined
                    ? (c.loyalty_points ?? c.loyaltyPoints)
                    : "Chưa có dữ liệu"}
                </td>
                <td style={{ padding: "12px" }}>
                  {c.last_visit || c.lastVisit || "Chưa có dữ liệu"}
                </td>
                <td style={{ padding: "12px" }}>
                  <button
                    onClick={() => handleOpenModal(c)}
                    style={{
                      marginRight: "8px",
                      padding: "4px 8px",
                      backgroundColor: "#ffc107",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleArchive(c.id)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Lưu trữ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>
              {editingCustomer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label>Họ tên *</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Số điện thoại *</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Email</label>
                <input
                  type="email"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Ngày sinh</label>
                <input
                  type="date"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.date_of_birth || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Giới tính</label>
                <select
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.gender || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="">Chưa chọn</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Địa chỉ</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Ghi chú</label>
                <textarea
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ padding: "8px 16px" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;

############################################################
END FILE: src/pages/customers.tsx
############################################################

############################################################
FILE: src/pages/dashboard.tsx
############################################################

import { ArrowUpRight, CalendarClock, ChevronRight, CircleDollarSign, Clock3, Plus, ReceiptText, Sparkles, UserPlus, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { demoCustomers, demoStaff, formatVnd, initials } from '@/data/demo';
import { Badge, PageHeader, Panel, PanelHeader } from '@/components/primitives';

const appointments = [
  { id: 'apt-1', time: '09:30', name: 'Nguyễn Minh Anh', service: 'Chăm sóc da chuyên sâu', staff: 'Thảo Vy', status: 'Đã xác nhận' },
  { id: 'apt-2', time: '10:45', name: 'Võ Khánh Linh', service: 'Gội đầu dưỡng sinh', staff: 'Thanh Trúc', status: 'Đã xác nhận' },
  { id: 'apt-3', time: '13:30', name: 'Phạm Gia Hân', service: 'Massage trị liệu cổ vai gáy', staff: 'Thảo Vy', status: 'Chờ khách đến' },
  { id: 'apt-4', time: '15:00', name: 'Trần Ngọc Mai', service: 'Điều trị mụn cơ bản', staff: 'Thanh Trúc', status: 'Đã xác nhận' },
];

export default function DashboardPage() {
  return <div className="page-wrap">
    <PageHeader kicker="Thứ Hai · 01.07.2024" title="Tổng quan hôm nay" subtitle="Một nhịp vận hành gọn gàng cho MEE Quận 1." actions={<><Link href="/pos" className="btn btn-soft" data-testid="link-dashboard-pos"><ReceiptText size={15} /> Mở POS</Link><Link href="/booking" className="btn btn-primary" data-testid="link-dashboard-booking"><Plus size={15} /> Tạo lịch hẹn</Link></>} />
    <section className="hero-dashboard mb-5" data-testid="card-dashboard-hero">
      <div className="max-w-lg"><div className="font-mono-app text-[10px] uppercase tracking-[.16em] opacity-70">Điểm chạm đầu ngày</div><h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Giữ mọi thứ<br /><em>thật nhẹ nhàng.</em></h2><p className="mt-3 max-w-sm text-xs leading-relaxed opacity-75">4 liệu trình đang chờ đón khách. Quầy lễ tân đã sẵn sàng cho một ngày chỉn chu.</p><div className="mt-5 flex items-center gap-3"><Link href="/attendance" className="btn bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25" data-testid="link-hero-attendance"><Clock3 size={14} /> Xem chấm công</Link><span className="text-[11px] opacity-65">Cập nhật lúc 08:42</span></div></div>
    </section>
    <div className="section-grid three-col mb-5">
      <div className="panel metric-card" data-testid="metric-revenue"><div className="metric-label">Doanh thu hôm nay</div><div className="metric-value">12.840.000 ₫</div><div className="metric-note flex items-center gap-1"><ArrowUpRight size={13} /> +12,4% so với thứ Hai trước</div></div>
      <div className="panel metric-card" data-testid="metric-visits"><div className="metric-label">Lượt phục vụ</div><div className="metric-value">18 <span className="text-sm font-sans text-muted-foreground">/ 24</span></div><div className="metric-note">75% công suất hôm nay</div></div>
      <div className="panel metric-card" data-testid="metric-new-customers"><div className="metric-label">Khách mới</div><div className="metric-value">06</div><div className="metric-note flex items-center gap-1"><UsersRound size={13} /> 3 khách quay lại trong tuần</div></div>
    </div>
    <div className="section-grid two-col">
      <Panel testId="panel-today-appointments"><PanelHeader title="Lịch hẹn hôm nay" caption="4 lịch hẹn · 18 khách dự kiến" actions={<Link href="/booking" className="text-xs font-bold text-primary" data-testid="link-view-all-appointments">Xem lịch đầy đủ <ChevronRight size={13} className="inline" /></Link>} />
        <div>{appointments.map((item, index) => <div className="timeline-item" key={item.id} data-testid={`appointment-${item.id}`}><div className="w-12 shrink-0 font-mono-app text-xs font-medium text-muted-foreground">{item.time}</div><div className="timeline-dot" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><div className="avatar small">{initials(item.name)}</div><span className="text-xs font-bold" data-testid={`text-appointment-customer-${index}`}>{item.name}</span></div><Badge tone={item.status === 'Chờ khách đến' ? 'coral' : 'green'}>{item.status}</Badge></div><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground"><span>{item.service}</span><span>·</span><span>{item.staff}</span></div></div></div>)}</div>
      </Panel>
      <div className="space-y-[18px]">
        <Panel testId="panel-quick-actions"><PanelHeader title="Thao tác nhanh" caption="Những việc thường dùng nhất" /><div className="grid grid-cols-2 gap-2 p-3">{[{ label: 'Thêm khách mới', href: '/customers', icon: UserPlus }, { label: 'Bán sản phẩm', href: '/pos', icon: CircleDollarSign }, { label: 'Ghi nhận chi phí', href: '/expenses', icon: ReceiptText }, { label: 'Ghi điểm loyalty', href: '/loyalty', icon: Sparkles }].map(({ label, href, icon: Icon }) => <Link className="quick-action" href={href} key={label} data-testid={`quick-action-${label}`}><Icon size={17} /><span className="text-[11px] font-bold">{label}</span></Link>)}</div></Panel>
        <Panel testId="panel-team-status"><PanelHeader title="Đội ngũ hôm nay" caption="3 / 4 đang có mặt" actions={<Link href="/attendance" className="text-xs font-bold text-primary" data-testid="link-team-attendance">Chấm công</Link>} /><div className="p-4">{demoStaff.slice(0, 3).map((staff) => <div className="mb-3 flex items-center gap-3 last:mb-0" key={staff.id} data-testid={`staff-status-${staff.id}`}><div className="avatar small">{initials(staff.fullName)}</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{staff.fullName}</div><div className="text-[10px] text-muted-foreground">{staff.role}</div></div><span className="h-2 w-2 rounded-full bg-primary" /></div>)}</div></Panel>
      </div>
    </div>
    <Panel className="mt-[18px]" testId="panel-recent-customers"><PanelHeader title="Khách hàng gần đây" caption="Những vị khách vừa ghé MEE" actions={<Link href="/customers" className="text-xs font-bold text-primary" data-testid="link-dashboard-customers">Mở danh sách</Link>} /><div className="grid gap-0 sm:grid-cols-3">{demoCustomers.slice(0, 3).map((customer) => <Link href={`/customers/${customer.id}`} className="flex items-center gap-3 border-t border-border p-4 first:border-0 sm:border-t-0 sm:border-l sm:first:border-l-0" key={customer.id} data-testid={`customer-recent-${customer.id}`}><div className="avatar">{initials(customer.fullName)}</div><div className="min-w-0"><div className="truncate text-xs font-bold">{customer.fullName}</div><div className="mt-1 text-[10px] text-muted-foreground">{customer.visitCount} lần ghé · {formatVnd(customer.totalSpend)}</div></div></Link>)}</div></Panel>
  </div>;
}
############################################################
END FILE: src/pages/dashboard.tsx
############################################################

############################################################
FILE: src/pages/not-found.tsx
############################################################

import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              404 Page Not Found
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

############################################################
END FILE: src/pages/not-found.tsx
############################################################

############################################################
FILE: src/pages/operations.tsx
############################################################

import React, { useEffect, useState, useCallback } from "react";
import {
  packageService,
  CreatePackageInput,
} from "../services/package.service";
import {
  expenseService,
  CreateExpenseInput,
} from "../services/expense.service";
import { catalogService } from "../services/catalog-service";
import { customerService } from "../services/customer.service";
import { PackageTemplate, Expense } from "../types/domain";

export const OperationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "packages" | "expenses" | "overview"
  >("packages");

  // State Packages
  const [packages, setPackages] = useState<PackageTemplate[]>([]);
  const [pkgLoading, setPkgLoading] = useState<boolean>(false);
  const [pkgError, setPkgError] = useState<string | null>(null);
  const [pkgSearch, setPkgSearch] = useState<string>("");
  const [isPkgModalOpen, setIsPkgModalOpen] = useState<boolean>(false);
  const [editingPkg, setEditingPkg] = useState<PackageTemplate | null>(null);
  const [pkgFormData, setPkgFormData] = useState<CreatePackageInput>({
    name: "",
    description: "",
    price: 0,
    total_sessions: 1,
    validity_days: 30,
  });

  // State Expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expLoading, setExpLoading] = useState<boolean>(false);
  const [expError, setExpError] = useState<string | null>(null);
  const [expSearch, setExpSearch] = useState<string>("");
  const [expCategory, setExpCategory] = useState<string>("");
  const [expDate, setExpDate] = useState<string>("");
  const [isExpModalOpen, setIsExpModalOpen] = useState<boolean>(false);
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [expFormData, setExpFormData] = useState<CreateExpenseInput>({
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    payment_method: "Tiền mặt",
  });

  // State Overview KPI
  const [overviewMetrics, setOverviewMetrics] = useState<{
    totalCustomers: number | null;
    totalServices: number | null;
    totalProducts: number | null;
    totalExpenses: number | null;
  }>({
    totalCustomers: null,
    totalServices: null,
    totalProducts: null,
    totalExpenses: null,
  });
  const [overviewLoading, setOverviewLoading] = useState<boolean>(false);

  // Load Packages
  const loadPackages = useCallback(async () => {
    try {
      setPkgLoading(true);
      setPkgError(null);
      const data = await packageService.getPackages(pkgSearch);
      setPackages(data);
    } catch (err: unknown) {
      setPkgError(
        err instanceof Error ? err.message : "Đã có lỗi tải gói liệu trình.",
      );
    } finally {
      setPkgLoading(false);
    }
  }, [pkgSearch]);

  // Load Expenses
  const loadExpenses = useCallback(async () => {
    try {
      setExpLoading(true);
      setExpError(null);
      const data = await expenseService.getExpenses({
        category: expCategory || undefined,
        date: expDate || undefined,
        searchQuery: expSearch || undefined,
      });
      setExpenses(data);
    } catch (err: unknown) {
      setExpError(
        err instanceof Error ? err.message : "Đã có lỗi tải danh sách chi phí.",
      );
    } finally {
      setExpLoading(false);
    }
  }, [expCategory, expDate, expSearch]);

  // Load Overview Data
  const loadOverview = useCallback(async () => {
    try {
      setOverviewLoading(true);
      const [customers, catalog, expList] = await Promise.all([
        customerService.getCustomers(),
        catalogService.getCatalogItems(),
        expenseService.getExpenses(),
      ]);

      const servicesCount = catalog.filter(
        (item) => item.item_type === "SERVICE",
      ).length;
      const productsCount = catalog.filter(
        (item) => item.item_type === "PRODUCT",
      ).length;
      const sumExpense = expList.reduce(
        (acc, curr) => acc + (curr.amount || 0),
        0,
      );

      setOverviewMetrics({
        totalCustomers: customers.length,
        totalServices: servicesCount,
        totalProducts: productsCount,
        totalExpenses: sumExpense,
      });
    } catch {
      setOverviewMetrics({
        totalCustomers: null,
        totalServices: null,
        totalProducts: null,
        totalExpenses: null,
      });
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "packages") loadPackages();
    if (activeTab === "expenses") loadExpenses();
    if (activeTab === "overview") loadOverview();
  }, [activeTab, loadPackages, loadExpenses, loadOverview]);

  // Package Modal Handlers
  const handleOpenPkgModal = (pkg?: PackageTemplate) => {
    if (pkg) {
      setEditingPkg(pkg);
      setPkgFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        price: pkg.price || 0,
        total_sessions: pkg.total_sessions || 1,
        validity_days: pkg.validity_days || 30,
      });
    } else {
      setEditingPkg(null);
      setPkgFormData({
        name: "",
        description: "",
        price: 0,
        total_sessions: 1,
        validity_days: 30,
      });
    }
    setIsPkgModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPkg) {
        await packageService.updatePackage(editingPkg.id, pkgFormData);
      } else {
        await packageService.createPackage(pkgFormData);
      }
      setIsPkgModalOpen(false);
      loadPackages();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Thao tác thất bại.");
    }
  };

  const handleArchivePackage = async (id: string) => {
    if (window.confirm("Lưu trữ gói liệu trình này?")) {
      try {
        await packageService.archivePackage(id);
        loadPackages();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Lỗi lưu trữ.");
      }
    }
  };

  // Expense Modal Handlers
  const handleOpenExpModal = (exp?: Expense) => {
    if (exp) {
      setEditingExp(exp);
      setExpFormData({
        category: exp.category || "",
        amount: exp.amount || 0,
        description: exp.description || "",
        date: exp.date || new Date().toISOString().split("T")[0],
        payment_method: exp.payment_method || "Tiền mặt",
      });
    } else {
      setEditingExp(null);
      setExpFormData({
        category: "",
        amount: 0,
        description: "",
        date: new Date().toISOString().split("T")[0],
        payment_method: "Tiền mặt",
      });
    }
    setIsExpModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExp) {
        await expenseService.updateExpense(editingExp.id, expFormData);
      } else {
        await expenseService.createExpense(expFormData);
      }
      setIsExpModalOpen(false);
      loadExpenses();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Thao tác thất bại.");
    }
  };

  const handleArchiveExpense = async (id: string) => {
    if (window.confirm("Lưu trữ khoản chi phí này?")) {
      try {
        await expenseService.archiveExpense(id);
        loadExpenses();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Lỗi lưu trữ.");
      }
    }
  };

  const totalExpenseAmount = expenses.reduce(
    (acc, c) => acc + (c.amount || 0),
    0,
  );

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Quản lý Vận hành</h2>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          borderBottom: "2px solid #eee",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("packages")}
          style={{
            padding: "10px 20px",
            borderBottom:
              activeTab === "packages" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "packages" ? "bold" : "normal",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Gói liệu trình
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          style={{
            padding: "10px 20px",
            borderBottom:
              activeTab === "expenses" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "expenses" ? "bold" : "normal",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Chi phí vận hành
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "10px 20px",
            borderBottom:
              activeTab === "overview" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "overview" ? "bold" : "normal",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Tổng quan
        </button>
      </div>

      {/* TAB 1: PACKAGES */}
      {activeTab === "packages" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flex: 1 }}>
              <input
                type="text"
                placeholder="Tìm gói liệu trình..."
                value={pkgSearch}
                onChange={(e) => setPkgSearch(e.target.value)}
                style={{
                  padding: "8px",
                  width: "300px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <button onClick={loadPackages} style={{ padding: "8px 16px" }}>
                Làm mới
              </button>
            </div>
            <button
              onClick={() => handleOpenPkgModal()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              + Thêm gói
            </button>
          </div>

          {pkgLoading && <div>Đang tải gói liệu trình...</div>}
          {pkgError && <div style={{ color: "red" }}>{pkgError}</div>}
          {!pkgLoading && !pkgError && packages.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                border: "1px dashed #ccc",
              }}
            >
              Chưa có dữ liệu gói liệu trình.
            </div>
          )}

          {!pkgLoading && !pkgError && packages.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th style={{ padding: "10px" }}>Tên gói</th>
                  <th style={{ padding: "10px" }}>Giá</th>
                  <th style={{ padding: "10px" }}>Số buổi</th>
                  <th style={{ padding: "10px" }}>Thời hạn (Ngày)</th>
                  <th style={{ padding: "10px" }}>Trạng thái</th>
                  <th style={{ padding: "10px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "10px" }}>
                      <strong>{p.name}</strong>
                      {p.description && (
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.price ? `${p.price.toLocaleString("vi-VN")} đ` : "0 đ"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.total_sessions || "—"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.validity_days || "—"}
                    </td>
                    <td style={{ padding: "10px" }}>{p.status || "active"}</td>
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={() => handleOpenPkgModal(p)}
                        style={{ marginRight: "8px", padding: "4px 8px" }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleArchivePackage(p.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        Lưu trữ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 2: EXPENSES */}
      {activeTab === "expenses" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "16px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Tìm mô tả, danh mục..."
              value={expSearch}
              onChange={(e) => setExpSearch(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="text"
              placeholder="Lọc danh mục..."
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <button onClick={loadExpenses} style={{ padding: "8px 16px" }}>
              Làm mới
            </button>
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={() => handleOpenExpModal()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Thêm chi phí
              </button>
            </div>
          </div>

          <div
            style={{
              marginBottom: "16px",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Tổng chi phí: {totalExpenseAmount.toLocaleString("vi-VN")} đ
          </div>

          {expLoading && <div>Đang tải chi phí...</div>}
          {expError && <div style={{ color: "red" }}>{expError}</div>}
          {!expLoading && !expError && expenses.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                border: "1px dashed #ccc",
              }}
            >
              Chưa có dữ liệu chi phí.
            </div>
          )}

          {!expLoading && !expError && expenses.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th style={{ padding: "10px" }}>Ngày</th>
                  <th style={{ padding: "10px" }}>Danh mục</th>
                  <th style={{ padding: "10px" }}>Số tiền</th>
                  <th style={{ padding: "10px" }}>Phương thức</th>
                  <th style={{ padding: "10px" }}>Mô tả</th>
                  <th style={{ padding: "10px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "10px" }}>{e.date}</td>
                    <td style={{ padding: "10px" }}>{e.category}</td>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>
                      {e.amount
                        ? `${e.amount.toLocaleString("vi-VN")} đ`
                        : "0 đ"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {e.payment_method || "—"}
                    </td>
                    <td style={{ padding: "10px" }}>{e.description || "—"}</td>
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={() => handleOpenExpModal(e)}
                        style={{ marginRight: "8px", padding: "4px 8px" }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleArchiveExpense(e.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          {overviewLoading ? (
            <div>Đang tính toán chỉ số...</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng khách hàng
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalCustomers !== null
                    ? overviewMetrics.totalCustomers
                    : "Chưa có dữ liệu"}
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng dịch vụ
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalServices !== null
                    ? overviewMetrics.totalServices
                    : "Chưa có dữ liệu"}
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng sản phẩm
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalProducts !== null
                    ? overviewMetrics.totalProducts
                    : "Chưa có dữ liệu"}
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng chi phí
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalExpenses !== null
                    ? `${overviewMetrics.totalExpenses.toLocaleString("vi-VN")} đ`
                    : "Chưa có dữ liệu"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL PACKAGE */}
      {isPkgModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>
              {editingPkg ? "Sửa gói liệu trình" : "Thêm gói liệu trình mới"}
            </h3>
            <form onSubmit={handleSavePackage}>
              <div style={{ marginBottom: "12px" }}>
                <label>Tên gói *</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.name}
                  onChange={(e) =>
                    setPkgFormData({ ...pkgFormData, name: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Giá *</label>
                <input
                  type="number"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.price}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Số buổi</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.total_sessions || 1}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      total_sessions: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Thời hạn (ngày)</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.validity_days || 30}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      validity_days: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Mô tả</label>
                <textarea
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.description || ""}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button type="button" onClick={() => setIsPkgModalOpen(false)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                  }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXPENSE */}
      {isExpModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>{editingExp ? "Sửa khoản chi" : "Thêm khoản chi mới"}</h3>
            <form onSubmit={handleSaveExpense}>
              <div style={{ marginBottom: "12px" }}>
                <label>Danh mục *</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.category}
                  onChange={(e) =>
                    setExpFormData({ ...expFormData, category: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Số tiền *</label>
                <input
                  type="number"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.amount}
                  onChange={(e) =>
                    setExpFormData({
                      ...expFormData,
                      amount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Ngày chi *</label>
                <input
                  type="date"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.date}
                  onChange={(e) =>
                    setExpFormData({ ...expFormData, date: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Phương thức thanh toán</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.payment_method || ""}
                  onChange={(e) =>
                    setExpFormData({
                      ...expFormData,
                      payment_method: e.target.value,
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Mô tả</label>
                <textarea
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.description || ""}
                  onChange={(e) =>
                    setExpFormData({
                      ...expFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button type="button" onClick={() => setIsExpModalOpen(false)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                  }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Router compatibility exports
export const AttendancePage = OperationsPage;
export const BookingPage = OperationsPage;
export const ExpensesPage = OperationsPage;
export const LoyaltyPage = OperationsPage;
export const PackagesPage = OperationsPage;
export const PosPage = OperationsPage;
export const ReportsPage = OperationsPage;
export const SettingsPage = OperationsPage;
export const StaffPage = OperationsPage;

export default OperationsPage;

############################################################
END FILE: src/pages/operations.tsx
############################################################

############################################################
FILE: src/pages/staff.tsx
############################################################

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  archiveStaff,
} from "../services/staff.service";
import { StaffMemberDomain, CreateStaffInput } from "../types/domain";

export const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMemberDomain[]>([]);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMemberDomain | null>(
    null,
  );
  const [formData, setFormData] = useState<CreateStaffInput>({
    full_name: "",
    role: "Kỹ thuật viên",
    phone: "",
    status: "ACTIVE",
    started_on: new Date().toISOString().split("T")[0],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchStaff(search, includeInactive);
      setStaffList(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi kết nối tới hệ thống Supabase");
    } finally {
      setLoading(false);
    }
  }, [search, includeInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (staff?: StaffMemberDomain) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        full_name: staff.full_name,
        role: staff.role,
        phone: staff.phone,
        status: staff.status,
        started_on: staff.started_on ? staff.started_on.split("T")[0] : "",
      });
    } else {
      setEditingStaff(null);
      setFormData({
        full_name: "",
        role: "Kỹ thuật viên",
        phone: "",
        status: "ACTIVE",
        started_on: new Date().toISOString().split("T")[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
        setSuccessMessage("Cập nhật nhân viên thành công!");
      } else {
        await createStaff(formData);
        setSuccessMessage("Thêm mới nhân viên thành công!");
      }
      handleCloseModal();
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: "ACTIVE" | "INACTIVE",
  ) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateStaffStatus(id, nextStatus);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn lưu trữ (archive) nhân viên "${name}"?`,
      )
    )
      return;
    try {
      await archiveStaff(id);
      setSuccessMessage(`Đã lưu trữ nhân viên ${name}`);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Nhân viên (Staff)
          </h1>
          <p className="text-sm text-gray-500">Dữ liệu thực tế từ Supabase</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
        >
          + Thêm nhân viên
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên, SĐT, hoặc chức danh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="rounded"
          />
          Hiển thị cả nhân viên Tạm ngưng (INACTIVE)
        </label>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded border border-red-300 text-sm">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 rounded border border-green-300 text-sm">
          {successMessage}
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">
          Đang tải danh sách nhân viên từ Supabase...
        </div>
      ) : staffList.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 border rounded text-gray-500">
          Không tìm thấy nhân viên nào phù hợp.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 font-semibold text-gray-700">Họ và tên</th>
                <th className="p-3 font-semibold text-gray-700">
                  Chức danh / Role
                </th>
                <th className="p-3 font-semibold text-gray-700">
                  Số điện thoại
                </th>
                <th className="p-3 font-semibold text-gray-700">
                  Ngày bắt đầu
                </th>
                <th className="p-3 font-semibold text-gray-700 text-center">
                  Trạng thái
                </th>
                <th className="p-3 font-semibold text-gray-700 text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr
                  key={staff.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-900">
                    {staff.full_name}
                  </td>
                  <td className="p-3 text-gray-600">{staff.role}</td>
                  <td className="p-3 text-gray-600">{staff.phone}</td>
                  <td className="p-3 text-gray-600">
                    {staff.started_on || "N/A"}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        staff.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleOpenModal(staff)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          handleToggleStatus(staff.id, staff.status)
                        }
                        className="text-gray-600 hover:underline"
                      >
                        {staff.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}
                      </button>
                      <button
                        onClick={() => handleArchive(staff.id, staff.full_name)}
                        className="text-red-600 hover:underline"
                      >
                        Lưu trữ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingStaff ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chức danh / Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Kỹ thuật viên, Lễ tân, Quản lý..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={formData.started_on}
                  onChange={(e) =>
                    setFormData({ ...formData, started_on: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "ACTIVE" | "INACTIVE",
                    })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                  <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingStaff ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;

############################################################
END FILE: src/pages/staff.tsx
############################################################

############################################################
FILE: src/services/catalog-service.ts
############################################################

import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import { CatalogItem } from "../types/domain";

export const catalogService = {
  async getAll(): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from("catalog_items")
      .select("*")
      .order("code", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByItemType(itemType: "service" | "product"): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from("catalog_items")
      .select("*")
      .eq("item_type", itemType)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async create(
    item: Omit<CatalogItem, "id" | "created_at" | "updated_at">,
  ): Promise<CatalogItem> {
    const payload = {
      ...item,
      organization_id: item.organization_id || DEFAULT_ORG_ID,
      branch_id: item.branch_id || DEFAULT_BRANCH_ID,
    };

    const { data, error } = await supabase
      .from("catalog_items")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<CatalogItem>,
  ): Promise<CatalogItem> {
    const { data, error } = await supabase
      .from("catalog_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("catalog_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

############################################################
END FILE: src/services/catalog-service.ts
############################################################

############################################################
FILE: src/services/customer.service.ts
############################################################

import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/domain";

export const customerService = {
  async getCustomers(searchQuery?: string): Promise<Customer[]> {
    let query = supabase
      .from("customers")
      .select("*")
      .eq("organization_id", DEFAULT_ORG_ID)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (searchQuery && searchQuery.trim() !== "") {
      const q = `%${searchQuery.trim()}%`;
      query = query.or(
        `full_name.ilike.${q},phone.ilike.${q},email.ilike.${q}`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Customer[]) || [];
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const payload = {
      ...input,
      organization_id: input.organization_id || DEFAULT_ORG_ID,
      branch_id: input.branch_id || DEFAULT_BRANCH_ID,
      loyalty_points: input.loyalty_points ?? 0,
      total_spend: 0,
      status: input.status || "active",
    };

    const { data, error } = await supabase
      .from("customers")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async updateCustomer(
    id: string,
    input: UpdateCustomerInput,
  ): Promise<Customer> {
    const { data, error } = await supabase
      .from("customers")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async archiveCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID);

    if (error) throw error;
  },
};

############################################################
END FILE: src/services/customer.service.ts
############################################################

############################################################
FILE: src/services/demo-service.ts
############################################################

import { demoCatalog, demoCustomers, demoExpenses, demoPackages, demoStaff } from '@/data/demo';

const pause = (ms = 220) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const demoService = {
  async getCustomers() { await pause(); return demoCustomers; },
  async getCatalog() { await pause(120); return demoCatalog; },
  async getPackages() { await pause(160); return demoPackages; },
  async getStaff() { await pause(180); return demoStaff; },
  async getExpenses() { await pause(180); return demoExpenses; },
};
############################################################
END FILE: src/services/demo-service.ts
############################################################

############################################################
FILE: src/services/expense.service.ts
############################################################

import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import { Expense } from "../types/domain";

export interface CreateExpenseInput {
  category: string;
  amount: number;
  description?: string | null;
  date: string;
  payment_method?: string;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export const expenseService = {
  async getExpenses(filter?: {
    category?: string;
    date?: string;
    searchQuery?: string;
  }): Promise<Expense[]> {
    let query = supabase
      .from("expenses")
      .select("*")
      .eq("organization_id", DEFAULT_ORG_ID)
      .is("archived_at", null)
      .order("date", { ascending: false });

    if (filter?.category) {
      query = query.eq("category", filter.category);
    }
    if (filter?.date) {
      query = query.eq("date", filter.date);
    }
    if (filter?.searchQuery && filter.searchQuery.trim() !== "") {
      const q = `%${filter.searchQuery.trim()}%`;
      query = query.or(`category.ilike.${q},description.ilike.${q}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Expense[]) || [];
  },

  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    const payload = {
      ...input,
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
    };

    const { data, error } = await supabase
      .from("expenses")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  },

  async updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
    const { data, error } = await supabase
      .from("expenses")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  },

  async archiveExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from("expenses")
      .update({
        archived_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID);

    if (error) throw error;
  },
};

############################################################
END FILE: src/services/expense.service.ts
############################################################

############################################################
FILE: src/services/operations.service.ts
############################################################

import { supabase } from "./supabase";
import { OperationsMetrics } from "../types/domain";

export const operationsService = {
  async getMetrics(): Promise<OperationsMetrics | null> {
    try {
      const { data: expenses, error: expError } = await supabase
        .from("expenses")
        .select("amount");

      if (expError) throw expError;

      const totalExpenses = expenses
        ? expenses.reduce((acc, cur) => acc + (cur.amount || 0), 0)
        : 0;

      const { count: bookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: sessionsCount } = await supabase
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const { data: sales } = await supabase
        .from("sales")
        .select("total_amount");

      const totalRevenue = sales
        ? sales.reduce((acc, cur) => acc + (cur.total_amount || 0), 0)
        : 0;

      return {
        total_revenue: totalRevenue,
        active_bookings: bookingsCount || 0,
        completed_sessions: sessionsCount || 0,
        expenses_total: totalExpenses,
      };
    } catch {
      return null;
    }
  },
};

############################################################
END FILE: src/services/operations.service.ts
############################################################

############################################################
FILE: src/services/package.service.ts
############################################################

import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import { PackageTemplate } from "../types/domain";

export interface CreatePackageInput {
  name: string;
  description?: string | null;
  price: number;
  total_sessions?: number;
  validity_days?: number;
  status?: string;
  items?: { catalog_item_id: string; quantity: number }[];
}

export type UpdatePackageInput = Partial<CreatePackageInput>;

export const packageService = {
  async getPackages(searchQuery?: string): Promise<PackageTemplate[]> {
    let query = supabase
      .from("package_templates")
      .select("*")
      .eq("organization_id", DEFAULT_ORG_ID)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (searchQuery && searchQuery.trim() !== "") {
      query = query.ilike("name", `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as PackageTemplate[]) || [];
  },

  async getPackageById(id: string): Promise<PackageTemplate | null> {
    const { data, error } = await supabase
      .from("package_templates")
      .select("*")
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .single();

    if (error) throw error;
    return data as PackageTemplate;
  },

  async createPackage(input: CreatePackageInput): Promise<PackageTemplate> {
    const payload = {
      ...input,
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
      status: input.status || "active",
    };

    const { data, error } = await supabase
      .from("package_templates")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as PackageTemplate;
  },

  async updatePackage(
    id: string,
    input: UpdatePackageInput,
  ): Promise<PackageTemplate> {
    const { data, error } = await supabase
      .from("package_templates")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) throw error;
    return data as PackageTemplate;
  },

  async archivePackage(id: string): Promise<void> {
    const { error } = await supabase
      .from("package_templates")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID);

    if (error) throw error;
  },
};

############################################################
END FILE: src/services/package.service.ts
############################################################

############################################################
FILE: src/services/seed.service.ts
############################################################

import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";

export const seedService = {
  async seedInitialDataIfEmpty(): Promise<void> {
    // 1. Seed Customers if empty
    const { count: customerCount } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", DEFAULT_ORG_ID);

    if (customerCount === 0) {
      await supabase.from("customers").insert([
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          full_name: "Nguyễn Văn A",
          phone: "0901234567",
          email: "nguyenvana@example.com",
          gender: "Nam",
          status: "active",
          loyalty_points: 100,
          total_spend: 1500000,
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          full_name: "Trần Thị B",
          phone: "0912345678",
          email: "tranthib@example.com",
          gender: "Nữ",
          status: "active",
          loyalty_points: 50,
          total_spend: 800000,
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          full_name: "Lê Hoàng C",
          phone: "0987654321",
          email: "lehoangc@example.com",
          gender: "Nam",
          status: "active",
          loyalty_points: 0,
          total_spend: 0,
        },
      ]);
    }

    // 2. Seed Expenses if empty
    const { count: expenseCount } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", DEFAULT_ORG_ID);

    if (expenseCount === 0) {
      await supabase.from("expenses").insert([
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          category: "Mặt bằng",
          amount: 15000000,
          description: "Tiền thuê mặt bằng tháng này",
          date: new Date().toISOString().split("T")[0],
          payment_method: "Chuyển khoản",
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          category: "Điện nước",
          amount: 2500000,
          description: "Thanh toán hóa đơn điện nước",
          date: new Date().toISOString().split("T")[0],
          payment_method: "Chuyển khoản",
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          category: "Vật tư",
          amount: 4500000,
          description: "Mua bổ sung sản phẩm skincare",
          date: new Date().toISOString().split("T")[0],
          payment_method: "Tiền mặt",
        },
      ]);
    }

    // 3. Seed Packages if empty
    const { count: packageCount } = await supabase
      .from("package_templates")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", DEFAULT_ORG_ID);

    if (packageCount === 0) {
      await supabase.from("package_templates").insert([
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          name: "Gói Trị Mụn Chuẩn Y Khoa (10 Buổi)",
          description: "Liệu trình chăm sóc chuyên sâu 10 buổi",
          price: 3500000,
          total_sessions: 10,
          validity_days: 90,
          status: "active",
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          name: "Gói Phục Hồi Da CO2 Detox (5 Buổi)",
          description: "Thải độc và phục hồi cấu trúc da",
          price: 2200000,
          total_sessions: 5,
          validity_days: 60,
          status: "active",
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          name: "Gói Chăm Sóc Cơ Bản (3 Buổi)",
          description: "Chăm sóc da mặt duy trì hàng tuần",
          price: 900000,
          total_sessions: 3,
          validity_days: 30,
          status: "active",
        },
      ]);
    }
  },
};

############################################################
END FILE: src/services/seed.service.ts
############################################################

############################################################
FILE: src/services/staff.service.ts
############################################################

import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  StaffMemberDomain,
  CreateStaffInput,
  UpdateStaffInput,
} from "../types/domain";

/**
 * Tải danh sách nhân viên từ public.staff scoped theo organization_id & branch_id.
 * Chỉ lấy các bản ghi chưa lưu trữ (archived_at IS NULL).
 */
export const fetchStaff = async (
  searchQuery?: string,
  includeInactive: boolean = true,
): Promise<StaffMemberDomain[]> => {
  let query = supabase
    .from("staff")
    .select("*")
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (!includeInactive) {
    query = query.eq("status", "ACTIVE");
  }

  if (searchQuery && searchQuery.trim() !== "") {
    const q = searchQuery.trim();
    // Tìm kiếm server-side theo full_name, phone, role
    query = query.or(
      `full_name.ilike.%${q}%,phone.ilike.%${q}%,role.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Lỗi khi lấy dữ liệu nhân viên từ Supabase: ${error.message}`,
    );
  }

  return (data as StaffMemberDomain[]) || [];
};

/**
 * Lấy chi tiết nhân viên theo id
 */
export const getStaffById = async (id: string): Promise<StaffMemberDomain> => {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .single();

  if (error) {
    throw new Error(`Lỗi khi lấy thông tin nhân viên: ${error.message}`);
  }

  return data as StaffMemberDomain;
};

/**
 * Tạo mới nhân viên trực tiếp vào public.staff
 */
export const createStaff = async (
  input: CreateStaffInput,
): Promise<StaffMemberDomain> => {
  const payload = {
    organization_id: DEFAULT_ORG_ID,
    branch_id: DEFAULT_BRANCH_ID,
    profile_id: input.profile_id ?? null,
    full_name: input.full_name,
    role: input.role,
    phone: input.phone,
    status: input.status || "ACTIVE",
    started_on: input.started_on || new Date().toISOString().split("T")[0],
  };

  const { data, error } = await supabase
    .from("staff")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Lỗi khi thêm nhân viên mới: ${error.message}`);
  }

  return data as StaffMemberDomain;
};

/**
 * Cập nhật thông tin nhân viên
 */
export const updateStaff = async (
  id: string,
  input: UpdateStaffInput,
): Promise<StaffMemberDomain> => {
  const payload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.full_name !== undefined) payload.full_name = input.full_name;
  if (input.role !== undefined) payload.role = input.role;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.status !== undefined) payload.status = input.status;
  if (input.started_on !== undefined) payload.started_on = input.started_on;
  if (input.profile_id !== undefined) payload.profile_id = input.profile_id;

  const { data, error } = await supabase
    .from("staff")
    .update(payload)
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .select()
    .single();

  if (error) {
    throw new Error(`Lỗi khi cập nhật nhân viên: ${error.message}`);
  }

  return data as StaffMemberDomain;
};

/**
 * Đổi trạng thái ACTIVE / INACTIVE
 */
export const updateStaffStatus = async (
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<StaffMemberDomain> => {
  return updateStaff(id, { status });
};

/**
 * Soft Archive nhân viên (đặt archived_at)
 */
export const archiveStaff = async (id: string): Promise<StaffMemberDomain> => {
  const { data, error } = await supabase
    .from("staff")
    .update({
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .select()
    .single();

  if (error) {
    throw new Error(`Lỗi khi lưu trữ nhân viên: ${error.message}`);
  }

  return data as StaffMemberDomain;
};

############################################################
END FILE: src/services/staff.service.ts
############################################################

############################################################
FILE: src/services/supabase.ts
############################################################

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEFAULT_ORG_ID = "4fc2ef26-2fa6-43c1-9e7f-7362ac747a26";
export const DEFAULT_BRANCH_ID = "677f6f26-77d1-4a26-ab13-7c2f5a2994f9";

############################################################
END FILE: src/services/supabase.ts
############################################################

############################################################
FILE: src/types/domain.ts
############################################################

// ==========================================
// 1. CATALOG / SERVICE / PRODUCT DOMAIN TYPES
// ==========================================

export type CatalogItemType = "SERVICE" | "PRODUCT";
export type ItemStatus = "active" | "inactive";

export interface CatalogItemDB {
  id: string;
  organization_id: string;
  branch_id: string;
  item_type: CatalogItemType;
  name: string;
  category: string;
  description: string | null;
  price: number;
  status: ItemStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceDB {
  id: string;
  catalog_item_id: string;
  duration_minutes: number;
  sales_commission_rate: number;
  performance_commission_rate: number;
  created_at?: string;
}

export interface ProductDB {
  id: string;
  catalog_item_id: string;
  selling_price: number;
  stock_quantity: number;
  minimum_stock: number;
  unit: string;
  created_at?: string;
}

// Discriminated Unions cho Domain Entities
export interface ServiceItemDomain extends CatalogItemDB {
  item_type: "SERVICE";
  service_details: Omit<ServiceDB, "id" | "catalog_item_id">;
}

export interface ProductItemDomain extends CatalogItemDB {
  item_type: "PRODUCT";
  product_details: Omit<ProductDB, "id" | "catalog_item_id">;
}

export type CatalogDomainItem = ServiceItemDomain | ProductItemDomain;

// Flattened Model hỗ trợ UI Component
export interface CatalogItem {
  id: string;
  organization_id?: string;
  branch_id?: string;
  item_type: CatalogItemType;
  name: string;
  category: string;
  description?: string | null;
  price: number;
  status: ItemStatus;

  // Fields mở rộng từ Service
  duration_minutes?: number;
  sales_commission_rate?: number;
  performance_commission_rate?: number;
  service_details?: Omit<ServiceDB, "id" | "catalog_item_id">;

  // Fields mở rộng từ Product
  selling_price?: number;
  stock_quantity?: number;
  minimum_stock?: number;
  unit?: string;
  product_details?: Omit<ProductDB, "id" | "catalog_item_id">;

  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceInput {
  organization_id?: string;
  branch_id?: string;
  name: string;
  category: string;
  description?: string | null;
  price: number;
  status?: ItemStatus;
  duration_minutes: number;
  sales_commission_rate?: number;
  performance_commission_rate?: number;
}

export type UpdateServiceInput = Partial<CreateServiceInput>;

export interface CreateProductInput {
  organization_id?: string;
  branch_id?: string;
  name: string;
  category: string;
  description?: string | null;
  price?: number;
  selling_price: number;
  status?: ItemStatus;
  stock_quantity: number;
  minimum_stock: number;
  unit: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

// ==========================================
// 2. BRANCH & ORGANIZATION DOMAIN TYPES
// ==========================================

export type BranchStatus = "active" | "inactive" | "ACTIVE" | "INACTIVE";

export interface Branch {
  id: string;
  organization_id?: string;
  name: string;
  code?: string;
  address?: string | null;
  phone?: string | null;
  status?: BranchStatus;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// 3. CUSTOMER DOMAIN TYPES
// ==========================================

export interface Customer {
  id: string;
  organization_id?: string;
  branch_id?: string;
  full_name: string;
  fullName?: string; // Legacy UI field
  phone: string;
  email?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  notes?: string | null;
  tags?: string[];
  loyalty_points?: number;
  loyaltyPoints?: number; // Legacy UI field
  total_spend?: number;
  totalSpend?: number; // Legacy UI field
  last_visit?: string | null;
  lastVisit?: string | null; // Legacy UI field
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomerInput {
  organization_id?: string;
  branch_id?: string;
  full_name: string;
  fullName?: string;
  phone: string;
  email?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  notes?: string | null;
  tags?: string[];
  loyalty_points?: number;
  loyaltyPoints?: number;
  status?: string;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

// ==========================================
// 4. OPERATIONS / EXPENSE / PACKAGE TYPES
// ==========================================

export interface Expense {
  id: string;
  organization_id?: string;
  branch_id?: string;
  category: string;
  amount: number;
  description?: string | null;
  date: string;
  payment_method?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PackageItem {
  catalog_item_id: string;
  quantity: number;
}

export interface PackageTemplate {
  id: string;
  organization_id?: string;
  branch_id?: string;
  name: string;
  description?: string | null;
  price: number;
  total_sessions?: number;
  validity_days?: number;
  status?: string;
  items?: PackageItem[];
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// 5. STAFF DOMAIN TYPES
// ==========================================

export type StaffStatus = "ACTIVE" | "INACTIVE" | "active" | "inactive";

export interface Staff {
  id: string;
  organization_id?: string;
  branch_id?: string;
  profile_id?: string | null;
  full_name: string;
  fullName?: string; // Legacy UI field
  role: string;
  phone: string;
  status: StaffStatus;
  started_on?: string | null;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStaffInput {
  organization_id?: string;
  branch_id?: string;
  full_name: string;
  fullName?: string;
  role: string;
  phone: string;
  status?: StaffStatus;
  started_on?: string | null;
  profile_id?: string | null;
}

export type UpdateStaffInput = Partial<CreateStaffInput>;

############################################################
END FILE: src/types/domain.ts
############################################################

============================================================
EXPORT COMPLETE
============================================================
