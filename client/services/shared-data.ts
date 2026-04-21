import { cache } from 'react';
import { cookies } from 'next/headers';

export const getCachedUser = cache(async (token: string) => {
    try {
        const baseUrl = process.env.API_URL || 'http://localhost:5000'
        const response = await fetch(`${baseUrl}/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            // We want it to be per-request, but deduplicated within same request
            // Next.js fetch cache is separate from react cache()
        })

        if (!response.ok) return null

        const result = await response.json()
        if (result.success && result.data) {
            return result.data
        }
        return null
    } catch {
        return null
    }
});
