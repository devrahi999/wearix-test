export type Gender = 'men' | 'women' | 'kids' | 'unisex';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  gender: Gender;
  price: number;
  discountPrice?: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: Record<string, number>;
  tags: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  isFlashSale?: boolean;
  isOutOfStock?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  approved: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  parentId?: string;
  emoji?: string;
  description?: string;
}

export interface ProductFilters {
  category?: string;
  gender?: Gender;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}
