import React, { useState, useEffect } from 'react';
import { Category, CatalogType, TenantContext } from '../types/catalog';
import { catalogService } from '../services/catalogService';

interface CategoryManagerModalProps {
  isOpen: boolean;
  type: CatalogType;
  tenant: TenantContext;
  onClose: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  type,
  tenant,
  onClose,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) loadCategories();
  }, [isOpen, type]);

  const loadCategories = async () => {
    try {
      const data = await catalogService.getCategories(tenant, type);
      setCategories(data);
    } catch (err: any) {
      setErrorMsg('Lỗi khi tải danh mục');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      await catalogService.saveCategory(tenant, {
        id: editingId || undefined,
        name,
        type,
        status: 'active',
      });
      setName('');
      setEditingId(null);
      await loadCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await catalogService.deleteCategory(tenant, id);
      await loadCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">
            Quản lý Danh mục {type === 'service' ? 'Dịch vụ' : 'Sản phẩm'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{errorMsg}</div>}

          <form onSubmit={handleSave} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Tên danh mục..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded font-medium hover:bg-emerald-700"
            >
              {editingId ? 'Sửa' : 'Thêm'}
            </button>
          </form>

          <div className="border rounded max-h-60 overflow-y-auto divide-y">
            {categories.length === 0 ? (
              <p className="p-4 text-center text-xs text-gray-400">Chưa có danh mục nào</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="p-2.5 flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{cat.name}</span>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setName(cat.name);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};