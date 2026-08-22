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
  InvoiceItemStaff,
} from "@/types/pos";
import { catalogService } from "./catalog-service";
import { customerService } from "./customer.service";

export class POSService {
  /**
   * Lấy staff đầu tiên (tạm thời) – sẽ thay bằng auth sau
   */
  static async getLoggedInStaff(): Promise<Staff | null> {
    const { data, error } = await supabase
      .from("staff")
      .select("id, full_name, role")
      .eq("organization_id", DEFAULT_ORG_ID)
      .eq("branch_id", DEFAULT_BRANCH_ID)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.warn("Không tìm thấy staff active, lấy staff đầu tiên.");
      const { data: anyStaff } = await supabase
        .from("staff")
        .select("id, full_name, role")
        .eq("organization_id", DEFAULT_ORG_ID)
        .eq("branch_id", DEFAULT_BRANCH_ID)
        .limit(1)
        .maybeSingle();
      return anyStaff || null;
    }
    return data;
  }

  static async searchCustomers(query: string): Promise<Customer[]> {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from("customers")
      .select("id, full_name, phone, email, avatar_url")
      .eq("organization_id", DEFAULT_ORG_ID)
      .eq("branch_id", DEFAULT_BRANCH_ID)
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error("Lỗi tìm kiếm khách hàng:", error);
      return [];
    }

    return data || [];
  }

  static async fetchStaffList(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from("staff")
      .select("id, full_name, role, avatar_url")
      .eq("organization_id", DEFAULT_ORG_ID)
      .eq("branch_id", DEFAULT_BRANCH_ID)
      .eq("status", "ACTIVE")
      .order("full_name");

    if (error) {
      console.error("Lỗi tải danh sách nhân viên:", error);
      return [];
    }

    return data || [];
  }

  static async fetchServices(): Promise<CatalogServiceItem[]> {
    const { data, error } = await supabase
      .from("services")
      .select(`
        id,
        catalog_item_id,
        name,
        price,
        duration,
        sales_commission_type,
        sales_commission_value,
        performance_commission_type,
        performance_commission_value,
        catalog_items (
          organization_id,
          branch_id,
          is_active
        )
      `)
      .eq("catalog_items.organization_id", DEFAULT_ORG_ID)
      .eq("catalog_items.branch_id", DEFAULT_BRANCH_ID)
      .eq("catalog_items.is_active", true);

    if (error) {
      console.error("Lỗi tải danh sách dịch vụ:", error);
      return [];
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      catalog_item_id: s.catalog_item_id,
      name: s.name,
      price: Math.round(Number(s.price || 0)),
      duration_minutes: s.duration,
      is_active: s.catalog_items?.is_active ?? true,
      sales_commission_type: s.sales_commission_type,
      sales_commission_value: Number(s.sales_commission_value || 0),
      performance_commission_type: s.performance_commission_type,
      performance_commission_value: Number(s.performance_commission_value || 0),
    }));
  }

  static async fetchProducts(): Promise<CatalogProductItem[]> {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        catalog_item_id,
        selling_price,
        stock_quantity,
        minimum_stock,
        catalog_items (
          name,
          unit,
          product_type,
          is_active,
          organization_id,
          branch_id
        )
      `)
      .eq("catalog_items.organization_id", DEFAULT_ORG_ID)
      .eq("catalog_items.branch_id", DEFAULT_BRANCH_ID)
      .eq("catalog_items.is_active", true)
      .eq("catalog_items.product_type", "RETAIL");

    if (error) {
      console.error("Lỗi tải danh sách sản phẩm:", error);
      return [];
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      catalog_item_id: p.catalog_item_id,
      name: p.catalog_items?.name || "Sản phẩm bán lẻ",
      selling_price: Math.round(Number(p.selling_price || 0)),
      stock_quantity: Number(p.stock_quantity || 0),
      minimum_stock: Number(p.minimum_stock || 0),
      unit: p.catalog_items?.unit || "cái",
      product_type: "RETAIL",
      is_active: p.catalog_items?.is_active ?? true,
    }));
  }

  static async fetchPackages(): Promise<CatalogPackageItem[]> {
    const { data, error } = await supabase
      .from("packages")
      .select(`
        id,
        name,
        price,
        validity_days,
        description,
        sales_commission_type,
        sales_commission_value,
        is_active,
        organization_id,
        branch_id,
        package_items (
          package_id,
          service_id,
          quantity,
          price_override,
          item_type,
          product_id,
          services (
            name
          )
        )
      `)
      .eq("organization_id", DEFAULT_ORG_ID)
      .eq("branch_id", DEFAULT_BRANCH_ID)
      .eq("is_active", true);

    if (error) {
      console.error("Lỗi tải danh sách gói dịch vụ:", error);
      return [];
    }

    return (data || []).map((pkg: any) => ({
      id: pkg.id,
      name: pkg.name,
      price: Math.round(Number(pkg.price || 0)),
      validity_days: pkg.validity_days ? Number(pkg.validity_days) : 365,
      description: pkg.description,
      is_active: pkg.is_active ?? true,
      sales_commission_type: pkg.sales_commission_type,
      sales_commission_value: Number(pkg.sales_commission_value || 0),
      items: (pkg.package_items || []).map((pi: any) => ({
        package_id: pi.package_id,
        service_id: pi.service_id,
        service_name: pi.services?.name || "Dịch vụ trong gói",
        quantity: Number(pi.quantity || 1),
        price_override: pi.price_override
          ? Math.round(Number(pi.price_override))
          : undefined,
        item_type: pi.item_type,
        product_id: pi.product_id,
      })),
    }));
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

  static async createDraftInvoice(
    payload: CreateInvoicePayload,
  ): Promise<CheckoutResult> {
    try {
      const loggedStaff = await this.getLoggedInStaff();
      const sellerStaffId = payload.seller_staff_id || loggedStaff?.id || null;

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
          payment_method: payload.payment_method,
          notes: payload.notes || null,
          is_gift: payload.is_gift || false,
        })
        .select("id")
        .single();

      if (invoiceErr || !invoice) {
        return {
          success: false,
          error: invoiceErr?.message || "Lỗi khi tạo đơn nháp",
        };
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

      const { error: itemsErr } = await supabase
        .from("invoice_items")
        .insert(invoiceItemsData);

      if (itemsErr) {
        return { success: false, error: itemsErr.message };
      }

      return { success: true, invoice_id: invoice.id };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Lỗi hệ thống khi tạo đơn nháp",
      };
    }
  }

  static async processCheckout(
    cartItems: CartItem[],
    payload: CheckoutPayload,
  ): Promise<CheckoutResult> {
    try {
      const loggedStaff = await this.getLoggedInStaff();
      const defaultSellerId = payload.seller_staff_id || loggedStaff?.id || null;

      // ============ VALIDATION ============
      if (payload.payment_method === "CASH" && (payload.cash_given || 0) < payload.total_amount) {
        return {
          success: false,
          error: "Số tiền khách đưa nhỏ hơn tổng tiền phải thanh toán!",
        };
      }

      if (payload.payment_method === "DEBT" && !payload.customer_id) {
        return {
          success: false,
          error: "Thanh toán Ghi nợ bắt buộc phải chọn Khách hàng!",
        };
      }

      if (payload.payment_method === "GIFT" && !payload.customer_id) {
        return {
          success: false,
          error: "Tặng quà bắt buộc phải chọn Khách hàng!",
        };
      }

      const hasPackage = cartItems.some((it) => it.item_type === "PACKAGE");
      if (hasPackage && !payload.customer_id) {
        return {
          success: false,
          error: "Mua Gói dịch vụ bắt buộc phải chọn Khách hàng!",
        };
      }

      // Kiểm tra KTV split
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
        invoiceStatus = "PARTIALLY_PAID";
      }

      const { data: invoice, error: invoiceErr } = await supabase
        .from("invoices")
        .insert({
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          customer_id: payload.customer_id || null,
          seller_staff_id: defaultSellerId,
          status: invoiceStatus,
          subtotal: payload.subtotal,
          discount_amount: payload.discount_amount,
          total_amount: payload.total_amount,
          payment_method: payload.payment_method,
          notes: payload.notes || null,
          is_gift: payload.is_gift || false,
          paid_amount: payload.paid_amount || 0,
        })
        .select("id")
        .single();

      if (invoiceErr || !invoice) {
        return {
          success: false,
          error: invoiceErr?.message || "Lỗi khi tạo hóa đơn",
        };
      }

      // ============ INVOICE ITEMS ============
      const invoiceItemIds: string[] = [];

      for (const item of cartItems) {
        const { data: invItem, error: itemErr } = await supabase
          .from("invoice_items")
          .insert({
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
          })
          .select("id")
          .single();

        if (itemErr) {
          return { success: false, error: itemErr.message };
        }

        invoiceItemIds.push(invItem.id);

        // ============ MULTI KTV ============
        if (item.item_type === "SERVICE" && item.ktv_splits && item.ktv_splits.length > 0) {
          const splits = item.ktv_splits.map((s) => ({
            invoice_item_id: invItem.id,
            staff_id: s.staff_id,
            share_percent: s.share_percent,
            commission_amount: s.commission_amount || 0,
          }));

          const { error: splitErr } = await supabase
            .from("invoice_item_staff")
            .insert(splits);

          if (splitErr) {
            console.warn("Lỗi lưu KTV split:", splitErr);
          }
        }

        // ============ PACKAGE USAGE ============
        if (item.use_package && item.customer_package_id && item.package_item_id && item.actual_service_id) {
          const result = await customerService.usePackageSessionV2(
            item.customer_package_id,
            item.package_item_id,
            item.actual_service_id,
            item.performing_staff_id || null,
            `Sử dụng package qua POS, invoice ${invoice.id}`,
          );

          if (!result.success) {
            return {
              success: false,
              error: `Lỗi sử dụng package: ${result.message}`,
            };
          }
        }
      }

      // ============ INVENTORY (PRODUCT RETAIL) ============
      for (const item of cartItems) {
        if (item.item_type === "PRODUCT" && item.product_id) {
          try {
            await catalogService.processInventoryTransaction({
              product_id: item.product_id,
              type: "OUT",
              quantity: item.quantity,
              note: `POS bán hàng, invoice ${invoice.id}`,
            });
          } catch (invErr: any) {
            console.warn("Lỗi ghi inventory transaction, fallback:", invErr);
            const { data: currentProd } = await supabase
              .from("products")
              .select("stock_quantity")
              .eq("id", item.product_id)
              .single();

            if (currentProd) {
              const updatedStock = Math.max(
                0,
                Number(currentProd.stock_quantity || 0) - item.quantity,
              );
              await supabase
                .from("products")
                .update({ stock_quantity: updatedStock })
                .eq("id", item.product_id);
            }
          }
        }
      }

      // ============ PACKAGE PURCHASE (Mua Package mới) ============
      for (const item of cartItems) {
        if (item.item_type === "PACKAGE" && item.package_id && payload.customer_id) {
          const isGift = payload.payment_method === "GIFT" || item.is_gift;

          const { data: pkgInfo } = await supabase
            .from("packages")
            .select("validity_days, package_items(quantity)")
            .eq("id", item.package_id)
            .single();

          const validityDays = pkgInfo?.validity_days ? Number(pkgInfo.validity_days) : 365;
          const totalSessionsPerPkg = (pkgInfo?.package_items || []).reduce(
            (acc: number, pi: any) => acc + Number(pi.quantity || 1),
            0,
          );
          const totalSessions = (totalSessionsPerPkg || 1) * item.quantity;

          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + validityDays);

          // Tạo customer_package
          const { data: customerPkg, error: cpErr } = await supabase
            .from("customer_packages")
            .insert({
              customer_id: payload.customer_id,
              package_id: item.package_id,
              invoice_id: invoice.id,
              total_sessions: totalSessions,
              remaining_sessions: totalSessions,
              status: "ACTIVE",
              expires_at: expiresAt.toISOString(),
              is_gift: isGift,
              price_paid: isGift ? 0 : item.total_amount,
            })
            .select("id")
            .single();

          if (cpErr) {
            console.warn("Lỗi tạo customer_package:", cpErr);
          }

          // Trigger sẽ tự động tạo customer_package_items
        }
      }

      // ============ COMMISSION ============
      const commissionLogs = [];

      for (const item of cartItems) {
        // Gift không tính commission
        if (item.is_gift) continue;
        if (payload.payment_method === "GIFT") continue;

        // Sale Commission
        const sellerStaffId = item.seller_staff_id || defaultSellerId;
        if (sellerStaffId) {
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
              staff_id: sellerStaffId,
              invoice_id: invoice.id,
              commission_type: "SALE",
              amount: saleComm,
              description: `Hoa hồng bán hàng: ${item.name}`,
            });
          }
        }

        // KTV Commission (chỉ cho SERVICE)
        if (item.item_type === "SERVICE") {
          const totalPerformanceComm = item.performance_commission_type && item.performance_commission_value
            ? (() => {
                if (item.performance_commission_type === "PERCENT") {
                  const pct = Math.min(100, Math.max(0, Number(item.performance_commission_value || 0)));
                  return Math.round((item.total_amount * pct) / 100);
                } else {
                  return Math.max(0, Number(item.performance_commission_value || 0)) * item.quantity;
                }
              })()
            : 0;

          if (totalPerformanceComm > 0 && item.ktv_splits && item.ktv_splits.length > 0) {
            for (const split of item.ktv_splits) {
              const commAmount = Math.round((totalPerformanceComm * split.share_percent) / 100);
              if (commAmount > 0) {
                commissionLogs.push({
                  staff_id: split.staff_id,
                  invoice_id: invoice.id,
                  commission_type: "PERFORMANCE",
                  amount: commAmount,
                  description: `Hoa hồng KTV (${split.share_percent}%): ${item.name}`,
                });
              }
            }
          } else if (totalPerformanceComm > 0 && item.performing_staff_id) {
            commissionLogs.push({
              staff_id: item.performing_staff_id,
              invoice_id: invoice.id,
              commission_type: "PERFORMANCE",
              amount: totalPerformanceComm,
              description: `Hoa hồng KTV: ${item.name}`,
            });
          }
        }
      }

      if (commissionLogs.length > 0) {
        await supabase.from("commission_logs").insert(commissionLogs);
      }

      return { success: true, invoice_id: invoice.id };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Lỗi khi xử lý thanh toán",
      };
    }
  }
}