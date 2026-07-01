import type { ProductListItem } from "@/features/catalog/server/queries";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: ProductListItem[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
