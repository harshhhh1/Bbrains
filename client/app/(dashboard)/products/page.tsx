import { fetchProducts } from "@/features/products/api/data";
import { ProductsClient } from "@/features/products/ui/ProductsClient";

export default async function ProductsPage() {
  const products = await fetchProducts();

  return <ProductsClient initialProducts={products} />;
}
