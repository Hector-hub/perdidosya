import { Timestamp } from "firebase/firestore";
import { Location } from "./locations";

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorEmail?: string | null;
  authorPhotoURL?: string | null;
  isAnonymous?: boolean;
  createdAt: Timestamp;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location?: Location;
  type?: "perdido" | "encontrado"; // Tipo de objeto: perdido o encontrado
  authorId: string;
  authorName: string;
  authorEmail?: string | null;
  authorPhotoURL?: string | null;
  isAnonymous: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likes: string[]; // User IDs who liked the item
  comments: Comment[];
}

export type CommentArray = Comment[];
