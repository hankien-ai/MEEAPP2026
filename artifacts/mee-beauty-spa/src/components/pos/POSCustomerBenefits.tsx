// src/components/pos/POSCustomerBenefits.tsx
import React, { useState, useEffect } from "react";
import { Customer } from "@/types/pos";
import { customerService } from "@/services/customer.service";
import { Package, Gift, CreditCard, ChevronDown, ChevronUp } from "lucide-react";

interface CustomerPackageItem {
  id: string;
  customer_package_id: string;
  package_item_id: string;
  total_quantity: number;
  used_quantity: number;
  remaining_quantity: number;
  service_name?: string;
  service_id?: string;
}

interface CustomerPackage {
  id: string;
  package_id: string;
  package_name?: string;
  total_sessions: number;
  remaining_sessions: number;
  status: string;
  is_gift?: boolean;
  expires_at: string | null;
  items: CustomerPackageItem[];
}

interface Props {
  customer: Customer | null;
  onUsePackageItem: (customerPackageId: string, customerPackageItemId: string, serviceName: string, serviceId: string, remaining: number) => void;
  onSelectGift: () => void;
  onPayDebt: () => void;
}

export const POSCustomerBenefits: React.FC<Props> = ({
  customer,
  onUsePackageItem,
  onSelectGift,
  onPayDebt,
}) => {
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<CustomerPackage[]>([]);
  const [gifts, setGifts] = useState<CustomerPackage[]>([]);
  const [debtAmount, setDebtAmount] = useState<number>(0);
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      loadCustomerBenefits();
    } else {
      setPackages([]);
      setGifts([]);
      setDebtAmount(0);
    }
  }, [customer]);

  const loadCustomerBenefits = async () => {
    if (!customer) return;
    setLoading(true);
    try {
      const data = await customerService.fetchCustomerPackageWithItems(customer.id);
      const activePackages = data.filter((pkg) => pkg.status === "ACTIVE" && pkg.remaining_sessions > 0);
      const giftPackages = activePackages.filter((pkg) => pkg.is_gift === true);
      const purchasedPackages = activePackages.filter((pkg) => pkg.is_gift !== true);

      const mappedPackages = purchasedPackages.map((pkg) => ({
        ...pkg,
        items: pkg.items.map((item: any) => ({
          ...item,
          service_name: item.service_name || "Dịch vụ",
          service_id: item.service_id,
        })),
      }));
      const mappedGifts = giftPackages.map((pkg) => ({
        ...pkg,
        items: pkg.items.map((item: any) => ({
          ...item,
          service_name: item.service_name || "Dịch vụ",
          service_id: item.service_id,
        })),
      }));

      setPackages(mappedPackages);
      setGifts(mappedGifts);

      // 🔥 SỬA: chỉ lấy PARTIALLY_PAID
      const invoices = await customerService.fetchCustomerInvoices(customer.id);
      const totalDebt = invoices
        .filter((inv) => inv.status === "PARTIALLY_PAID")
        .reduce((sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)), 0);
      setDebtAmount(totalDebt);
    } catch (err) {
      console.error("Lỗi tải quyền lợi khách hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

  if (!customer) return null;
  if (loading) return <div className="p-3 text-xs text-slate-500">Đang tải quyền lợi...</div>;

  const hasBenefits = packages.length > 0 || gifts.length > 0 || debtAmount > 0;
  if (!hasBenefits) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-3 text-xs text-slate-400 text-center">
        Khách hàng chưa có gói dịch vụ, quà tặng hay công nợ
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 mb-3 space-y-3 max-h-[300px] overflow-y-auto">
      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quyền lợi của khách</div>

      {/* PACKAGES */}
      {packages.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            Gói đã mua ({packages.length})
          </div>
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpandedPkg(expandedPkg === pkg.id ? null : pkg.id)}
                className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800">{pkg.package_name || "Gói dịch vụ"}</div>
                  <div className="text-xs text-slate-500">
                    Còn {pkg.remaining_sessions} buổi · Hạn: {pkg.expires_at ? new Date(pkg.expires_at).toLocaleDateString("vi-VN") : "Không giới hạn"}
                  </div>
                </div>
                {expandedPkg === pkg.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedPkg === pkg.id && (
                <div className="px-2.5 pb-2.5 space-y-1.5">
                  {pkg.items && pkg.items.length > 0 ? (
                    pkg.items.map((item) => {
                      const remaining = item.remaining_quantity || 0;
                      return (
                        <div key={item.id} className="flex items-center justify-between bg-white rounded p-2 text-xs border border-slate-100">
                          <span className="font-medium text-slate-700">{item.service_name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500">
                              Còn {remaining} buổi
                            </span>
                            {remaining > 0 && (
                              <button
                                onClick={() => onUsePackageItem(pkg.id, item.id, item.service_name, item.service_id, remaining)}
                                className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded hover:bg-emerald-700 transition-colors"
                              >
                                Sử dụng
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-400 p-2">Không có dịch vụ nào</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* GIFTS */}
      {gifts.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-purple-600" />
            Quà tặng ({gifts.length})
          </div>
          {gifts.map((gift) => (
            <div key={gift.id} className="bg-purple-50 rounded-lg border border-purple-200 p-2.5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-purple-800">{gift.package_name || "Quà tặng"}</div>
                <div className="text-xs text-purple-600">
                  Còn {gift.remaining_sessions} buổi · Hạn: {gift.expires_at ? new Date(gift.expires_at).toLocaleDateString("vi-VN") : "Không giới hạn"}
                </div>
              </div>
              <button
                onClick={() => onSelectGift()}
                className="px-3 py-1.5 bg-purple-700 text-white text-xs font-bold rounded hover:bg-purple-800 transition-colors"
              >
                Sử dụng
              </button>
            </div>
          ))}
        </div>
      )}

      {/* DEBT */}
      {debtAmount > 0 && (
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-600" />
            <div>
              <div className="text-sm font-semibold text-amber-800">Công nợ</div>
              <div className="text-xs text-amber-700">Còn nợ: {formatVND(debtAmount)}</div>
            </div>
          </div>
          <button
            onClick={onPayDebt}
            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded hover:bg-amber-700 transition-colors"
          >
            Thanh toán nợ
          </button>
        </div>
      )}
    </div>
  );
};