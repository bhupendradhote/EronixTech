import api from "./api";

// ------------------------------------------------------------------
// TypeScript Interfaces for Nested JSON Data
// ------------------------------------------------------------------
export interface ProductImage {
  image_path: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductOffer {
  offer_title: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface ProductVariant {
  sku: string;
  variant_name: string;
  ram?: string;
  storage?: string;
  color?: string;
  price: number;
  offer_price?: number;
  stock_quantity: number;
  status: 'active' | 'inactive';
}

export interface ProductSpecification {
  group_name: string; // e.g., "Display"
  spec_name: string;  // e.g., "Resolution"
  spec_value: string; // e.g., "1920x1080"
  sort_order?: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  errors?: string[];
}

// ------------------------------------------------------------------
// Main Product Interface
// ------------------------------------------------------------------
export interface Product {
  id: number;
  name: string;
  slug: string;
  product_code?: string;
  sku?: string;
  barcode?: string;
  
  // Product type
  product_type: 'normal' | 'pc_build' | 'pc_pre_build';

  // Relations
  brand_id?: number;
  category_id?: number;
  sub_category_id?: number;
  // Build PC relations
  build_pc_category_id?: number;
  build_pc_subcategory_id?: number;
  build_pc_sub_subcategory_id?: number;

  // Text Content
  short_description?: string;
  description?: string;
  key_features?: string[]; // Parsed from JSON array of strings

  // Pricing
  cost_price?: number;
  mrp: number;
  selling_price: number;
  offer_price?: number;

  // Inventory
  stock_quantity: number;
  minimum_stock_alert: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order';

  // Flags & Statuses
  status: 'active' | 'inactive' | 'draft' | 'archived';
  featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;

  // Nested JSON Data (Parsed automatically by backend)
  images?: ProductImage[];
  video_url?: string | null;
  video_type?: 'none' | 'upload' | 'youtube';
  offers?: ProductOffer[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];

  // Meta
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  activeOnly?: boolean;
  categoryId?: number;
  status?: string;
}

// ------------------------------------------------------------------
// Product Service API Methods
// ------------------------------------------------------------------
const productService = {
  // 1. Get all products (with optional filters)
  getAllProducts: async (filters: ProductFilters = {}): Promise<Product[]> => {
    const params = new URLSearchParams();

    if (filters.activeOnly) params.append("active", "true");
    if (filters.categoryId) params.append("category_id", filters.categoryId.toString());
    if (filters.status) params.append("status", filters.status);

    const response = await api.get<{ success: boolean; data: Product[] }>(`/products?${params.toString()}`);
    return response.data.data;
  },

  // 2. Get single product by ID
  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get<{ success: boolean; data: Product }>(`/products/slug/${slug}`);
    return response.data.data;
  },

  // 3. Create a new product (Accepts FormData because it includes file arrays)
  createProduct: async (data: FormData): Promise<Product> => {
    const response = await api.post<{ success: boolean; data: Product }>("/products", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // 4. Update an existing product
  updateProduct: async (id: number, data: FormData): Promise<Product> => {
    const response = await api.put<{ success: boolean; data: Product }>(`/products/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // 5. Delete / Archive a product
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/products/${id}`);
  },

  // 6. Import products from Excel
  importProducts: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ImportResult>("/products/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default productService;