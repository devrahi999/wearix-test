import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
}

export default function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        : products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
    </div>
  );
}
