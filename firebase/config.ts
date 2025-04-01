import { firebase_app as app, auth, db, storage } from "@/lib/firebase";
import { GoogleAuthProvider } from "firebase/auth";

// Initialize providers
export const googleProvider = new GoogleAuthProvider();

export { auth, db, storage };
export default app;
