// src/pages/POSPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Customer,
  Staff,
  CatalogServiceItem,
  CatalogProductItem,
  CatalogPackageItem,
  CartItem,
  PaymentMethod,
  KTVSplit,
} from "@/types/pos";
import { POSService } from "@/services/pos-service";
import { customerService } from "@/services/customer.service";
import { POSCustomerSelect } from "@/components/pos/POSCustomerSelect";
import { POSCustomerBenefits } from "@/components/pos/POSCustomerBenefits";
import { POSKTVSelector } from "@/components/pos/POSKTVSelector";
import { POSCatalogPicker } from "@/components/pos/POSCatalogPicker";
import { POSCart } from "@/components/pos/POSCart";
import { POSPaymentModal } from "@/components/pos/POSPaymentModal";
import { QRCodeModal } from "@/components/pos/QRCodeModal";
import bankConfig from "@/config/bank";
import { paymentSettingsService } from "@/services/payment-settings.service";
import { useAuth } from "@/context/AuthContext";
import { X, FileText } from "lucide-react";

// ============================================================
// COMPONENT: Invoice History Modal
// ============================================================
interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string | null;
}

const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({
  isOpen,
  onClose,
  customerId,
}) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && customerId) {
      loadInvoices();
    }
  }, [isOpen, customerId]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await customerService.fetchCustomerInvoices(customerId!);
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Lịch sử hóa đơn
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Chưa có hóa đơn nào</div>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm text-slate-800">
                        #{inv.code || inv.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(inv.created_at).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700">{formatVND(inv.total_amount || 0)}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'PARTIALLY_PAID' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {inv.status === 'PAID' ? 'Đã thanh toán' : inv.status === 'PARTIALLY_PAID' ? 'Nợ' : 'Nháp'}
                      </span>
                    </div>
                  </div>
                  {selectedInvoice?.id === inv.id && inv.items && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-xs font-semibold text-slate-600 mb-2">Chi tiết:</div>
                      <div className="space-y-1">
                        {inv.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-700">
                            <span>{item.description || item.item_name || 'Sản phẩm'} x{item.quantity}</span>
                            <span className="font-medium">{formatVND(item.total_amount || 0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN POS PAGE
// ============================================================

export const POSPage: React.FC = () => {
  const { role } = useAuth();
  const isAdminUser = role === 'admin';

  // Data states
  const [services, setServices] = useState<CatalogServiceItem[]>([]);
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [packages, setPackages] = useState<CatalogPackageItem[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loggedStaff, setLoggedStaff] = useState<Staff | null>(null);

  // Customer & cart
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [overallDiscountType, setOverallDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [overallDiscountValue, setOverallDiscountValue] = useState<number>(0);

  const [selectedSellerId, setSelectedSellerId] = useState<string | undefined>(undefined);

  // Bank config
  const [bankConfigState, setBankConfigState] = useState(bankConfig);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isInvoiceHistoryOpen, setIsInvoiceHistoryOpen] = useState(false);
  const [isServiceSelectorOpen, setIsServiceSelectorOpen] = useState(false);
  const [pendingPackage, setPendingPackage] = useState<CatalogPackageItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const isAdmin = loggedStaff?.role === 'admin' || isAdminUser;

  // Tạo Set các ID đã có trong giỏ để highlight
  const cartItemIds = useMemo(() => {
    const ids = new Set<string>();
    cartItems.forEach(item => {
      if (item.catalog_item_id) ids.add(item.catalog_item_id);
      if (item.package_id) ids.add(item.package_id);
      if (item.product_id) ids.add(item.product_id);
    });
    return ids;
  }, [cartItems]);

  // Load bank config
  useEffect(() => {
    loadBankConfig();
  }, []);

  const loadBankConfig = async () => {
    const config = await paymentSettingsService.getBankConfig();
    if (config) {
      setBankConfigState({
        bankName: config.bankName,
        accountNumber: config.accountNumber,
        accountName: config.accountName,
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    const [sData, pData, pkgData, staffData, logged] = await Promise.all([
      POSService.fetchServices(),
      POSService.fetchProducts(),
      POSService.fetchPackages(),
      POSService.fetchStaffList(),
      POSService.getLoggedInStaff(),
    ]);

    const retailProducts = pData.filter(p => p.product_type === 'RETAIL');

    setServices(sData);
    setProducts(retailProducts);
    setPackages(pkgData);
    setStaffList(staffData);
    setLoggedStaff(logged);
    setSelectedSellerId(logged?.id);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showAlert = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const hasPackageInCart = cartItems.some((it) => it.item_type === "PACKAGE");
  const getDefaultSellerId = () => selectedSellerId || loggedStaff?.id || undefined;

  // ========== ADD ITEMS TO CART ==========
  const toggleCartItem = (item: any, type: 'SERVICE' | 'PRODUCT' | 'PACKAGE') => {
    let id: string | undefined;
    if (type === 'SERVICE') id = item.catalog_item_id;
    else if (type === 'PRODUCT') id = item.catalog_item_id;
    else if (type === 'PACKAGE') id = item.package_id || item.id;

    const exists = cartItems.some((cartItem) => {
      if (type === 'SERVICE') return cartItem.catalog_item_id === id;
      if (type === 'PRODUCT') return cartItem.catalog_item_id === id;
      if (type === 'PACKAGE') return cartItem.package_id === id;
      return false;
    });

    if (exists) {
      setCartItems(prev => prev.filter((cartItem) => {
        if (type === 'SERVICE') return cartItem.catalog_item_id !== id;
        if (type === 'PRODUCT') return cartItem.catalog_item_id !== id;
        if (type === 'PACKAGE') return cartItem.package_id !== id;
        return true;
      }));
      showAlert("info", `Đã bỏ "${item.name}" khỏi giỏ`);
    } else {
      if (type === 'SERVICE') {
        handleAddService(item);
      } else if (type === 'PRODUCT') {
        handleAddProduct(item);
      } else if (type === 'PACKAGE') {
        // Kiểm tra nếu package có nhiều service và còn buổi
        handleAddPackageWithServiceSelect(item);
      }
    }
  };

  // 🔥 MỚI: Xử lý thêm package với service selector
  const handleAddPackageWithServiceSelect = (pkg: CatalogPackageItem) => {
    // Nếu chưa có customer, không hỏi use_now
    if (!customer) {
      handleAddPackage(pkg, false);
      return;
    }

    // Nếu chỉ có 1 service, không cần hỏi
    if (pkg.items.length === 1) {
      const shouldUseNow = window.confirm(`Bạn có muốn sử dụng buổi đầu của gói "${pkg.name}" ngay không?`);
      handleAddPackage(pkg, shouldUseNow, pkg.items[0].service_id);
      return;
    }

    // Nếu có nhiều service, mở modal chọn service và use_now
    setPendingPackage(pkg);
    setIsServiceSelectorOpen(true);
  };

  // 🔥 MỚI: Xác định service nào còn buổi để hiển thị
  const getAvailableServices = (pkg: CatalogPackageItem) => {
    // Lọc các service có remaining > 0 (nếu có dữ liệu từ customer)
    // Nếu chưa có customer_package_items, tất cả service đều có buổi
    return pkg.items.map(item => ({
      ...item,
      available: true // Mặc định true, khi có dữ liệu thực tế sẽ lọc
    }));
  };

  const handleAddPackage = (pkg: CatalogPackageItem, useNow: boolean = false, selectedServiceId?: string) => {
    // Nếu useNow nhưng chưa có service, báo lỗi
    if (useNow && pkg.items.length > 1 && !selectedServiceId) {
      showAlert("error", "Vui lòng chọn dịch vụ sử dụng buổi đầu");
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find(
        (it) => it.item_type === "PACKAGE" && it.package_id === pkg.id,
      );
      if (existing) {
        const nextQty = existing.quantity + 1;
        return prev.map((it) =>
          it.cart_item_id === existing.cart_item_id
            ? {
                ...it,
                quantity: nextQty,
                total_amount: Math.round(
                  nextQty * it.unit_price - it.discount_amount,
                ),
              }
            : it,
        );
      }

      const selectedStaffId = getDefaultSellerId();

      // Nếu useNow và có selectedServiceId, tìm service tương ứng
      const actualService = selectedServiceId 
        ? pkg.items.find(item => item.service_id === selectedServiceId)
        : (pkg.items.length === 1 ? pkg.items[0] : null);

      const newItem: CartItem = {
        cart_item_id: `pkg_${Date.now()}_${Math.random()}`,
        item_type: "PACKAGE",
        package_id: pkg.id,
        name: pkg.name,
        quantity: 1,
        unit_price: pkg.price,
        discount_amount: 0,
        total_amount: pkg.price,
        package_items: pkg.items,
        seller_staff_id: selectedStaffId,
        sales_commission_type: pkg.sales_commission_type,
        sales_commission_value: pkg.sales_commission_value,
        use_package: false,
        use_now: useNow,
        actual_service_id: actualService?.service_id || null,
        actual_service_name: actualService?.service_name || null,
        ktv_splits: selectedStaffId ? [{ staff_id: selectedStaffId, staff_name: loggedStaff?.full_name || "KTV", share_percent: 100 }] : [],
        performing_staff_id: selectedStaffId,
      };
      return [...prev, newItem];
    });

    const msg = useNow 
      ? `Đã thêm gói "${pkg.name}" vào giỏ (sẽ sử dụng ${pkg.items.find(i => i.service_id === selectedServiceId)?.service_name || 'dịch vụ'} ngay)`
      : `Đã thêm gói "${pkg.name}" vào giỏ`;
    showAlert("info", msg);
  };

  // ========== HANDLERS ==========
  const handleAddService = (service: CatalogServiceItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (it) => it.item_type === "SERVICE" && it.catalog_item_id === service.catalog_item_id,
      );
      if (existing) {
        return prev.map((it) =>
          it.cart_item_id === existing.cart_item_id
            ? {
                ...it,
                quantity: it.quantity + 1,
                total_amount: Math.round(
                  (it.quantity + 1) * it.unit_price - it.discount_amount,
                ),
              }
            : it,
        );
      }

      const selectedStaffId = getDefaultSellerId();
      let defaultSplits: KTVSplit[] = [];
      if (selectedStaffId) {
        const staffName = staffList.find(s => s.id === selectedStaffId)?.full_name || loggedStaff?.full_name || "KTV";
        defaultSplits = [{ staff_id: selectedStaffId, staff_name: staffName, share_percent: 100 }];
      }

      const newItem: CartItem = {
        cart_item_id: `srv_${Date.now()}_${Math.random()}`,
        item_type: "SERVICE",
        catalog_item_id: service.catalog_item_id,
        actual_service_id: service.id,
        name: service.name,
        quantity: 1,
        unit_price: service.price,
        discount_amount: 0,
        total_amount: service.price,
        seller_staff_id: selectedStaffId,
        performing_staff_id: selectedStaffId,
        sales_commission_type: service.sales_commission_type,
        sales_commission_value: service.sales_commission_value,
        performance_commission_type: service.performance_commission_type,
        performance_commission_value: service.performance_commission_value,
        ktv_splits: defaultSplits,
      };
      return [...prev, newItem];
    });
  };

  const handleAddProduct = (product: CatalogProductItem) => {
    if (product.stock_quantity <= 0) {
      showAlert("error", `Sản phẩm "${product.name}" đã hết hàng!`);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find(
        (it) => it.item_type === "PRODUCT" && it.product_id === product.id,
      );
      if (existing) {
        if (existing.quantity + 1 > product.stock_quantity) {
          showAlert("error", `Không thể thêm quá số lượng tồn kho (${product.stock_quantity})!`);
          return prev;
        }
        const nextQty = existing.quantity + 1;
        return prev.map((it) =>
          it.cart_item_id === existing.cart_item_id
            ? {
                ...it,
                quantity: nextQty,
                total_amount: Math.round(
                  nextQty * it.unit_price - it.discount_amount,
                ),
              }
            : it,
        );
      }

      const selectedStaffId = getDefaultSellerId();
      const newItem: CartItem = {
        cart_item_id: `prd_${Date.now()}_${Math.random()}`,
        item_type: "PRODUCT",
        catalog_item_id: product.catalog_item_id,
        product_id: product.id,
        name: product.name,
        quantity: 1,
        unit_price: product.selling_price,
        discount_amount: 0,
        total_amount: product.selling_price,
        stock_quantity: product.stock_quantity,
        unit: product.unit,
        product_type: product.product_type,
        seller_staff_id: selectedStaffId,
        sales_commission_type: product.sales_commission_type,
        sales_commission_value: product.sales_commission_value,
      };
      return [...prev, newItem];
    });
  };

  // ========== PACKAGE USAGE (thêm vào giỏ, không thu tiền) ==========
  const handleUsePackageItem = (customerPackageId: string, customerPackageItemId: string, serviceName: string, serviceId: string, remaining: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) {
      showAlert("error", "Không tìm thấy dịch vụ này trong danh mục");
      return;
    }

    const exists = cartItems.some(item => 
      item.use_package && 
      item.customer_package_id === customerPackageId && 
      item.package_item_id === customerPackageItemId
    );
    if (exists) {
      showAlert("warning", "Dịch vụ này đã được thêm vào giỏ");
      return;
    }

    const selectedStaffId = getDefaultSellerId();
    let defaultSplits: KTVSplit[] = [];
    if (selectedStaffId) {
      const staffName = staffList.find(s => s.id === selectedStaffId)?.full_name || loggedStaff?.full_name || "KTV";
      defaultSplits = [{ staff_id: selectedStaffId, staff_name: staffName, share_percent: 100 }];
    }

    const originalPrice = service.price;

    const newItem: CartItem = {
      cart_item_id: `pkg_use_${Date.now()}_${Math.random()}`,
      item_type: "SERVICE",
      catalog_item_id: service.catalog_item_id,
      actual_service_id: service.id,
      name: `📦 ${serviceName} (Dùng gói)`,
      quantity: 1,
      unit_price: originalPrice,
      discount_amount: 0,
      total_amount: 0,
      seller_staff_id: selectedStaffId,
      performing_staff_id: selectedStaffId,
      sales_commission_type: service.sales_commission_type,
      sales_commission_value: 0,
      performance_commission_type: service.performance_commission_type,
      performance_commission_value: service.performance_commission_value,
      ktv_splits: defaultSplits,
      use_package: true,
      customer_package_id: customerPackageId,
      package_item_id: customerPackageItemId,
      is_gift: false,
    };
    setCartItems(prev => [...prev, newItem]);
    showAlert("success", `Đã thêm "${serviceName}" vào giỏ (sử dụng gói)`);
  };

  // ========== CART OPERATIONS ==========
  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }

    const item = cartItems.find((it) => it.cart_item_id === cartItemId);
    if (item && item.item_type === "PRODUCT" && item.stock_quantity && newQty > item.stock_quantity) {
      showAlert("error", `Số lượng vượt quá tồn kho (${item.stock_quantity})!`);
      return;
    }

    if (item?.use_package) {
      showAlert("warning", "Không thể tăng số lượng cho dịch vụ dùng gói");
      return;
    }

    setCartItems((prev) =>
      prev.map((it) =>
        it.cart_item_id === cartItemId
          ? {
              ...it,
              quantity: newQty,
              total_amount: Math.round(
                newQty * it.unit_price - it.discount_amount,
              ),
            }
          : it,
      ),
    );
  };

  const handleUpdateDiscount = (cartItemId: string, discount: number) => {
    setCartItems((prev) =>
      prev.map((it) =>
        it.cart_item_id === cartItemId
          ? {
              ...it,
              discount_amount: discount,
              total_amount: Math.max(
                0,
                Math.round(it.quantity * it.unit_price - discount),
              ),
            }
          : it,
      ),
    );
  };

  const handleUpdateSellerStaff = (cartItemId: string, staffId: string) => {
    setCartItems((prev) =>
      prev.map((it) => {
        if (it.cart_item_id !== cartItemId) return it;
        const updated = { ...it, seller_staff_id: staffId };
        if (it.item_type === "SERVICE") {
          const staffName = staffList.find(s => s.id === staffId)?.full_name || "KTV";
          updated.ktv_splits = [{ staff_id: staffId, staff_name: staffName, share_percent: 100 }];
          updated.performing_staff_id = staffId;
        }
        return updated;
      }),
    );
  };

  const handleUpdateKTYSplits = (cartItemId: string, splits: KTVSplit[]) => {
    setCartItems((prev) =>
      prev.map((it) =>
        it.cart_item_id === cartItemId
          ? { ...it, ktv_splits: splits }
          : it,
      ),
    );
  };

  const handleUpdateUseNow = (cartItemId: string, useNow: boolean) => {
    setCartItems(prev =>
      prev.map(item =>
        item.cart_item_id === cartItemId
          ? { ...item, use_now: useNow }
          : item
      )
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((it) => it.cart_item_id !== cartItemId));
  };

  // ========== DISCOUNT ==========
  const handleOverallDiscountChange = (type: 'percent' | 'fixed', value: number) => {
    setOverallDiscountType(type);
    setOverallDiscountValue(value);
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_amount, 0);
    let discountAmount = 0;
    if (type === 'percent') {
      discountAmount = Math.round((subtotal * value) / 100);
    } else {
      discountAmount = Math.min(value, subtotal);
    }
    setOverallDiscount(discountAmount);
  };

  // ========== TOTALS ==========
  const subtotal = cartItems.reduce((sum, item) => sum + item.total_amount, 0);
  const totalDiscount = overallDiscount;
  const finalTotal = Math.max(0, subtotal - totalDiscount);

  // ========== CHECKOUT ==========
  const handleSaveDraft = async () => {
    if (cartItems.length === 0) {
      showAlert("error", "Giỏ hàng đang trống!");
      return;
    }

    if (hasPackageInCart && !customer) {
      showAlert("error", "Gói dịch vụ (Package) bắt buộc phải chọn Khách hàng!");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      customer_id: customer?.id || null,
      seller_staff_id: getDefaultSellerId() || null,
      status: "DRAFT" as const,
      subtotal,
      discount_amount: totalDiscount,
      total_amount: finalTotal,
      payment_method: "CASH" as PaymentMethod,
      items: cartItems.map((it) => ({
        catalog_item_id: it.catalog_item_id || null,
        package_id: it.package_id || null,
        actual_service_id: it.actual_service_id || null,
        seller_staff_id: it.seller_staff_id || getDefaultSellerId() || null,
        performing_staff_id: it.performing_staff_id || null,
        description: it.name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        discount_amount: it.discount_amount,
        total_amount: it.total_amount,
        is_gift: false,
        use_package: it.use_package || false,
        customer_package_id: it.customer_package_id,
        package_item_id: it.package_item_id,
        ktv_splits: it.ktv_splits,
        use_now: it.use_now || false,
        actual_service_id: it.actual_service_id || null,
      })),
    };

    const res = await POSService.createDraftInvoice(payload);
    setIsSubmitting(false);

    if (res.success) {
      showAlert("success", `Đã lưu đơn NHÁP thành công! (Mã: ${res.invoice_id?.slice(0, 8)})`);
      setCartItems([]);
      setCustomer(null);
      setOverallDiscount(0);
      setOverallDiscountValue(0);
    } else {
      showAlert("error", res.error || "Lưu đơn nháp thất bại!");
    }
  };

  const handleOpenPayment = () => {
    if (cartItems.length === 0) {
      showAlert("error", "Giỏ hàng đang trống!");
      return;
    }

    if (hasPackageInCart && !customer) {
      showAlert("error", "Gói dịch vụ (Package) bắt buộc phải chọn Khách hàng trước khi thanh toán!");
      return;
    }

    for (const item of cartItems) {
      if (item.item_type === "SERVICE" && item.ktv_splits && item.ktv_splits.length > 0) {
        const totalShare = item.ktv_splits.reduce((sum, s) => sum + s.share_percent, 0);
        if (Math.abs(totalShare - 100) > 0.01) {
          showAlert("error", `Tổng tỷ lệ chia KTV cho "${item.name}" phải bằng 100% (hiện tại ${totalShare}%)`);
          return;
        }
      }
    }

    // Nếu chỉ có package usage (total=0), bỏ qua payment modal
    const hasOnlyPackageUsage = cartItems.length > 0 && cartItems.every(item => item.use_package === true);
    if (hasOnlyPackageUsage && finalTotal === 0) {
      handleConfirmPayment('CASH', 0, 'Sử dụng gói');
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (
    method: PaymentMethod,
    paidAmount: number,
    notes?: string,
  ) => {
    setIsSubmitting(true);

    const isGift = method === "GIFT";
    const finalTotalAmount = (isGift || finalTotal === 0) ? 0 : finalTotal;
    const isDebt = method === "DEBT";
    const actualPaidAmount = isDebt ? paidAmount : finalTotalAmount;

    const payload = {
      customer_id: customer?.id || null,
      seller_staff_id: getDefaultSellerId() || null,
      status: (isDebt ? "PARTIALLY_PAID" : "PAID") as const,
      subtotal,
      discount_amount: totalDiscount,
      total_amount: finalTotalAmount,
      payment_method: method,
      notes: notes || undefined,
      is_gift: isGift,
      paid_amount: actualPaidAmount,
      items: cartItems.map((it) => ({
        catalog_item_id: it.catalog_item_id || null,
        package_id: it.package_id || null,
        actual_service_id: it.actual_service_id || null,
        seller_staff_id: it.seller_staff_id || getDefaultSellerId() || null,
        performing_staff_id: it.performing_staff_id || null,
        description: it.name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        discount_amount: it.discount_amount,
        total_amount: isGift ? 0 : it.total_amount,
        is_gift: isGift,
        use_package: it.use_package || false,
        customer_package_id: it.customer_package_id,
        package_item_id: it.package_item_id,
        ktv_splits: it.ktv_splits,
        use_now: it.use_now || false,
        actual_service_id: it.actual_service_id || null,
      })),
    };

    const res = await POSService.processCheckout(cartItems, payload);

    setIsSubmitting(false);
    setIsPaymentModalOpen(false);
    setIsQRModalOpen(false);

    if (res.success) {
      showAlert(
        "success",
        isGift
          ? `Đã tặng gói thành công! Mã: #${res.invoice_id?.slice(0, 8)}`
          : `Thanh toán thành công! Hóa đơn #${res.invoice_id?.slice(0, 8)} đã ghi nhận.`,
      );
      setCartItems([]);
      setCustomer(null);
      setOverallDiscount(0);
      setOverallDiscountValue(0);
      loadData();
    } else {
      showAlert("error", res.error || "Thanh toán thất bại!");
    }
  };

  const handleQRConfirm = () => {
    setIsQRModalOpen(false);
    handleConfirmPayment('BANK_TRANSFER', finalTotal, 'Thanh toán qua QR');
  };

  const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-4 font-sans text-slate-800">
      {notification && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-3 rounded-xl shadow-2xl border text-sm font-semibold flex items-center gap-2 transition-all max-w-[90%] ${
            notification.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700"
              : notification.type === "info"
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-red-600 text-white border-red-700"
          }`}
        >
          {notification.type === "success" ? "✅" : notification.type === "info" ? "ℹ️" : "⚠️"} {notification.message}
        </div>
      )}

      <header className="bg-white rounded-xl border border-slate-200 p-3 mb-3 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-600/30">
            M
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm sm:text-base">
              POS Thu Ngân
            </h1>
            <p className="text-[10px] text-slate-500">
              Sale: {loggedStaff?.full_name || "Chưa xác định"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500">NV:</span>
            <select
              value={selectedSellerId || ""}
              onChange={(e) => setSelectedSellerId(e.target.value || undefined)}
              className="border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-emerald-500 max-w-[100px]"
            >
              <option value="">-- Chọn --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-medium transition-all"
          >
            🔄 Tải lại
          </button>

          {customer && (
            <button
              onClick={() => setIsInvoiceHistoryOpen(true)}
              className="px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-medium hover:bg-blue-200 transition-all"
            >
              📋 HĐ
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 font-medium">
          Đang tải dữ liệu POS...
        </div>
      ) : (
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:gap-4">
          <div className="lg:col-span-7 space-y-3 order-1">
            <POSCustomerSelect
              selectedCustomer={customer}
              onSelectCustomer={setCustomer}
              hasPackageInCart={hasPackageInCart}
            />

            {customer && (
              <POSCustomerBenefits
                customer={customer}
                onUsePackageItem={handleUsePackageItem}
                onSelectGift={() => {}}
                onPayDebt={() => {}}
              />
            )}

            <POSCatalogPicker
              services={services}
              products={products}
              packages={packages}
              onAddService={(item) => toggleCartItem(item, 'SERVICE')}
              onAddProduct={(item) => toggleCartItem(item, 'PRODUCT')}
              onAddPackage={(item) => toggleCartItem(item, 'PACKAGE')}
              cartItemIds={cartItemIds}
            />
          </div>

          <div className="lg:col-span-5 space-y-3 order-2 lg:order-2">
            <POSCart
              items={cartItems}
              staffList={staffList}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateDiscount={handleUpdateDiscount}
              onUpdateSellerStaff={handleUpdateSellerStaff}
              onUpdatePerformingStaff={() => {}}
              onRemoveItem={handleRemoveItem}
              onOverallDiscountChange={handleOverallDiscountChange}
              overallDiscountType={overallDiscountType}
              overallDiscountValue={overallDiscountValue}
              isAdmin={isAdmin}
              loggedStaffName={loggedStaff?.full_name}
              onUpdateUseNow={handleUpdateUseNow}
            />

            {cartItems
              .filter((item) => item.item_type === "SERVICE" && !item.use_package && item.total_amount > 0)
              .map((item) => {
                const totalComm = item.performance_commission_type === "PERCENT"
                  ? Math.round((item.total_amount * Math.min(100, Math.max(0, Number(item.performance_commission_value || 0)))) / 100)
                  : Math.max(0, Number(item.performance_commission_value || 0)) * item.quantity;
                return (
                  <div key={item.cart_item_id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      Phân công KTV cho "{item.name}"
                    </div>
                    <POSKTVSelector
                      staffList={staffList}
                      selectedSplits={item.ktv_splits || []}
                      onSplitsChange={(splits) => handleUpdateKTYSplits(item.cart_item_id, splits)}
                      totalCommission={totalComm}
                    />
                  </div>
                );
              })}

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính (Subtotal):</span>
                <span className="font-semibold text-slate-800">{formatVND(subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Giảm giá:</span>
                <span className="font-semibold text-red-600">-{formatVND(totalDiscount)}</span>
              </div>

              <div className="flex justify-between items-center text-base font-extrabold text-emerald-800 border-t border-slate-200 pt-2">
                <span>THÀNH TIỀN:</span>
                <span className="text-lg">{formatVND(finalTotal)}</span>
              </div>
              {finalTotal === 0 && cartItems.some(item => item.use_package) && (
                <div className="text-[10px] text-blue-600 bg-blue-50 p-1 rounded text-center">
                  ℹ️ Đơn hàng sử dụng gói, không thu tiền
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSubmitting || cartItems.length === 0}
                onClick={handleSaveDraft}
                className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
              >
                💾 Lưu Nháp
              </button>

              <button
                type="button"
                disabled={isSubmitting || cartItems.length === 0}
                onClick={handleOpenPayment}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
              >
                💳 Thanh Toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SERVICE SELECTOR MODAL ===== */}
      {isServiceSelectorOpen && pendingPackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                Chọn dịch vụ sử dụng buổi đầu
              </h3>
              <button onClick={() => { setIsServiceSelectorOpen(false); setPendingPackage(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500">Gói: <strong>{pendingPackage.name}</strong></div>

            <div className="space-y-2">
              {pendingPackage.items.map((item) => (
                <button
                  key={item.service_id}
                  onClick={() => {
                    const shouldUseNow = window.confirm(`Sử dụng "${item.service_name}" ngay?`);
                    handleAddPackage(pendingPackage, shouldUseNow, item.service_id);
                    setIsServiceSelectorOpen(false);
                    setPendingPackage(null);
                  }}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 hover:border-emerald-500 transition-all text-left flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{item.service_name}</div>
                    <div className="text-xs text-slate-500">
                      {item.quantity} buổi trong gói
                    </div>
                  </div>
                  <button className="text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-1 rounded-full">
                    Chọn
                  </button>
                </button>
              ))}
            </div>

            <button
              onClick={() => { setIsServiceSelectorOpen(false); setPendingPackage(null); }}
              className="w-full py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* ===== POS PAYMENT MODAL ===== */}
      <POSPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        customer={customer}
        items={cartItems}
        subtotal={subtotal}
        discountAmount={totalDiscount}
        totalAmount={finalTotal}
        staffList={staffList}
        onConfirmPayment={handleConfirmPayment}
        isSubmitting={isSubmitting}
        qrCodeUrl={undefined}
      />

      {/* ===== INVOICE HISTORY MODAL ===== */}
      <InvoiceHistoryModal
        isOpen={isInvoiceHistoryOpen}
        onClose={() => setIsInvoiceHistoryOpen(false)}
        customerId={customer?.id}
      />
    </div>
  );
};

export default POSPage;