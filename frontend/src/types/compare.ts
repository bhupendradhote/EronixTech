// types/compare.ts (or inline)
export interface CompareProduct {
  id: number;
  name: string;
  slug: string;
  selling_price: number;
  mrp: number;
  description: string;
  key_features: string[];
  images: { image_path: string; is_primary?: boolean }[];
  specifications: { group_name: string; spec_name: string; spec_value: string }[];
  average_rating: number;
  review_count: number;
  compare_id: number;
  compare_added_at: string;
}

export interface CompareContextType {
  compareProducts: CompareProduct[];
  loading: boolean;
  addToCompare: (productId: number) => Promise<void>;
  removeFromCompare: (productId: number) => Promise<void>;
  clearCompare: () => Promise<void>;
  fetchCompare: () => Promise<void>;
}