// src/constants/modules.ts
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Sliders,
  UserCog,
  Settings,
  FileText,
  BarChart3,
  Grid,
  DollarSign,
  Calendar, // <-- Thêm
  ClipboardCheck, // <-- Thêm
  type LucideIcon,
} from 'lucide-react';

export interface Module {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
}

export const ALL_MODULES: Module[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
  { id: 'customers', label: 'Khách hàng', icon: Users, route: '/customers' },
  { id: 'pos', label: 'POS', icon: ShoppingCart, route: '/pos' },
  { id: 'catalog', label: 'Danh mục', icon: Package, route: '/catalog' },
  { id: 'operations', label: 'Vận hành', icon: Sliders, route: '/operations' },
  { id: 'staff', label: 'Nhân viên', icon: UserCog, route: '/staff' },
  { id: 'payroll', label: 'Bảng lương', icon: DollarSign, route: '/payroll' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, route: '/settings' },
  { id: 'invoices', label: 'Hóa đơn', icon: FileText, route: '/invoices' },
  { id: 'reports', label: 'Báo cáo', icon: BarChart3, route: '/reports' },
  { id: 'extension', label: 'Mở rộng', icon: Grid, route: '/extension' },
  { id: 'appointments', label: 'Lịch hẹn', icon: Calendar, route: '/appointments' }, // <-- Thêm
  { id: 'tasks', label: 'Công việc', icon: ClipboardCheck, route: '/tasks' }, // <-- Thêm
];

export type ModuleId = typeof ALL_MODULES[number]['id'];

export const DEFAULT_QUICK_BUTTONS: ModuleId[] = ['dashboard', 'customers', 'pos', 'staff', 'payroll', 'appointments', 'tasks', 'extension'];