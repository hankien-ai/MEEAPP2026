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