import { fetchProducts } from "./data";
import { ProductsClient } from "./components/ProductsClient";

export default async function ProductsPage() {
  const products = await fetchProducts();

  return <ProductsClient initialProducts={products} />;
}
