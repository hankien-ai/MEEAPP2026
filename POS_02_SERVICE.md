# POS SERVICE
===== artifacts/mee-beauty-spa/src/services/pos-service.ts =====
import { supabase } from '@/lib/supabase';
import {
  Customer,
  Staff,
  CatalogServiceItem,
  CatalogProductItem,
  CatalogPackageItem,
  CreateInvoicePayload,
  CheckoutResult,
  CartItem
} from '@/types/pos';

export class POSService {
  static async searchCustomers(query: string): Promise<Customer[]> {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, phone, email, avatar_url')
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching customers:', error);
      return [];
    }

    return data || [];
  }

  static async fetchStaffList(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .order('full_name');

    if (error) {
      console.error('Error fetching staff list:', error);
      return [];
    }

    return data || [];
  }

  static async fetchServices(): Promise<CatalogServiceItem[]> {
    const { data, error } = await supabase
      .from('services')
      .select(`
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
      console.error('Error fetching services:', error);
      return [];
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      price: Math.round(Number(s.price || 0)),
      duration_minutes: s.duration,
      is_active: true,
      sales_commission_type: s.sales_commission_type,
      sales_commission_value: s.sales_commission_value,
      performance_commission_type: s.performance_commission_type,
      performance_commission_value: s.performance_commission_value
    }));
  }

  static async fetchProducts(): Promise<CatalogProductItem[]> {
    const { data, error } = await supabase
      .from('products')
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
          is_active
        )
      `);

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || [])
      .filter((p: any) => p.catalog_items?.is_active !== false)
      .map((p: any) => ({
        id: p.id,
        catalog_item_id: p.catalog_item_id,
        name: p.catalog_items?.name || 'Sản phẩm',
        selling_price: Math.round(Number(p.selling_price || 0)),
        stock_quantity: Number(p.stock_quantity || 0),
        minimum_stock: Number(p.minimum_stock || 0),
        unit: p.catalog_items?.unit || 'cái',
        product_type: p.catalog_items?.product_type || 'RETAIL',
        is_active: true
      }));
  }

  static async fetchPackages(): Promise<CatalogPackageItem[]> {
    const { data, error } = await supabase
      .from('packages')
      .select(`
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
      console.error('Error fetching packages:', error);
      return [];
    }

    return (data || []).map((pkg: any) => ({
      id: pkg.id,
      name: pkg.name,
      price: Math.round(Number(pkg.price || 0)),
      validity_days: pkg.validity_days,
      description: pkg.description,
      is_active: true,
      sales_commission_type: pkg.sales_commission_type,
      sales_commission_value: pkg.sales_commission_value,
      items: (pkg.package_items || []).map((pi: any) => ({
        package_id: pi.package_id,
        service_id: pi.service_id,
        service_name: pi.services?.name || 'Dịch vụ',
        quantity: Number(pi.quantity || 1),
        price_override: pi.price_override ? Math.round(Number(pi.price_override)) : undefined,
        item_type: pi.item_type,
        product_id: pi.product_id
      }))
    }));
  }

  static calculateTotals(items: CartItem[], overallDiscount: number = 0) {
    const subtotal = items.reduce((sum, item) => {
      return sum + Math.round(item.unit_price * item.quantity);
    }, 0);

    const itemDiscounts = items.reduce((sum, item) => {
      return sum + Math.round(item.discount_amount || 0);
    }, 0);

    const totalDiscount = Math.round(itemDiscounts + overallDiscount);
    const finalTotal = Math.max(0, Math.round(subtotal - totalDiscount));

    return {
      subtotal: Math.round(subtotal),
      discount_amount: Math.round(totalDiscount),
      total_amount: Math.round(finalTotal)
    };
  }

  /**
   * PHẦN 3: Tạo DRAFT INVOICE
   * Ghi nhận thông tin vào invoices và invoice_items với status = 'DRAFT'.
   * Tuyệt đối không trừ kho, không tạo customer_packages, không tạo commission_logs.
   */
  static async createDraftInvoice(payload: CreateInvoicePayload): Promise<CheckoutResult> {
    try {
      const hasPackage = payload.items.some(i => i.package_id != null);
      if (hasPackage && !payload.customer_id) {
        return {
          success: false,
          error: 'Gói dịch vụ (Package) bắt buộc phải chọn khách hàng trước khi lưu đơn!'
        };
      }

      // 1. Insert Invoices
      const { data: invoice, error: invoiceErr } = await supabase
        .from('invoices')
        .insert({
          organization_id: payload.organization_id,
          branch_id: payload.branch_id,
          customer_id: payload.customer_id || null,
          seller_staff_id: payload.seller_staff_id || null,
          status: 'DRAFT',
          subtotal: payload.subtotal,
          discount_amount: payload.discount_amount,
          total_amount: payload.total_amount,
          payment_method: payload.payment_method
        })
        .select('id')
        .single();

      if (invoiceErr || !invoice) {
        console.error('Error creating draft invoice:', invoiceErr);
        return { success: false, error: invoiceErr?.message || 'Không thể tạo hóa đơn nháp' };
      }

      // 2. Insert Invoice Items
      const invoiceItemsData = payload.items.map((item) => ({
        invoice_id: invoice.id,
        catalog_item_id: item.catalog_item_id || null,
        package_id: item.package_id || null,
        actual_service_id: item.actual_service_id || null,
        seller_staff_id: item.seller_staff_id || null,
        performing_staff_id: item.performing_staff_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        total_amount: item.total_amount
      }));

      const { error: itemsErr } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsData);

      if (itemsErr) {
        console.error('Error creating invoice items:', itemsErr);
        return { success: false, error: itemsErr.message };
      }

      return {
        success: true,
        invoice_id: invoice.id
      };
    } catch (err: any) {
      console.error('Exception creating draft invoice:', err);
      return {
        success: false,
        error: err.message || 'Lỗi hệ thống khi tạo hóa đơn nháp'
      };
    }
  }
}