export type SessionPayload = {
  username: string;
  expiresAt: number;
};

export type AuthSession = SessionPayload & {
  role: "admin" | "user";
};
