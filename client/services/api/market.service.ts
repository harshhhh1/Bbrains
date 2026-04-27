import { api } from "./base";

export const marketApi = {
  getProducts: (page = 1, limit = 10) => api.get<any[]>(`/market/products?page=${page}&limit=${limit}`),
  getProduct: (id: number) => api.get<any>(`/market/products/${id}`),
  getMyProducts: () => api.get<any[]>("/market/my-products"),
  createProduct: (data: any) => api.post<any>("/market/products", data),
  updateProduct: (id: number, data: any) => api.put<any>(`/market/products/${id}`, data),
  deleteProduct: (id: number) => api.delete<any>(`/market/products/${id}`),
  requestEditReview: (id: number, data: any) => api.post<any>(`/market/products/${id}/request-edit`, data),
  
  getCart: () => api.get<any[]>("/market/cart"),
  addToCart: (productId: number, quantity: number) => api.post<any>("/market/cart", { productId, quantity }),
  removeFromCart: (productId: number) => api.delete<any>(`/market/cart/${productId}`),
  
  getLibrary: (category?: string, page = 1, limit = 10) => 
    api.get<any[]>(`/market/library?page=${page}&limit=${limit}${category ? `&category=${category}` : ""}`),
  getDownloadUrl: (productId: number) => api.get<{ url: string }>(`/market/download/${productId}`),
  
  checkout: (pin: string) => api.post<any>("/market/checkout", { pin }),
  buyNow: (productId: number, quantity: number, pin: string) => api.post<any>("/market/buy-now", { productId, quantity, pin }),
  
  getOrders: (page = 1, limit = 10) => api.get<any[]>(`/market/orders?page=${page}&limit=${limit}`),
  getOrderDetails: (id: string) => api.get<any>(`/market/orders/${id}`),
  
  getReviews: (productId: number) => api.get<any>(`/market/reviews/${productId}`),
  createReview: (productId: number, data: any) => api.post<any>(`/market/reviews/${productId}`, data),
  hasPurchased: (productId: number) => api.get<{ hasPurchased: boolean }>(`/market/products/${productId}/purchased`),
  getSales: () => api.get<any>("/market/sales"),
};
