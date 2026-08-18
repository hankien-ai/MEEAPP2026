import { useMemo, useState } from "react";
import {
  Box,
  Clock3,
  Edit3,
  Filter,
  Grid2X2,
  PackagePlus,
  Plus,
  Search,
  Sparkles,
  ToggleLeft,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { demoCatalog, formatVnd } from "@/data/demo";
import type { CatalogItem } from "@/types/domain";
import {
  Badge,
  Modal,
  PageHeader,
  Panel,
  PanelHeader,
  Toast,
} from "@/components/primitives";

function CatalogForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (item: CatalogItem) => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"service" | "product">("service");
  const [price, setPrice] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      id: `item-${Date.now()}`,
      organizationId: "org-mee",
      name: name || "Danh mục mới",
      kind,
      category: kind === "service" ? "Dịch vụ" : "Sản phẩm",
      price: Number(price) || 0,
      active: true,
      durationMinutes: kind === "service" ? 60 : undefined,
      stock: kind === "product" ? 0 : undefined,
      unit: kind === "product" ? "sản phẩm" : undefined,
    });
  };
  return (
    <Modal
      title="Thêm vào danh mục"
      description="Tạo nhanh một mục demo để kiểm tra luồng vận hành."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4 p-5">
        <div>
          <label className="label" htmlFor="catalog-name">
            Tên mục
          </label>
          <input
            id="catalog-name"
            className="input"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            data-testid="input-catalog-name"
            placeholder="Tên dịch vụ hoặc sản phẩm"
          />
        </div>
        <div>
          <label className="label" htmlFor="catalog-kind">
            Loại
          </label>
          <select
            id="catalog-kind"
            className="input"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as "service" | "product")
            }
            data-testid="select-catalog-kind"
          >
            <option value="service">Dịch vụ</option>
            <option value="product">Sản phẩm</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="catalog-price">
            Giá niêm yết (VND)
          </label>
          <input
            id="catalog-price"
            className="input"
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            data-testid="input-catalog-price"
            placeholder="680000"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="btn btn-soft"
            onClick={onClose}
            data-testid="button-cancel-catalog"
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            data-testid="button-save-catalog"
          >
            <Plus size={15} /> Lưu mục
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CatalogPage() {
  const [location] = useLocation();
  const [items, setItems] = useState(demoCatalog);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState("");
  const activeKind = location.endsWith("/services")
    ? "service"
    : location.endsWith("/products")
      ? "product"
      : "all";
  const shown = useMemo(
    () =>
      items.filter(
        (item) =>
          (activeKind === "all" || item.kind === activeKind) &&
          item.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [activeKind, items, query],
  );
  const save = (item: CatalogItem) => {
    setItems((current) => [item, ...current]);
    setFormOpen(false);
    setToast("Đã thêm mục mới vào danh mục demo.");
  };
  return (
    <div className="page-wrap">
      <PageHeader
        kicker="Thiết lập vận hành"
        title="Danh mục"
        subtitle="Một nơi cho toàn bộ dịch vụ, sản phẩm và giá bán của MEE."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => setFormOpen(true)}
            data-testid="button-add-catalog-item"
          >
            <Plus size={15} /> Thêm danh mục
          </button>
        }
      />
      <div className="mb-5 tab-bar">
        <Link
          href="/catalog"
          className={`tab ${activeKind === "all" ? "active" : ""}`}
          data-testid="tab-catalog-all"
        >
          Tất cả <span className="ml-1 opacity-60">{items.length}</span>
        </Link>
        <Link
          href="/catalog/services"
          className={`tab ${activeKind === "service" ? "active" : ""}`}
          data-testid="tab-catalog-services"
        >
          Dịch vụ{" "}
          <span className="ml-1 opacity-60">
            {items.filter((i) => i.kind === "service").length}
          </span>
        </Link>
        <Link
          href="/catalog/products"
          className={`tab ${activeKind === "product" ? "active" : ""}`}
          data-testid="tab-catalog-products"
        >
          Sản phẩm{" "}
          <span className="ml-1 opacity-60">
            {items.filter((i) => i.kind === "product").length}
          </span>
        </Link>
      </div>
      <Panel testId="panel-catalog">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={16}
              className="absolute left-3 top-3 text-muted-foreground"
            />
            <input
              className="input pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm trong danh mục..."
              data-testid="input-search-catalog"
            />
          </div>
          <button
            className="btn btn-soft"
            onClick={() => setToast("Bộ lọc tồn kho sẽ được kết nối sau.")}
            data-testid="button-filter-catalog"
          >
            <Filter size={15} /> Lọc
          </button>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((item) => (
            <div
              className="panel catalog-card"
              key={item.id}
              data-testid={`card-catalog-${item.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="catalog-orb">
                  {item.kind === "service" ? (
                    <Sparkles size={18} />
                  ) : (
                    <Box size={18} />
                  )}
                </div>
                <button
                  className="btn btn-ghost !p-2"
                  onClick={() => setToast(`Đang mở chỉnh sửa ${item.name}.`)}
                  aria-label={`Sửa ${item.name}`}
                  data-testid={`button-edit-catalog-${item.id}`}
                >
                  <Edit3 size={15} />
                </button>
              </div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold">{item.name}</h3>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {item.category}
                  </div>
                </div>
                <Badge tone={item.kind === "service" ? "green" : "coral"}>
                  {item.kind === "service" ? "Dịch vụ" : "Sản phẩm"}
                </Badge>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                <span className="font-mono-app text-sm font-medium">
                  {formatVnd(item.price)}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {item.kind === "service" ? (
                    <>
                      <Clock3 size={12} /> {item.durationMinutes} phút
                    </>
                  ) : (
                    <>
                      <PackagePlus size={12} /> Còn {item.stock} {item.unit}
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
        {shown.length === 0 && (
          <div
            className="p-8 text-center text-xs text-muted-foreground"
            data-testid="empty-catalog"
          >
            Không có mục phù hợp.
          </div>
        )}
      </Panel>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="notice">
          <ToggleLeft size={16} />
          <div>
            <strong className="text-xs">Danh mục đang hoạt động</strong>
            <p className="mt-1 text-[11px] opacity-75">
              8 mục · Giá bán theo chi nhánh
            </p>
          </div>
        </div>
        <div className="notice">
          <Grid2X2 size={16} />
          <div>
            <strong className="text-xs">Phân loại rõ ràng</strong>
            <p className="mt-1 text-[11px] opacity-75">
              Dịch vụ và sản phẩm độc lập
            </p>
          </div>
        </div>
      </div>
      {formOpen && (
        <CatalogForm onClose={() => setFormOpen(false)} onSave={save} />
      )}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
