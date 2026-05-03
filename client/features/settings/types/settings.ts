import type { User as ApiUser } from "@/services/api/client";

export type SettingsUser = ApiUser & {
  userDetails?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    phone?: string;
    sex?: string;
    avatar?: string | null;
  };
};

export type ProfileFormState = {
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;
  sex: string;
  avatar: string;
};

export type SavingState = "profile" | "password" | "pin" | "avatar" | null;
