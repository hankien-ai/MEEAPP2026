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
      /**
       * Lấy staff đầu tiên – không filter org/branch
       */
      static async getLoggedInStaff(): Promise<Staff | null> {
        console.log("🔍 getLoggedInStaff: lấy staff không filter");
        const { data, error } = await supabase
          .from("staff")
          .select("id, full_name, role")
          .eq("status", "ACTIVE")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("❌ Lỗi lấy staff:", error);
          return null;
        }
        console.log("✅ Staff tìm thấy:", data);
        return data || null;
      }

      static async searchCustomers(query: string): Promise<Customer[]> {
        if (!query.trim()) {
          console.log("🔍 searchCustomers: query rỗng");
          return [];
        }

        console.log(`🔍 searchCustomers: tìm "${query}"`);
        try {
          const allCustomers = await customerService.fetchCustomers();
          const filtered = allCustomers.filter(
            (c) =>
              (c.full_name || "").toLowerCase().includes(query.toLowerCase()) ||
              (c.phone || "").toLowerCase().includes(query.toLowerCase())
          );
          console.log(`✅ Tìm thấy ${filtered.length} khách hàng`);
          return filtered.slice(0, 10);
        } catch (error) {
          console.error("❌ Lỗi tìm kiếm khách hàng:", error);
          return [];
        }
      }

      static async fetchStaffList(): Promise<Staff[]> {
        console.log("🔍 fetchStaffList: lấy danh sách staff không filter");
        const { data, error } = await supabase
          .from("staff")
          .select("id, full_name, role")
          .eq("status", "ACTIVE")
          .order("full_name");

        if (error) {
          console.error("❌ Lỗi tải staff:", error);
          return [];
        }

        console.log(`✅ Tìm thấy ${data?.length || 0} staff:`, data);
        return data || [];
      }

      static async fetchServices(): Promise<CatalogServiceItem[]> {
        console.log("🔍 fetchServices: lấy dịch vụ từ catalogService");
        try {
          const services = await catalogService.fetchServices();
          console.log(`✅ Tìm thấy ${services.length} dịch vụ:`, services);
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
        console.log("🔍 fetchProducts: lấy sản phẩm từ catalogService");
        try {
          const products = await catalogService.fetchProducts();
          console.log(`✅ Tìm thấy ${products.length} sản phẩm:`, products);
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
        console.log("🔍 fetchPackages: lấy gói từ catalogService");
        try {
          const packages = await catalogService.fetchPackages();
          console.log(`✅ Tìm thấy ${packages.length} gói:`, packages);
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

      static async createDraftInvoice(
        payload: CreateInvoicePayload,
      ): Promise<CheckoutResult> {
        try {
          const loggedStaff = await this.getLoggedInStaff();
          const sellerStaffId = payload.seller_staff_id || loggedStaff?.id || null;

          const insertData: any = {
            organization_id: DEFAULT_ORG_ID,
            branch_id: DEFAULT_BRANCH_ID,
            customer_id: payload.customer_id || null,
            seller_staff_id: sellerStaffId,
            status: "DRAFT",
            subtotal: payload.subtotal,
            discount_amount: payload.discount_amount,
            total_amount: payload.total_amount,
            payment_method: payload.payment_method,
          };

          const { data: invoice, error: invoiceErr } = await supabase
            .from("invoices")
            .insert(insertData)
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

          const invoiceData: any = {
            organization_id: DEFAULT_ORG_ID,
            branch_id: DEFAULT_BRANCH_ID,
            customer_id: payload.customer_id || null,
            seller_staff_id: defaultSellerId,
            status: invoiceStatus,
            subtotal: payload.subtotal,
            discount_amount: payload.discount_amount,
            total_amount: payload.total_amount,
            payment_method: payload.payment_method,
          };

          const { data: invoice, error: invoiceErr } = await supabase
            .from("invoices")
            .insert(invoiceData)
            .select("id")
            .single();

          if (invoiceErr || !invoice) {
            return {
              success: false,
              error: invoiceErr?.message || "Lỗi khi tạo hóa đơn",
            };
          }

          // ============ INVOICE ITEMS ============
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

            // ============ MULTI KTV (chỉ khi có tiền và không dùng package) ============
            if (item.item_type === "SERVICE" && item.ktv_splits && item.ktv_splits.length > 0 && !item.use_package && item.total_amount > 0) {
              const splits = item.ktv_splits.map((s) => ({
                invoice_item_id: invItem.id,
                staff_id: s.staff_id,
                share_percent: s.share_percent,
                commission_amount: s.commission_amount || 0,
              }));

              try {
                const { error: splitErr } = await supabase
                  .from("invoice_item_staff")
                  .insert(splits);
                if (splitErr) {
                  console.warn("Lỗi lưu KTV split (bỏ qua):", splitErr);
                }
              } catch (err) {
                console.warn("Không thể lưu KTV split, bỏ qua:", err);
              }
            }

            // ============ PACKAGE USAGE ============
            if (item.use_package && item.customer_package_id && item.package_item_id && item.actual_service_id) {
              try {
                console.log("📦 Bắt đầu sử dụng package với item:", {
                  customer_package_id: item.customer_package_id,
                  package_item_id: item.package_item_id,
                  actual_service_id: item.actual_service_id,
                  performing_staff_id: item.performing_staff_id,
                });

                const result = await customerService.usePackageSessionV2(
                  item.package_item_id,
                  item.performing_staff_id || null,
                  `Sử dụng package qua POS, invoice ${invoice.id}`,
                );

                console.log("📦 Kết quả RPC:", result);

                if (!result) {
                  console.error("❌ RPC không trả về kết quả");
                  return {
                    success: false,
                    error: "Không nhận được phản hồi từ server",
                  };
                }

                // Chỉ báo lỗi khi result.success === false
                if (result.success === false) {
                  console.error("❌ Lỗi sử dụng package:", result.message);
                  return {
                    success: false,
                    error: `Lỗi sử dụng package: ${result.message}`,
                  };
                }

                console.log(`✅ Sử dụng package thành công. Còn ${result.remaining_quantity} buổi`);

                // Tạo package_usage
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
                    console.log("✅ Đã tạo package_usage");
                  }
                } catch (usageErr) {
                  console.warn("⚠️ Lỗi tạo package_usage (bỏ qua):", usageErr);
                }

              } catch (err: any) {
                console.error("❌ Lỗi sử dụng package (catch):", err);
                return {
                  success: false,
                  error: `Lỗi sử dụng package: ${err.message || err}`,
                };
              }
            }
          }

          // ============ INVENTORY (PRODUCT RETAIL) ============
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
                .select("validity_days, package_items(quantity, service_id)")
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

              const cpData: any = {
                organization_id: DEFAULT_ORG_ID,
                branch_id: DEFAULT_BRANCH_ID,
                customer_id: payload.customer_id,
                package_id: item.package_id,
                invoice_id: invoice.id,
                total_sessions: totalSessions,
                remaining_sessions: totalSessions,
                status: "ACTIVE",
                expires_at: expiresAt.toISOString(),
                is_gift: isGift,
                price_paid: isGift ? 0 : item.total_amount,
              };

              const { data: customerPkg, error: cpErr } = await supabase
                .from("customer_packages")
                .insert(cpData)
                .select("id")
                .single();

              if (cpErr) {
                console.error("❌ Lỗi tạo customer_package:", cpErr);
                return {
                  success: false,
                  error: `Không thể tạo gói cho khách hàng: ${cpErr.message}`,
                };
              }

              // ============ TẠO CUSTOMER_PACKAGE_ITEMS ============
              if (pkgInfo?.package_items && pkgInfo.package_items.length > 0) {
                const cpItems = pkgInfo.package_items.map((pi: any) => ({
                  customer_package_id: customerPkg.id,
                  service_id: pi.service_id,
                  total_quantity: Number(pi.quantity) * item.quantity,
                  used_quantity: 0,
                  remaining_quantity: Number(pi.quantity) * item.quantity,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }));

                const { error: cpItemsErr } = await supabase
                  .from("customer_package_items")
                  .insert(cpItems);

                if (cpItemsErr) {
                  console.error("❌ Lỗi tạo customer_package_items:", cpItemsErr);
                } else {
                  console.log(`✅ Đã tạo ${cpItems.length} customer_package_items cho gói ${customerPkg.id}`);
                }
              }

              // ============ TẠO SERVICE SESSION CHO BUỔI ĐẦU (nếu dùng ngay) ============
              if (item.use_now && item.actual_service_id) {
                try {
                  // Tìm customer_package_item tương ứng với service_id để trừ buổi
                  const { data: cpItem } = await supabase
                    .from("customer_package_items")
                    .select("id")
                    .eq("customer_package_id", customerPkg.id)
                    .eq("service_id", item.actual_service_id)
                    .single();

                  if (cpItem) {
                    const result = await customerService.usePackageSessionV2(
                      cpItem.id,
                      item.performing_staff_id || null,
                      `Sử dụng buổi đầu từ package mới, invoice ${invoice.id}`,
                    );
                    if (result && result.success) {
                      console.log("✅ Đã sử dụng buổi đầu thành công");
                    } else {
                      console.warn("⚠️ Lỗi sử dụng buổi đầu:", result?.message);
                    }
                  }
                } catch (usageErr: any) {
                  console.warn("⚠️ Lỗi sử dụng buổi đầu package:", usageErr);
                }
              }
            }
          }

          // ============ SERVICE SESSION CHO SERVICE LẺ (DIRECT, không dùng package) ============
          for (const item of cartItems) {
            if (item.item_type === "SERVICE" && !item.use_package && item.actual_service_id && item.total_amount > 0) {
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
              } catch (sessionErr: any) {
                console.warn("⚠️ Lỗi tạo service_session cho service lẻ:", sessionErr);
              }
            }
          }

          // ============ COMMISSION ============
          const commissionLogs = [];

          for (const item of cartItems) {
            if (item.is_gift) continue;
            if (payload.payment_method === "GIFT") continue;

            const isPackageUsage = item.use_package === true;

            // Sale Commission (chỉ khi không phải package usage và có tiền)
            if (!isPackageUsage && item.total_amount > 0) {
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
            }

            // KTV Commission (cho cả DIRECT và PACKAGE USAGE)
            if (item.item_type === "SERVICE" && item.ktv_splits && item.ktv_splits.length > 0) {
              // Lấy giá service để tính commission (cho package usage, dùng unit_price đã lưu giá gốc)
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
                        staff_id: split.staff_id,
                        invoice_id: invoice.id,
                        commission_type: "PERFORMANCE",
                        amount: commAmount,
                        description: `Hoa hồng KTV${isPackageUsage ? ' (Package)' : ''} (${split.share_percent}%): ${item.name}`,
                      });
                    }
                  }
                }
              }
            }
          }

          if (commissionLogs.length > 0) {
            const { error: commErr } = await supabase.from("commission_logs").insert(commissionLogs);
            if (commErr) {
              console.warn("Lỗi lưu commission (bỏ qua):", commErr);
            }
          }

          return { success: true, invoice_id: invoice.id };
        } catch (err: any) {
          console.error("❌ Lỗi processCheckout:", err);
          return {
            success: false,
            error: err.message || "Lỗi khi xử lý thanh toán",
          };
        }
      }
    }