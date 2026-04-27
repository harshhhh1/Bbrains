# Bug Report - Student Role

Testing conducted with username: `sachin@gmail.com`

## 1. Results Page - Academic Assessments Fetch Error
- **Error:** `GET http://localhost:5000/academic/assessments/my` returns **404 Not Found**.
- **Location:** `http://localhost:3000/results`
- **Potential Cause:** The backend endpoint `/academic/assessments/my` is either not implemented or the route is defined differently (e.g., missing `/my` or pluralization issue).
- **Impact:** Student cannot see their academic results/assessments.

## 2. Chat Page - User Profile Fetch Error
- **Error:** `GET http://localhost:5000/chat/profile/me` returns **404 Not Found**.
- **Location:** `http://localhost:3000/chat`
- **Potential Cause:** Backend might be expecting `/chat/profile` or the profile endpoint is under a different module.
- **Impact:** User profile details might be missing in the chat interface.

## 3. Chat Page - Notification Mark Read Error
- **Error:** `POST http://localhost:5000/notifications/channel/global_4/read` returns **404 Not Found**.
- **Location:** `http://localhost:3000/chat`
- **Potential Cause:** The route for marking notifications as read for a specific channel might be `/notifications/read/:channelId` or similar, but the current request structure is not matching the backend.
- **Impact:** Notifications remain "unread" even after viewing the chat.

## 4. Events Page - Placeholder Image Error
- **Error:** `GET http://localhost:3000/_next/image?url=https%3A%2F%2Fplacehold.co%2F...` returns **400 Bad Request**.
- **Location:** `http://localhost:3000/events`
- **Potential Cause:** Next.js Image component requires external domains to be configured in `next.config.ts` (or `next.config.js`). `placehold.co` is likely missing from the `images.remotePatterns` or `images.domains` configuration.
- **Impact:** Event placeholder images do not load.

## 5. Chat Page - Image Blocked (ORB)
- **Error:** `GET https://res.cloudinary.com/...` returns `net::ERR_BLOCKED_BY_ORB`.
- **Location:** `http://localhost:3000/chat`
- **Potential Cause:** Cross-Origin Read Blocking (ORB) in Chrome. This often happens if the Content-Type header from the external resource doesn't match the expected type, or if CORS is not correctly configured on the resource server.
- **Impact:** Some chat avatars/attachments fail to display.
