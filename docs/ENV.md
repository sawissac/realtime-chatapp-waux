# Environment Variables Documentation

## Summary

This document outlines the environment variables required for the Realtime Chat App Firebase project. These variables configure the Firebase services integration including Authentication, Firestore Database, Realtime Database, Storage, and Analytics. All variables are prefixed with `NEXT_PUBLIC_` to make them available in the client-side Next.js application.

## Environment Variables

| Variable Name | Description | Example Value | Required |
|---------------|-------------|---------------|----------|
| `NEXT_PUBLIC_API_KEY` | Firebase Web API Key for client authentication | `AIzaSyD9kPF-vsCHiK3mfk4Kd8TvQWRVWsvdOo` | ✅ Yes |
| `NEXT_PUBLIC_AUTH_DOMAIN` | Firebase Authentication domain for OAuth redirects | `realtime-chatapp-waux2.firebaseapp.com` | ✅ Yes |
| `NEXT_PUBLIC_PROJECT_ID` | Firebase Project ID identifier | `realtime-chatapp-waux2` | ✅ Yes |
| `NEXT_PUBLIC_STORAGE_BUCKET` | Firebase Cloud Storage bucket for file uploads | `realtime-chatapp-waux2.appspot.com` | ✅ Yes |
| `NEXT_PUBLIC_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID for push notifications | `123456789012` | ✅ Yes |
| `NEXT_PUBLIC_APP_ID` | Firebase App ID for the web application | `1:123456789012:web:f682b730e87a18c4c9eb41` | ✅ Yes |
| `NEXT_PUBLIC_MEASUREMENT_ID` | Google Analytics measurement ID for tracking | `G-JV15710R2T` | ⚠️ Optional |
| `NEXT_PUBLIC_DATABASE_URL` | Firebase Realtime Database URL for real-time chat functionality | `https://realtime-chatapp-waux-default-rtdb.asia-southeast1.firebasedatabase.app` | ✅ Yes |

## Configuration Notes

### Firebase Services Used
- **Authentication**: User signup, signin, and session management
- **Realtime Database**: Real-time chat messages and channel data
- **Cloud Storage**: File and media uploads in chat
- **Analytics**: User interaction tracking (optional)

### Security Considerations
- All variables are client-side accessible due to `NEXT_PUBLIC_` prefix
- API key is restricted by Firebase security rules and domain restrictions
- Database access is controlled by Firebase Realtime Database security rules

### Setup Instructions
1. Create a `.env.local` file in the project root
2. Copy all variables from `.env` to `.env.local`
3. Replace example values with your actual Firebase project configuration
4. Ensure `.env.local` is added to `.gitignore` for security

### Regional Configuration
- The Realtime Database is configured for the `asia-southeast1` region
- Ensure your Firebase project matches this regional setting for optimal performance

## Related Files
- `/src/lib/firebase.ts` - Firebase configuration and initialization
- `/src/store/slices/userSlice.ts` - Authentication state management
- `/.env` - Environment variables template (committed to repository)
- `/.env.local` - Local environment variables (not committed)
