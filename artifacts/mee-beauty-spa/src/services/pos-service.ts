import { supabase } from "./supabase";
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

export class POSService {
  /**
   * Truy vấn Organization ID & Branch ID thực tế từ database
   */
  static async resolveOrgAndBranch(): Promise<{
    organization_id: string;
    branch_id: string;
  }> {
    try {
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .limit(1)
        .maybeSingle();
      const { data: branch } = await supabase
        .from("branches")
        .select("id")
        .limit(1)
        .maybeSingle();

      const defaultGuid = "00000000-0000-0000-0000-000000000000";
      return {
        organization_id: org?.id || defaultGuid,
        branch_id: branch?.id || defaultGuid,
      };
    } catch {
      return {
        organization_id: "00000000-0000-0000-0000-000000000000",
        branch_id: "00000000-0000-0000-0000-000000000000",
      };
    }
  }

  /**
   * Tạm thời lấy staff đầu tiên trong bảng staff (sẽ thay bằng auth sau)
   */
  static async getLoggedInStaff(): Promise<Staff | null> {
    const { data, error } = await supabase
      .from("staff")
      .select("id, full_name, role")
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.warn("Không tìm thấy staff active. Lấy staff đầu tiên bất kỳ.");
      // Fallback: lấy staff đầu tiên bất kỳ
      const { data: anyStaff } = await supabase
        .from("staff")
        .select("id, full_name, role")
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
      .eq("status", "ACTIVE")
      .order("full_name");

    if (error) {
      console.error("Lỗi tải danh sách nhân viên:", error);
      return [];
    }

    return data || [];
  }

  static async fetchServices(): Promise<CatalogServiceItem[]> {
    const { data, error } = await supabase.from("services").select(`
        id,
        name,
        price,
        duration,
        sales_commission_type,
        sales_commission_value,
        performance_commission_type,
        performance_commission_value
      `);

    if (error) {
      console.error("Lỗi tải danh sách dịch vụ:", error);
      return [];
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      price: Math.round(Number(s.price || 0)),
      duration_minutes: s.duration,
      is_active: true,
      sales_commission_type: s.sales_commission_type,
      sales_commission_value: Number(s.sales_commission_value || 0),
      performance_commission_type: s.performance_commission_type,
      performance_commission_value: Number(s.performance_commission_value || 0),
    }));
  }

  /**
   * CHỈ BÁN RETAIL TRÊN POS - Lọc bỏ CONSUMABLE
   */
  static async fetchProducts(): Promise<CatalogProductItem[]> {
    const { data, error } = await supabase.from("products").select(`
        id,
        catalog_item_id,
        selling_price,
        stock_quantity,
        minimum_stock,
        catalog_items (
          name,
          unit,
          product_type,
          is_active
        )
      `);

    if (error) {
      console.error("Lỗi tải danh sách sản phẩm:", error);
      return [];
    }

    return (data || [])
      .filter((p: any) => {
        const isActive = p.catalog_items?.is_active !== false;
        const isRetail = p.catalog_items?.product_type === "RETAIL";
        return isActive && isRetail;
      })
      .map((p: any) => ({
        id: p.id,
        catalog_item_id: p.catalog_item_id,
        name: p.catalog_items?.name || "Sản phẩm bán lẻ",
        selling_price: Math.round(Number(p.selling_price || 0)),
        stock_quantity: Number(p.stock_quantity || 0),
        minimum_stock: Number(p.minimum_stock || 0),
        unit: p.catalog_items?.unit || "cái",
        product_type: "RETAIL",
        is_active: true,
      }));
  }

  static async fetchPackages(): Promise<CatalogPackageItem[]> {
    const { data, error } = await supabase.from("packages").select(`
        id,
        name,
        price,
        validity_days,
        description,
        sales_commission_type,
        sales_commission_value,
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
      `);

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
      is_active: true,
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

  /**
   * Tạo Hóa đơn NHÁP (DRAFT)
   */
  static async createDraftInvoice(
    payload: CreateInvoicePayload,
  ): Promise<CheckoutResult> {
    try {
      const { organization_id, branch_id } = await this.resolveOrgAndBranch();

      // Gán seller_staff_id từ staff đăng nhập nếu chưa có
      let sellerStaffId = payload.seller_staff_id;
      if (!sellerStaffId) {
        const loggedStaff = await this.getLoggedInStaff();
        sellerStaffId = loggedStaff?.id || null;
      }

      const { data: invoice, error: invoiceErr } = await supabase
        .from("invoices")
        .insert({
          organization_id: payload.organization_id || organization_id,
          branch_id: payload.branch_id || branch_id,
          customer_id: payload.customer_id || null,
          seller_staff_id: sellerStaffId,
          status: "DRAFT",
          subtotal: payload.subtotal,
          discount_amount: payload.discount_amount,
          total_amount: payload.total_amount,
          payment_method: payload.payment_method,
          notes: payload.notes || null,
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
        seller_staff_id: item.seller_staff_id || sellerStaffId || null,
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

  /**
   * THANH TOÁN THỰC TẾ (REAL CHECKOUT)
   */
  static async processCheckout(
    cartItems: CartItem[],
    payload: CheckoutPayload,
  ): Promise<CheckoutResult> {
    try {
      const { organization_id, branch_id } = await this.resolveOrgAndBranch();

      // Lấy staff đăng nhập làm Sale mặc định
      const loggedStaff = await this.getLoggedInStaff();
      const defaultSellerId = loggedStaff?.id || null;

      // Kiểm tra ràng buộc tiền mặt
      if (
        payload.payment_method === "CASH" &&
        (payload.cash_given || 0) < payload.total_amount
      ) {
        return {
          success: false,
          error: "Số tiền khách đưa nhỏ hơn tổng tiền phải thanh toán!",
        };
      }

      // Kiểm tra ràng buộc nợ / gói
      if (payload.payment_method === "DEBT" && !payload.customer_id) {
        return {
          success: false,
          error: "Thanh toán Ghi nợ bắt buộc phải chọn Khách hàng!",
        };
      }

      const hasPackage = cartItems.some((it) => it.item_type === "PACKAGE");
      if (hasPackage && !payload.customer_id) {
        return {
          success: false,
          error: "Mua Gói dịch vụ bắt buộc phải chọn Khách hàng!",
        };
      }

      // Xác định status invoice
      let invoiceStatus: "PAID" | "PARTIALLY_PAID" = "PAID";
      if (payload.payment_method === "DEBT") {
        invoiceStatus = "PARTIALLY_PAID";
      } else if (payload.payment_method === "GIFT") {
        // GIFT vẫn là PAID nhưng total_amount = 0 (hoặc có thể là PARTIALLY_PAID nếu cần)
        invoiceStatus = "PAID";
      }

      // 1. Lưu Hóa Đơn Chính
      const { data: invoice, error: invoiceErr } = await supabase
        .from("invoices")
        .insert({
          organization_id: payload.organization_id || organization_id,
          branch_id: payload.branch_id || branch_id,
          customer_id: payload.customer_id || null,
          seller_staff_id: payload.seller_staff_id || defaultSellerId,
          status: invoiceStatus,
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
          error: invoiceErr?.message || "Lỗi khi tạo hóa đơn thanh toán",
        };
      }

      // 2. Lưu Chi Tiết Hóa Đơn
      const invoiceItemsData = cartItems.map((item) => ({
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
      }));

      const { error: itemsErr } = await supabase
        .from("invoice_items")
        .insert(invoiceItemsData);
      if (itemsErr) {
        return { success: false, error: itemsErr.message };
      }

      // 3. Xử lý Trừ Tồn Kho Sản Phẩm RETAIL + ghi inventory transaction
      for (const item of cartItems) {
        if (item.item_type === "PRODUCT" && item.product_id) {
          // Gọi RPC để trừ kho và ghi log
          try {
            await catalogService.processInventoryTransaction({
              product_id: item.product_id,
              type: "OUT",
              quantity: item.quantity,
              note: `POS bán hàng, invoice ${invoice.id}`,
            });
          } catch (invErr: any) {
            console.warn("Lỗi ghi inventory transaction:", invErr);
            // Fallback: cập nhật trực tiếp stock_quantity
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

      // 4. Xử lý Kích Hoạt Gói Dịch Vụ (Package Activation) – trừ khi là GIFT
      for (const item of cartItems) {
        if (
          item.item_type === "PACKAGE" &&
          item.package_id &&
          payload.customer_id
        ) {
          // Nếu là GIFT, đánh dấu is_gift = true
          const isGift = payload.payment_method === "GIFT";

          const { data: pkgInfo } = await supabase
            .from("packages")
            .select("validity_days, package_items(quantity)")
            .eq("id", item.package_id)
            .single();

          const validityDays = pkgInfo?.validity_days
            ? Number(pkgInfo.validity_days)
            : 365;
          const totalSessionsPerPkg = (pkgInfo?.package_items || []).reduce(
            (acc: number, pi: any) => acc + Number(pi.quantity || 1),
            0,
          );
          const totalSessions = (totalSessionsPerPkg || 1) * item.quantity;

          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + validityDays);

          await supabase.from("customer_packages").insert({
            customer_id: payload.customer_id,
            package_id: item.package_id,
            invoice_id: invoice.id,
            total_sessions: totalSessions,
            remaining_sessions: totalSessions,
            status: "ACTIVE",
            expires_at: expiresAt.toISOString(),
            is_gift: isGift, // Thêm field này nếu có migration
          });
        }
      }

      // 5. Tính và Ghi nhận Commission Logs
      const commissionLogs = [];

      for (const item of cartItems) {
        // Bỏ qua commission nếu là GIFT (không có hoa hồng cho quà tặng)
        if (item.is_gift) continue;

        // Sale Commission
        const sellerStaffId = item.seller_staff_id || defaultSellerId;
        if (sellerStaffId) {
          let saleComm = 0;
          if (item.sales_commission_type === "PERCENT") {
            const pct = Math.min(
              100,
              Math.max(0, Number(item.sales_commission_value || 0)),
            );
            saleComm = Math.round((item.total_amount * pct) / 100);
          } else if (item.sales_commission_type === "FIXED") {
            const fixVal = Math.max(
              0,
              Number(item.sales_commission_value || 0),
            );
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

        // KTV Commission (Chỉ tính cho SERVICE, và không phải GIFT)
        if (item.item_type === "SERVICE" && item.performing_staff_id) {
          let ktvComm = 0;
          if (item.performance_commission_type === "PERCENT") {
            const pct = Math.min(
              100,
              Math.max(0, Number(item.performance_commission_value || 0)),
            );
            ktvComm = Math.round((item.total_amount * pct) / 100);
          } else if (item.performance_commission_type === "FIXED") {
            const fixVal = Math.max(
              0,
              Number(item.performance_commission_value || 0),
            );
            ktvComm = fixVal * item.quantity;
          }

          if (ktvComm > 0) {
            commissionLogs.push({
              staff_id: item.performing_staff_id,
              invoice_id: invoice.id,
              commission_type: "PERFORMANCE",
              amount: ktvComm,
              description: `Hoa hồng kỹ thuật viên: ${item.name}`,
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
