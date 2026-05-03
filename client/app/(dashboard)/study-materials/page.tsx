'use client'

import { StudyMaterialsPage } from '@/features/study-materials/ui/StudyMaterialsPage'
import { useUser } from '@/hooks/use-user'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function StudyMaterialsRoute() {
  const { user } = useUser()
  const [courseId, setCourseId] = useState<string>()
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // For students, get their enrolled courseId
  useEffect(() => {
    if (user?.type === 'student' && user?.collegeId) {
      // Fetch enrolled courses from backend API
      fetch(`${API_URL}/enrollments/me`, { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.length > 0) {
            setCourseId(String(data.data[0].courseId))
          }
        })
        .catch(err => console.error('Failed to fetch enrollments:', err))
    }
  }, [user])

  // Prevent hydration mismatch - don't render on server
  if (!isClient) {
    return <div className="container mx-auto py-6">Loading...</div>
  }

  if (!user?.collegeId) {
    return <div className="container mx-auto py-6">Loading user data...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <StudyMaterialsPage 
        collegeId={user?.collegeId ? String(user.collegeId) : undefined}
        courseId={user?.type === 'student' ? courseId : undefined}
      />
    </div>
  )
}
