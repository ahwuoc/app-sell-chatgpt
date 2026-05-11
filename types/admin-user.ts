export type AdminUserRole = "admin" | "user";

export type AdminUserDocument = {
  username: string;
  passwordHash: string;
  role?: AdminUserRole;
  balance?: number;
  createdAt: Date;
  updatedAt: Date;
};
