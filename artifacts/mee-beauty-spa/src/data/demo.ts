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