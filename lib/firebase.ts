import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, type Firestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, type FirebaseStorage, connectStorageEmulator } from "firebase/storage"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate configuration
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`)
  }
}

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize services
auth = getAuth(app)
db = getFirestore(app)
storage = getStorage(app)

// Enable offline persistence for better UX
if (typeof window !== "undefined") {
  import("firebase/firestore").then(({ enableNetwork, disableNetwork }) => {
    // Handle connection issues gracefully
    const handleConnectionError = () => {
      console.warn("Firebase connection lost, enabling offline mode")
      disableNetwork(db).catch(() => {
        // Ignore errors when disabling network
      })

      // Try to reconnect after 5 seconds
      setTimeout(() => {
        enableNetwork(db).catch(() => {
          // Ignore errors when enabling network
        })
      }, 5000)
    }

    // Listen for connection changes
    window.addEventListener("online", () => {
      enableNetwork(db).catch(() => {
        // Ignore errors when enabling network
      })
    })

    window.addEventListener("offline", handleConnectionError)
  })
}

// Connect to emulators in development (OPTIONAL)
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true"

  if (useEmulators) {
    try {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
      connectFirestoreEmulator(db, "localhost", 8080)
      connectStorageEmulator(storage, "localhost", 9199)
      console.log("Connected to Firebase emulators")
    } catch (error) {
      console.warn("Failed to connect to Firebase emulators:", error)
    }
  }
}

export { app, auth, db, storage }
export default app
