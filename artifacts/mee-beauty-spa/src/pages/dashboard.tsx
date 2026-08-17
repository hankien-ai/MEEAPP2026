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