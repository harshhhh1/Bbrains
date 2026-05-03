import { cache } from 'react';
import { cookies } from 'next/headers';

export const getCachedUser = cache(async (token: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000'
    const cookieStore = await cookies()
    const impersonateCollegeId = cookieStore.get('impersonateCollegeId')?.value

    const fetchWithRetry = async (retries = 2, delay = 500): Promise<any> => {
        try {
            const url = `${baseUrl}/users/me`
            console.log(`[getCachedUser] Fetching from: ${url}`)
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...(impersonateCollegeId ? { 'X-Impersonate-College-Id': impersonateCollegeId } : {}),
                },
                next: { revalidate: 0 } // Ensure we get fresh data
            })
            
            if (response.ok) {
                const result = await response.json()
                if (result.success && result.data) return result.data
            } else {
                console.error(`[getCachedUser] Failed with status: ${response.status}`)
            }
            
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay))
                return fetchWithRetry(retries - 1, delay * 2)
            }
            return null
        } catch (error) {
            console.error(`[getCachedUser] Error:`, error)
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay))
                return fetchWithRetry(retries - 1, delay * 2)
            }
            return null
        }
    }

    return fetchWithRetry()
});
