# POS PAGE
===== artifacts/mee-beauty-spa/src/pages/POSPage.tsx =====
import React, { useState, useEffect } from 'react';
import {
  Customer,
  Staff,
  CatalogServiceItem,
  CatalogProductItem,
  CatalogPackageItem,
  CartItem,
  PaymentMethod
} from '@/types/pos';
import { POSService } from '@/services/pos-service';
import { POSCustomerSelect } from '@/components/pos/POSCustomerSelect';
import { POSCatalogPicker } from '@/components/pos/POSCatalogPicker';
import { POSCart } from '@/components/pos/POSCart';
import { POSPaymentModal } from '@/components/pos/POSPaymentModal';

export const POSPage: React.FC = () => {
  const [services, setServices] = useState<CatalogServiceItem[]>([]);
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [packages, setPackages] = useState<CatalogPackageItem[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const defaultOrgId = '00000000-0000-0000-0000-000000000000';
  const defaultBranchId = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [sData, pData, pkgData, staffData] = await Promise.all([
      POSService.fetchServices(),
      POSService.fetchProducts(),
      POSService.fetchPackages(),
      POSService.fetchStaffList()
    ]);

    setServices(sData);
    setProducts(pData);
    setPackages(pkgData);
    setStaffList(staffData);
    setLoading(false);
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const hasPackageInCart = cartItems.some((it) => it.item_type === 'PACKAGE');

  const handleAddService = (service: CatalogServiceItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (it) => it.item_type === 'SERVICE' && it.catalog_item_id === service.id
      );
      if (existing) {
        return prev.map((it) =>
          it.cart_item_id === existing.cart_item_id
            ? {
                ...it,
                quantity: it.quantity + 1,
                total_amount: Math.round((it.quantity + 1) * it.unit_price - it.discount_amount)
              }
            : it
        );
      }

      const newItem: CartItem = {
        cart_item_id: `srv_${Date.now()}_${Math.random()}`,
        item_type: 'SERVICE',
        catalog_item_id: service.id,
        actual_service_id: service.id,
        name: service.name,
        quantity: 1,
        unit_price: service.price,
        discount_amount: 0,
        total_amount: service.price
      };
      return [...prev, newItem];
    });
  };

  const handleAddProduct = (product: CatalogProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (it) => it.item_type === 'PRODUCT' && it.product_id === product.id
      );
      if (existing) {
        const nextQty = existing.quantity + 1;
        return prev.map((it) =>
          it.cart_item_id === existing.cart_item_id
            ? {
                ...it,
                quantity: nextQty,
                total_amount: Math.round(nextQty * it.unit_price - it.discount_amount)
              }
            : it
        );
      }

      const newItem: CartItem = {
        cart_item_id: `prd_${Date.now()}_${Math.random()}`,
        item_type: 'PRODUCT',
        catalog_item_id: product.catalog_item_id,
        product_id: product.id,
        name: product.name,
        quantity: 1,
        unit_price: product.selling_price,
        discount_amount: 0,
        total_amount: product.selling_price,
        stock_quantity: product.stock_quantity,
        unit: product.unit,
        product_type: product.product_type
      };
      return [...prev, newItem];
    });
  };

  const handleAddPackage = (pkg: CatalogPackageItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (it) => it.item_type === 'PACKAGE' && it.package_id === pkg.id
      );
      if (existing) {
        const nextQty = existing.quantity + 1;
        return prev.map((it) =>
          it.cart_item_id === existing.cart_item_id
            ? {
                ...it,
                quantity: nextQty,
                total_amount: Math.round(nextQty * it.unit_price - it.discount_amount)
              }
            : it
        );
      }

      const newItem: CartItem = {
        cart_item_id: `pkg_${Date.now()}_${Math.random()}`,
        item_type: 'PACKAGE',
        package_id: pkg.id,
        name: pkg.name,
        quantity: 1,
        unit_price: pkg.price,
        discount_amount: 0,
        total_amount: pkg.price,
        package_items: pkg.items
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((it) =>
        it.cart_item_id === cartItemId
          ? {
              ...it,
              quantity: newQty,
              total_amount: Math.round(newQty * it.unit_price - it.discount_amount)
            }
          : it
      )
    );
  };

  const handleUpdateDiscount = (cartItemId: string, discount: number) => {
    setCartItems((prev) =>
      prev.map((it) =>
        it.cart_item_id === cartItemId
          ? {
              ...it,
              discount_amount: discount,
              total_amount: Math.max(0, Math.round(it.quantity * it.unit_price - discount))
            }
          : it
      )
    );
  };

  const handleUpdateSellerStaff = (cartItemId: string, staffId: string) => {
    setCartItems((prev) =>
      prev.map((it) => (it.cart_item_id === cartItemId ? { ...it, seller_staff_id: staffId } : it))
    );
  };

  const handleUpdatePerformingStaff = (cartItemId: string, staffId: string) => {
    setCartItems((prev) =>
      prev.map((it) => (it.cart_item_id === cartItemId ? { ...it, performing_staff_id: staffId } : it))
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((it) => it.cart_item_id !== cartItemId));
  };

  const { subtotal, discount_amount: totalDiscount, total_amount: finalTotal } = POSService.calculateTotals(
    cartItems,
    overallDiscount
  );

  const handleSaveDraft = async () => {
    if (cartItems.length === 0) {
      showAlert('error', 'Giỏ hàng đang trống!');
      return;
    }

    if (hasPackageInCart && !customer) {
      showAlert('error', 'Đơn hàng có Gói dịch vụ (Package) — Bắt buộc phải chọn khách hàng!');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      organization_id: defaultOrgId,
      branch_id: defaultBranchId,
      customer_id: customer?.id || null,
      seller_staff_id: cartItems[0]?.seller_staff_id || null,
      status: 'DRAFT' as const,
      subtotal,
      discount_amount: totalDiscount,
      total_amount: finalTotal,
      payment_method: paymentMethod,
      items: cartItems.map((it) => ({
        catalog_item_id: it.catalog_item_id || null,
        package_id: it.package_id || null,
        actual_service_id: it.actual_service_id || null,
        seller_staff_id: it.seller_staff_id || null,
        performing_staff_id: it.performing_staff_id || null,
        description: it.name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        discount_amount: it.discount_amount,
        total_amount: it.total_amount
      }))
    };

    const res = await POSService.createDraftInvoice(payload);

    setIsSubmitting(false);

    if (res.success) {
      showAlert('success', `Đã lưu đơn NHÁP thành công! (ID: ${res.invoice_id?.slice(0, 8)})`);
      setCartItems([]);
      setCustomer(null);
      setOverallDiscount(0);
    } else {
      showAlert('error', res.error || 'Lưu đơn nháp thất bại!');
    }
  };

  const handleOpenPayment = () => {
    if (cartItems.length === 0) {
      showAlert('error', 'Giỏ hàng đang trống!');
      return;
    }

    if (hasPackageInCart && !customer) {
      showAlert('error', 'Gói dịch vụ (Package) bắt buộc phải chọn khách hàng trước khi thanh toán!');
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (method: PaymentMethod, _cashGiven: number) => {
    setPaymentMethod(method);
    setIsSubmitting(true);

    const payload = {
      organization_id: defaultOrgId,
      branch_id: defaultBranchId,
      customer_id: customer?.id || null,
      seller_staff_id: cartItems[0]?.seller_staff_id || null,
      status: 'DRAFT' as const,
      subtotal,
      discount_amount: totalDiscount,
      total_amount: finalTotal,
      payment_method: method,
      items: cartItems.map((it) => ({
        catalog_item_id: it.catalog_item_id || null,
        package_id: it.package_id || null,
        actual_service_id: it.actual_service_id || null,
        seller_staff_id: it.seller_staff_id || null,
        performing_staff_id: it.performing_staff_id || null,
        description: it.name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        discount_amount: it.discount_amount,
        total_amount: it.total_amount
      }))
    };

    const res = await POSService.createDraftInvoice(payload);

    setIsSubmitting(false);
    setIsPaymentModalOpen(false);

    if (res.success) {
      showAlert('success', `Tạo hóa đơn thành công! (ID: ${res.invoice_id?.slice(0, 8)})`);
      setCartItems([]);
      setCustomer(null);
      setOverallDiscount(0);
    } else {
      showAlert('error', res.error || 'Thanh toán thất bại!');
    }
  };

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans text-slate-800">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border text-sm font-semibold flex items-center gap-2 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-red-600 text-white border-red-700'
          }`}
        >
          {notification.type === 'success' ? '✅' : '⚠️'} {notification.message}
        </div>
      )}

      <header className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/30">
            M
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg">MEE BEAUTY SPA — POS bán hàng</h1>
            <p className="text-xs text-slate-500">Hệ thống thu ngân & Quản lý bán hàng</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-all"
          >
            🔄 Tải lại dữ liệu
          </button>
        </div>
      </header>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 font-medium">
          Đang tải dữ liệu POS...
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7 space-y-4">
            <POSCustomerSelect
              selectedCustomer={customer}
              onSelectCustomer={setCustomer}
              hasPackageInCart={hasPackageInCart}
            />

            <POSCatalogPicker
              services={services}
              products={products}
              packages={packages}
              onAddService={handleAddService}
              onAddProduct={handleAddProduct}
              onAddPackage={handleAddPackage}
            />
          </div>

          <div className="col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <POSCart
                items={cartItems}
                staffList={staffList}
                onUpdateQuantity={handleUpdateQuantity}
                onUpdateDiscount={handleUpdateDiscount}
                onUpdateSellerStaff={handleUpdateSellerStaff}
                onUpdatePerformingStaff={handleUpdatePerformingStaff}
                onRemoveItem={handleRemoveItem}
              />

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính (Subtotal):</span>
                  <span className="font-semibold text-slate-800">{formatVND(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Giảm giá tổng đơn (Discount):</span>
                  <input
                    type="number"
                    value={overallDiscount}
                    onChange={(e) => setOverallDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-28 text-right p-1 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                  />
                </div>

                <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-2">
                  <span>Tổng giảm giá:</span>
                  <span className="font-semibold text-red-600">-{formatVND(totalDiscount)}</span>
                </div>

                <div className="flex justify-between items-center text-base font-extrabold text-emerald-800 border-t border-slate-200 pt-2">
                  <span>THÀNH TIỀN:</span>
                  <span className="text-lg">{formatVND(finalTotal)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting || cartItems.length === 0}
                onClick={handleSaveDraft}
                className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
              >
                💾 Lưu Đơn Nháp
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
      />
    </div>
  );
};