// src/services/pos-service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  Customer,
  Staff,
  CatalogServiceItem,
  CatalogProductItem,
  CatalogPackageItem,
  CreateInvoicePayload,
  CheckoutPayload,
  CheckoutResult,
  CartItem,
} from "@/types/pos";
import { catalogService } from "./catalog-service";
import { customerService } from "./customer.service";

export class POSService {
  // ❌ ĐÃ XÓA hàm getLoggedInStaff()

  static async searchCustomers(query: string): Promise<Customer[]> {
    if (!query.trim()) return [];
    try {
      const allCustomers = await customerService.fetchCustomers();
      return allCustomers
        .filter(
          (c) =>
            (c.full_name || "").toLowerCase().includes(query.toLowerCase()) ||
            (c.phone || "").toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10);
    } catch (error) {
      console.error("❌ Lỗi tìm kiếm khách hàng:", error);
      return [];
    }
  }

  static async fetchStaffList(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from("staff")
      .select("id, full_name, role")
      .eq("status", "ACTIVE")
      .order("full_name");
    if (error) {
      console.error("❌ Lỗi tải staff:", error);
      return [];
    }
    return data || [];
  }

  static async fetchServices(): Promise<CatalogServiceItem[]> {
    try {
      const services = await catalogService.fetchServices();
      return services.map((s) => ({
        id: s.service_id || s.id,
        catalog_item_id: s.id,
        name: s.name,
        price: Number(s.price),
        duration_minutes: s.duration_minutes || 0,
        is_active: s.status === "ACTIVE",
        sales_commission_type: s.sales_commission_type || "PERCENT",
        sales_commission_value: Number(s.sales_commission_value || 0),
        performance_commission_type: s.performance_commission_type || "PERCENT",
        performance_commission_value: Number(s.performance_commission_value || 0),
      }));
    } catch (error) {
      console.error("❌ Lỗi tải dịch vụ:", error);
      return [];
    }
  }

  static async fetchProducts(): Promise<CatalogProductItem[]> {
    try {
      const products = await catalogService.fetchProducts();
      return products.map((p) => ({
        id: p.product_id,
        catalog_item_id: p.id,
        name: p.name,
        selling_price: Number(p.selling_price || p.price),
        stock_quantity: Number(p.stock_quantity || 0),
        minimum_stock: Number(p.minimum_stock || 0),
        unit: p.unit || "cái",
        product_type: p.product_type || "RETAIL",
        is_active: p.status === "ACTIVE",
        sales_commission_type: p.sales_commission_type || "PERCENT",
        sales_commission_value: Number(p.sales_commission_value || 0),
      }));
    } catch (error) {
      console.error("❌ Lỗi tải sản phẩm:", error);
      return [];
    }
  }

  static async fetchPackages(): Promise<CatalogPackageItem[]> {
    try {
      const packages = await catalogService.fetchPackages();
      return packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        price: Number(pkg.price),
        validity_days: Number(pkg.validity_days) || 365,
        description: pkg.description || "",
        is_active: pkg.is_active ?? true,
        sales_commission_type: pkg.sales_commission_type || "PERCENT",
        sales_commission_value: Number(pkg.sales_commission_value || 0),
        items: (pkg.package_items || []).map((pi) => ({
          package_id: pi.package_id || pkg.id,
          service_id: pi.service_id,
          service_name: pi.service_name || "Dịch vụ",
          quantity: Number(pi.quantity || 1),
          price_override: pi.price_override ? Number(pi.price_override) : undefined,
          item_type: pi.item_type,
          product_id: pi.product_id,
        })),
      }));
    } catch (error) {
      console.error("❌ Lỗi tải gói:", error);
      return [];
    }
  }

  static calculateTotals(items: CartItem[], overallDiscount: number = 0) {
    const subtotal = items.reduce(
      (sum, item) => sum + Math.round(item.unit_price * item.quantity),
      0,
    );
    const itemDiscounts = items.reduce(
      (sum, item) => sum + Math.round(item.discount_amount || 0),
      0,
    );
    const totalDiscount = Math.round(itemDiscounts + overallDiscount);
    const finalTotal = Math.max(0, Math.round(subtotal - totalDiscount));
    return {
      subtotal: Math.round(subtotal),
      discount_amount: Math.round(totalDiscount),
      total_amount: Math.round(finalTotal),
    };
  }

  static async createDraftInvoice(payload: CreateInvoicePayload): Promise<CheckoutResult> {
    try {
      // ✅ KHÔNG gọi getLoggedInStaff, dùng seller_staff_id từ payload
      const sellerStaffId = payload.seller_staff_id || null;

      const paymentMethod = payload.is_gift ? null : payload.payment_method;

      const { data: invoice, error: invoiceErr } = await supabase
        .from("invoices")
        .insert({
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          customer_id: payload.customer_id || null,
          seller_staff_id: sellerStaffId,
          status: "DRAFT",
          subtotal: payload.subtotal,
          discount_amount: payload.discount_amount,
          total_amount: payload.total_amount,
          payment_method: paymentMethod,
          paid_amount: payload.paid_amount || 0,
          is_gift: payload.is_gift || false,
        })
        .select("id")
        .single();
      if (invoiceErr || !invoice) {
        return { success: false, error: invoiceErr?.message || "Lỗi khi tạo đơn nháp" };
      }
      const invoiceItemsData = payload.items.map((item) => ({
        invoice_id: invoice.id,
        catalog_item_id: item.catalog_item_id || null,
        package_id: item.package_id || null,
        actual_service_id: item.actual_service_id || null,
        seller_staff_id: item.seller_staff_id || sellerStaffId,
        performing_staff_id: item.performing_staff_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        total_amount: item.total_amount,
        is_gift: item.is_gift || false,
      }));
      const { error: itemsErr } = await supabase.from("invoice_items").insert(invoiceItemsData);
      if (itemsErr) {
        return { success: false, error: itemsErr.message };
      }
      return { success: true, invoice_id: invoice.id };
    } catch (err: any) {
      return { success: false, error: err.message || "Lỗi hệ thống khi tạo đơn nháp" };
    }
  }

  static async processCheckout(cartItems: CartItem[], payload: CheckoutPayload): Promise<CheckoutResult> {
    try {
      // ✅ KHÔNG gọi getLoggedInStaff, dùng seller_staff_id từ payload
      const defaultSellerId = payload.seller_staff_id || null;

      // ============ VALIDATION ============
      if (payload.payment_method === "DEBT" && !payload.customer_id) {
        return { success: false, error: "Thanh toán Ghi nợ bắt buộc phải chọn Khách hàng!" };
      }
      if (payload.is_gift && !payload.customer_id) {
        return { success: false, error: "Tặng quà bắt buộc phải chọn Khách hàng!" };
      }
      const hasPackage = cartItems.some((it) => it.item_type === "PACKAGE");
      if (hasPackage && !payload.customer_id) {
        return { success: false, error: "Mua Gói dịch vụ bắt buộc phải chọn Khách hàng!" };
      }

      for (const item of cartItems) {
        if (item.item_type === "SERVICE" && item.ktv_splits && item.ktv_splits.length > 0) {
          const totalShare = item.ktv_splits.reduce((sum, s) => sum + s.share_percent, 0);
          if (Math.abs(totalShare - 100) > 0.01) {
            return {
              success: false,
              error: `Tổng tỷ lệ chia KTV cho "${item.name}" phải bằng 100% (hiện tại ${totalShare}%)`,
            };
          }
        }
      }

      // ============ INVOICE ============
      let invoiceStatus: "PAID" | "PARTIALLY_PAID" = "PAID";
      if (payload.payment_method === "DEBT") {
        const paidAmount = Number(payload.paid_amount) || 0;
        const totalAmount = Number(payload.total_amount) || 0;
        if (paidAmount >= totalAmount) {
          invoiceStatus = "PAID";
        } else {
          invoiceStatus = "PARTIALLY_PAID";
        }
      }

      const finalPaymentMethod = payload.is_gift ? null : payload.payment_method;

      const invoiceData: any = {
        organization_id: DEFAULT_ORG_ID,
        branch_id: DEFAULT_BRANCH_ID,
        customer_id: payload.customer_id || null,
        seller_staff_id: defaultSellerId,
        status: invoiceStatus,
        subtotal: payload.subtotal,
        discount_amount: payload.discount_amount,
        total_amount: payload.total_amount,
        payment_method: finalPaymentMethod,
        paid_amount: payload.paid_amount || 0,
        is_gift: payload.is_gift || false,
      };

      console.log("🧾 INSERT INVOICE PAYLOAD:", JSON.stringify(invoiceData, null, 2));

      const { data: invoice, error: invoiceErr } = await supabase
        .from("invoices")
        .insert(invoiceData)
        .select("id")
        .single();

      if (invoiceErr || !invoice) {
        console.error("❌❌❌ INVOICE INSERT ERROR FULL:", {
          code: invoiceErr.code,
          message: invoiceErr.message,
          details: invoiceErr.details,
          hint: invoiceErr.hint,
          payload: invoiceData,
        });
        return { success: false, error: invoiceErr?.message || "Lỗi khi tạo hóa đơn" };
      }

      const commissionLogs: any[] = [];
      const packageInvoiceItemMap = new Map<string, string>();

      // ============ XỬ LÝ TỪNG ITEM ============
      for (const item of cartItems) {
        const itemData: any = {
          invoice_id: invoice.id,
          catalog_item_id: item.catalog_item_id || null,
          package_id: item.package_id || null,
          actual_service_id: item.actual_service_id || null,
          seller_staff_id: item.seller_staff_id || defaultSellerId,
          performing_staff_id: item.performing_staff_id || null,
          description: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          total_amount: item.total_amount,
          is_gift: item.is_gift || false,
        };
        const { data: invItem, error: itemErr } = await supabase
          .from("invoice_items")
          .insert(itemData)
          .select("id")
          .single();
        if (itemErr) {
          return { success: false, error: itemErr.message };
        }

        // ============ GIFT SERVICE ENTITLEMENT ============
        if (
          payload.is_gift &&
          payload.customer_id &&
          item.item_type === "SERVICE" &&
          item.actual_service_id &&
          !item.package_id
        ) {
          const entitlementPayload = {
            organization_id: DEFAULT_ORG_ID,
            branch_id: DEFAULT_BRANCH_ID,
            customer_id: payload.customer_id,
            service_id: item.actual_service_id,
            total_quantity: item.quantity,
            used_quantity: 0,
            invoice_id: invoice.id,
            is_gift: true,
          };
          const { error } = await supabase
            .from('customer_service_entitlements')
            .insert(entitlementPayload);
          if (error) {
            await supabase.from('invoice_items').delete().eq('invoice_id', invoice.id);
            await supabase.from('invoices').delete().eq('id', invoice.id);
            console.error("❌ Gift entitlement error:", error);
            return { success: false, error: `Không thể tạo quyền lợi Gift: ${error.message}` };
          }
        }

        if (item.item_type === "PACKAGE" && item.package_id) {
          packageInvoiceItemMap.set(item.package_id, invItem.id);
        }

        // ============ GIFT ENTITLEMENT USAGE ============
        if (item.use_gift_entitlement && item.gift_entitlement_id && item.actual_service_id) {
          try {
            const { data: current, error: getErr } = await supabase
              .from('customer_service_entitlements')
              .select('used_quantity, remaining_quantity')
              .eq('id', item.gift_entitlement_id)
              .single();

            if (getErr || !current) {
              console.error("❌ Không tìm thấy quà tặng:", getErr);
              return { success: false, error: 'Không tìm thấy quà tặng' };
            }
            if (current.remaining_quantity <= 0) {
              return { success: false, error: 'Quà tặng đã hết' };
            }

            const newUsed = current.used_quantity + 1;
            const { data: updatedEnt, error: updateErr } = await supabase
              .from('customer_service_entitlements')
              .update({
                used_quantity: newUsed,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.gift_entitlement_id)
              .select()
              .single();

            if (updateErr) {
              console.error("❌ Lỗi cập nhật gift entitlement:", updateErr);
              return { success: false, error: `Không thể sử dụng quà tặng: ${updateErr.message}` };
            }

            const { error: sessErr } = await supabase
              .from('service_sessions')
              .insert({
                organization_id: DEFAULT_ORG_ID,
                branch_id: DEFAULT_BRANCH_ID,
                customer_id: payload.customer_id,
                catalog_item_id: item.catalog_item_id,
                staff_id: item.performing_staff_id || null,
                source_type: 'GIFT',
                package_id: null,
                price_charged: 0,
                notes: `Sử dụng quà tặng, entitlement ${item.gift_entitlement_id}, invoice ${invoice.id}`,
                performed_at: new Date().toISOString(),
              });

            if (sessErr) {
              await supabase
                .from('customer_service_entitlements')
                .update({
                  used_quantity: current.used_quantity,
                  updated_at: new Date().toISOString()
                })
                .eq('id', item.gift_entitlement_id);
              return { success: false, error: `Không thể tạo lịch sử dịch vụ: ${sessErr.message}` };
            }

            const { data: serviceDetail, error: serviceErr } = await supabase
              .from('services')
              .select('performance_commission_type, performance_commission_value')
              .eq('id', item.actual_service_id)
              .single();

            let totalPerformanceComm = 0;
            if (!serviceErr && serviceDetail) {
              const perfType = serviceDetail.performance_commission_type || 'PERCENT';
              const perfValue = Number(serviceDetail.performance_commission_value || 0);
              if (perfType === 'PERCENT') {
                const { data: catalogItem } = await supabase
                  .from('catalog_items')
                  .select('price')
                  .eq('id', item.catalog_item_id)
                  .single();
                const basePrice = catalogItem?.price || 0;
                const pct = Math.min(100, Math.max(0, perfValue));
                totalPerformanceComm = Math.round((basePrice * pct) / 100);
              } else if (perfType === 'FIXED') {
                totalPerformanceComm = perfValue;
              }
            }

            if (totalPerformanceComm > 0 && item.ktv_splits && item.ktv_splits.length > 0) {
              const splits = item.ktv_splits.map(split => ({
                organization_id: DEFAULT_ORG_ID,
                branch_id: DEFAULT_BRANCH_ID,
                staff_id: split.staff_id,
                invoice_item_id: null,
                commission_type: 'PERFORMANCE',
                amount: Math.round((totalPerformanceComm * split.share_percent) / 100),
              })).filter(c => c.amount > 0);

              if (splits.length > 0) {
                await supabase.from('staff_commissions').insert(splits).catch(e => console.error(e));
              }
            }
          } catch (err: any) {
            console.error("❌ Lỗi sử dụng gift entitlement:", err);
            return { success: false, error: `Lỗi sử dụng quà tặng: ${err.message}` };
          }
        }

        // ============ MULTI KTV ============
        if (item.item_type === "SERVICE" && item.ktv_splits && item.ktv_splits.length > 0 && !item.use_package && item.total_amount > 0) {
          const splits = item.ktv_splits.map((s) => ({
            invoice_item_id: invItem.id,
            staff_id: s.staff_id,
            share_percent: s.share_percent,
            commission_amount: s.commission_amount || 0,
          }));
          try {
            await supabase.from("invoice_item_staff").insert(splits);
          } catch (err) {
            console.warn("Không thể lưu KTV split, bỏ qua:", err);
          }
        }

        // ============ COMMISSION ============
        const isGift = item.is_gift || payload.is_gift;
        const isPackageUsage = item.use_package === true;

        if (!isPackageUsage && !isGift && item.total_amount > 0) {
          const sellerStaffId = item.seller_staff_id || defaultSellerId;
          if (sellerStaffId && invItem?.id) {
            let saleComm = 0;
            if (item.sales_commission_type === "PERCENT") {
              const pct = Math.min(100, Math.max(0, Number(item.sales_commission_value || 0)));
              saleComm = Math.round((item.total_amount * pct) / 100);
            } else if (item.sales_commission_type === "FIXED") {
              const fixVal = Math.max(0, Number(item.sales_commission_value || 0));
              saleComm = fixVal * item.quantity;
            }
            if (saleComm > 0) {
              commissionLogs.push({
                organization_id: DEFAULT_ORG_ID,
                branch_id: DEFAULT_BRANCH_ID,
                staff_id: sellerStaffId,
                invoice_item_id: invItem.id,
                commission_type: "SALES",
                amount: saleComm,
              });
            }
          }
        }

        if (item.item_type === "SERVICE" && !isGift && item.ktv_splits && item.ktv_splits.length > 0 && invItem?.id) {
          const servicePrice = item.unit_price || 0;
          if (servicePrice > 0) {
            const totalPerformanceComm = item.performance_commission_type && item.performance_commission_value
              ? (() => {
                  if (item.performance_commission_type === "PERCENT") {
                    const pct = Math.min(100, Math.max(0, Number(item.performance_commission_value || 0)));
                    return Math.round((servicePrice * pct) / 100);
                  } else {
                    return Math.max(0, Number(item.performance_commission_value || 0)) * item.quantity;
                  }
                })()
              : 0;

            if (totalPerformanceComm > 0) {
              for (const split of item.ktv_splits) {
                const commAmount = Math.round((totalPerformanceComm * split.share_percent) / 100);
                if (commAmount > 0) {
                  commissionLogs.push({
                    organization_id: DEFAULT_ORG_ID,
                    branch_id: DEFAULT_BRANCH_ID,
                    staff_id: split.staff_id,
                    invoice_item_id: invItem.id,
                    commission_type: "PERFORMANCE",
                    amount: commAmount,
                  });
                }
              }
            }
          }
        }

        // ============ PACKAGE USAGE ============
        if (item.use_package && item.customer_package_id && item.package_item_id && item.actual_service_id) {
          try {
            const result = await customerService.usePackageSessionV2(
              item.package_item_id,
              item.performing_staff_id || null,
              `Sử dụng package qua POS, invoice ${invoice.id}`,
            );
            if (!result || result.success === false) {
              console.error("❌ Lỗi sử dụng package:", result?.message);
              return { success: false, error: `Lỗi sử dụng package: ${result?.message}` };
            }
            try {
              const { data: sessionData } = await supabase
                .from("service_sessions")
                .select("id")
                .eq("invoice_id", invoice.id)
                .eq("source_type", "PACKAGE")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
              if (sessionData) {
                const { data: pkgItemData } = await supabase
                  .from("package_items")
                  .select("id")
                  .eq("package_id", item.package_id)
                  .eq("service_id", item.actual_service_id)
                  .maybeSingle();
                await supabase.from("package_usages").insert({
                  organization_id: DEFAULT_ORG_ID,
                  branch_id: DEFAULT_BRANCH_ID,
                  customer_id: payload.customer_id,
                  package_id: item.package_id,
                  service_session_id: sessionData.id,
                  customer_package_item_id: item.package_item_id,
                  package_item_id: pkgItemData?.id || null,
                  service_id: item.actual_service_id,
                  used_at: new Date().toISOString(),
                  notes: `Sử dụng package từ POS, invoice ${invoice.id}`,
                  created_at: new Date().toISOString(),
                });
              }
            } catch (usageErr) {
              console.warn("⚠️ Lỗi tạo package_usage:", usageErr);
            }
          } catch (err: any) {
            console.error("❌ Lỗi sử dụng package:", err);
            return { success: false, error: `Lỗi sử dụng package: ${err.message}` };
          }
        }
      }

      // ============ LƯU COMMISSION ============
      if (commissionLogs.length > 0) {
        const { error: commErr } = await supabase
          .from("staff_commissions")
          .insert(commissionLogs);
        if (commErr) {
          console.error("❌ Lỗi lưu commission:", commErr);
        }
      }

      // ============ INVENTORY ============
      for (const item of cartItems) {
        if (item.item_type === "PRODUCT" && item.product_id && !item.use_package) {
          try {
            await catalogService.processInventoryTransaction({
              product_id: item.product_id,
              type: "OUT",
              quantity: item.quantity,
              note: `POS bán hàng, invoice ${invoice.id}`,
            });
          } catch (invErr: any) {
            console.warn("Lỗi inventory, fallback:", invErr);
            const { data: currentProd } = await supabase
              .from("products")
              .select("stock_quantity")
              .eq("id", item.product_id)
              .single();
            if (currentProd) {
              const updatedStock = Math.max(0, Number(currentProd.stock_quantity || 0) - item.quantity);
              await supabase.from("products").update({ stock_quantity: updatedStock }).eq("id", item.product_id);
            }
          }
        }
      }

      // ============ PACKAGE PURCHASE ============
      const packageGroups = new Map<string, { items: CartItem[], totalQuantity: number, isGift: boolean }>();
      for (const item of cartItems) {
        if (item.item_type === "PACKAGE" && item.package_id) {
          if (!packageGroups.has(item.package_id)) {
            packageGroups.set(item.package_id, {
              items: [],
              totalQuantity: 0,
              isGift: payload.is_gift || item.is_gift || false
            });
          }
          const group = packageGroups.get(item.package_id)!;
          group.items.push(item);
          group.totalQuantity += item.quantity;
          if (payload.is_gift || item.is_gift) {
            group.isGift = true;
          }
        }
      }

      for (const [packageId, group] of packageGroups.entries()) {
        const { items, totalQuantity, isGift } = group;
        const firstItem = items[0];

        const { data: pkgInfo, error: pkgErr } = await supabase
          .from("packages")
          .select("validity_days, package_items(quantity, service_id)")
          .eq("id", packageId)
          .single();

        if (pkgErr || !pkgInfo) {
          console.error("❌ Không tìm thấy package:", pkgErr);
          return { success: false, error: `Không tìm thấy gói dịch vụ` };
        }

        if (!pkgInfo.package_items || pkgInfo.package_items.length === 0) {
          return {
            success: false,
            error: `Gói "${firstItem.name}" không có dịch vụ nào. Vui lòng kiểm tra cấu hình gói.`,
          };
        }

        const serviceQuantityMap = new Map<string, number>();
        for (const pi of pkgInfo.package_items || []) {
          if (!pi.service_id) continue;
          const current = serviceQuantityMap.get(pi.service_id) || 0;
          serviceQuantityMap.set(pi.service_id, current + Number(pi.quantity));
        }

        const validityDays = pkgInfo.validity_days || 365;
        const totalSessionsPerPkg = Array.from(serviceQuantityMap.values()).reduce((a, b) => a + b, 0);
        const totalSessions = totalSessionsPerPkg * totalQuantity;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + validityDays);

        const { data: customerPkg, error: cpErr } = await supabase
          .from("customer_packages")
          .insert({
            organization_id: DEFAULT_ORG_ID,
            branch_id: DEFAULT_BRANCH_ID,
            customer_id: payload.customer_id,
            package_id: packageId,
            invoice_id: invoice.id,
            total_sessions: totalSessions,
            remaining_sessions: totalSessions,
            status: "ACTIVE",
            expires_at: expiresAt.toISOString(),
            is_gift: isGift,
            price_paid: isGift ? 0 : firstItem.total_amount,
          })
          .select("id")
          .single();

        if (cpErr) {
          console.error("❌ Lỗi tạo customer_package:", cpErr);
          return { success: false, error: `Không thể tạo gói cho khách hàng: ${cpErr.message}` };
        }

        for (const [serviceId, quantityPerService] of serviceQuantityMap.entries()) {
          const quantity = quantityPerService * totalQuantity;
          const { error: insertErr } = await supabase
            .from("customer_package_items")
            .insert({
              customer_package_id: customerPkg.id,
              service_id: serviceId,
              total_quantity: quantity,
              used_quantity: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          if (insertErr) {
            console.error(`❌ Lỗi insert customer_package_item cho service ${serviceId}:`, insertErr);
            return { success: false, error: `Không thể tạo chi tiết gói: ${insertErr.message}` };
          }
        }

        const hasUseNow = !isGift && items.some(it => it.use_now === true);
        if (hasUseNow && firstItem.actual_service_id) {
          try {
            const { data: cpItem } = await supabase
              .from("customer_package_items")
              .select("id")
              .eq("customer_package_id", customerPkg.id)
              .eq("service_id", firstItem.actual_service_id)
              .maybeSingle();

            if (cpItem) {
              const result = await customerService.usePackageSessionV2(
                cpItem.id,
                firstItem.performing_staff_id || null,
                `Sử dụng buổi đầu từ package mới, invoice ${invoice.id}`,
              );
              if (result && result.success) {
                const serviceId = firstItem.actual_service_id;
                const { data: serviceDetail, error: serviceErr } = await supabase
                  .from("services")
                  .select("performance_commission_type, performance_commission_value, catalog_item_id")
                  .eq("id", serviceId)
                  .single();

                if (!serviceErr && serviceDetail) {
                  const { data: catalogItem } = await supabase
                    .from("catalog_items")
                    .select("price")
                    .eq("id", serviceDetail.catalog_item_id)
                    .single();
                  const servicePrice = catalogItem?.price || 0;
                  const perfType = serviceDetail.performance_commission_type || "PERCENT";
                  const perfValue = Number(serviceDetail.performance_commission_value || 0);
                  let totalPerformanceComm = 0;
                  if (perfType === "PERCENT") {
                    const pct = Math.min(100, Math.max(0, perfValue));
                    totalPerformanceComm = Math.round((servicePrice * pct) / 100);
                  } else if (perfType === "FIXED") {
                    totalPerformanceComm = perfValue;
                  }
                  if (totalPerformanceComm > 0) {
                    let splits = firstItem.ktv_splits;
                    if ((!splits || splits.length === 0) && firstItem.performing_staff_id) {
                      splits = [{ staff_id: firstItem.performing_staff_id, share_percent: 100 }];
                    }
                    if (splits && splits.length > 0) {
                      const invoiceItemId = packageInvoiceItemMap.get(packageId);
                      if (invoiceItemId) {
                        const packageCommissionLogs = splits.map(split => ({
                          organization_id: DEFAULT_ORG_ID,
                          branch_id: DEFAULT_BRANCH_ID,
                          staff_id: split.staff_id,
                          invoice_item_id: invoiceItemId,
                          commission_type: "PERFORMANCE",
                          amount: Math.round((totalPerformanceComm * split.share_percent) / 100),
                        })).filter(log => log.amount > 0);
                        if (packageCommissionLogs.length > 0) {
                          await supabase.from("staff_commissions").insert(packageCommissionLogs).catch(e => console.error(e));
                        }
                      }
                    }
                  }
                }
              }
            }
          } catch (usageErr) {
            console.warn("⚠️ Lỗi sử dụng buổi đầu:", usageErr);
          }
        }
      }

      // ============ SERVICE SESSION CHO SERVICE LẺ (không Gift) ============
      for (const item of cartItems) {
        if (item.item_type === "SERVICE" && !item.use_package && item.actual_service_id && item.total_amount > 0 && !item.is_gift && !payload.is_gift) {
          try {
            await supabase.from("service_sessions").insert({
              organization_id: DEFAULT_ORG_ID,
              branch_id: DEFAULT_BRANCH_ID,
              customer_id: payload.customer_id,
              catalog_item_id: item.catalog_item_id,
              staff_id: item.performing_staff_id || null,
              source_type: "DIRECT",
              package_id: null,
              price_charged: item.total_amount,
              notes: `Invoice ${invoice.id}`,
              performed_at: new Date().toISOString(),
            });
          } catch (sessionErr) {
            console.warn("⚠️ Lỗi tạo service_session:", sessionErr);
          }
        }
      }

      // ============ LOYALTY EARN (sau khi đã có items) ============
      try {
        const { earnFromInvoice } = await import('@/services/loyalty.service');
        await earnFromInvoice(invoice.id);
      } catch (err) {
        console.error('Loyalty earn error:', err);
        // Không throw, không ảnh hưởng checkout
      }

      return { success: true, invoice_id: invoice.id };
    } catch (err: any) {
      console.error("❌ Lỗi processCheckout:", err);
      return { success: false, error: err.message || "Lỗi khi xử lý thanh toán" };
    }
  }
}