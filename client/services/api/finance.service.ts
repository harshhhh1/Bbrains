import { api } from "./base";

export const financeApi = {
  getWallet: () => api.get<any>("/wallet"),
  getTransactions: (page = 1, limit = 10) => api.get<any[]>(`/wallet/transactions?page=${page}&limit=${limit}`),
  getMyTransactions: (params?: any) => api.get<any[]>("/wallet/transactions", { params }),
  getRecordedTransactions: (params?: any) => api.get<any[]>("/wallet/recorded-transactions", { params }),
  
  createManualTransaction: (data: any) => api.post<any>("/wallet/manual-transaction", data),
  getFeeSummary: () => api.get<any>("/finance/fees/summary"),
  getSummary: () => api.get<any>("/finance/fees/summary"),
  getDues: () => api.get<any>("/finance/fees/summary"),
  getUserTransactions: (userId: string, params?: any) => api.get<any[]>(`/wallet/transactions/user/${userId}`, { params }),
  getUserDues: (userId: string) => api.get<any>(`/finance/fees/summary/${userId}`),
  
  getRequests: () => api.get<any[]>("/wallet/requests"),
  getIncomingRequests: () => api.get<any[]>("/wallet/requests/incoming"),
  createRequest: (toUserId: string, amount: number, reason: string) => api.post<any>("/wallet/requests", { toUserId, amount, reason }),
  respondToRequest: (requestId: string, accept: boolean, pin?: string) => api.post<any>(`/wallet/requests/${requestId}/respond`, { accept, pin }),
  transfer: (toUserId: string, amount: number, pin: string) => api.post<any>("/wallet/transfer", { toUserId, amount, pin }),
  setupPin: (pin: string) => api.post<any>("/wallet/setup-pin", { pin }),
  changePin: (oldPin: string, newPin: string) => api.post<any>("/wallet/change-pin", { oldPin, newPin }),
};
