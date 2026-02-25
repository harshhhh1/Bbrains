const BASE_URL = 'http://localhost:5000'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...options,
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Request failed')
    }
    return json.data as T
}

export const getDashboard = () => apiFetch<any>('/dashboard')

export const getWallet = () => apiFetch<any>('/wallet/me')
export const getWalletHistory = () => apiFetch<any[]>('/wallet/history')
export const transferFunds = (body: { recipientWalletId: number; amount: number; pin: string; note?: string }) =>
    apiFetch<any>('/wallet/transfer', { method: 'POST', body: JSON.stringify(body) })
export const setupWalletPin = (pin: string) =>
    apiFetch<any>('/wallet/setup', { method: 'POST', body: JSON.stringify({ pin }) })
export const changeWalletPin = (oldPin: string, newPin: string) =>
    apiFetch<any>('/wallet/pin', { method: 'PUT', body: JSON.stringify({ oldPin, newPin }) })

export const getAnnouncements = () => apiFetch<any[]>('/academic/announcements')
export const createAnnouncement = (body: { title: string; content: string; courseId?: number }) =>
    apiFetch<any>('/academic/announcements', { method: 'POST', body: JSON.stringify(body) })
export const deleteAnnouncement = (id: number) =>
    apiFetch<any>(`/academic/announcements/${id}`, { method: 'DELETE' })

export const getAssignments = (courseId?: number) =>
    apiFetch<any[]>(`/academic/assignments${courseId ? `?courseId=${courseId}` : ''}`)

export const getMyGrades = () => apiFetch<any[]>('/grades/me')

export const getMyEnrollments = () => apiFetch<any[]>('/enrollments/me')

export const getMyOrders = () => apiFetch<any[]>('/orders/me')
export const getMyTransactions = () => apiFetch<any[]>('/transactions/me')

export const getLeaderboard = (category = 'allTime') => apiFetch<any[]>(`/leaderboard?category=${category}`)
export const getMyLeaderboardPosition = () => apiFetch<any>('/leaderboard/me')

export const getMyXp = () => apiFetch<any>('/xp/me')
export const getMyAchievements = () => apiFetch<any[]>('/achievements/me')

export const getCourseEnrollments = (courseId: number) =>
    apiFetch<any[]>(`/enrollments/course/${courseId}`)

export const getCourses = () => apiFetch<any[]>('/courses')
