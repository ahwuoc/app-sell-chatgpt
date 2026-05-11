import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthSession, SessionPayload } from "@/types/auth";
import {
  findAdminUserByUsername,
  getAdminUserRole,
  hasAdminUsers,
  verifyAdminCredentials,
} from "./admin-users";

const AUTH_COOKIE_NAME = "dashboard_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is required in environment variables");
  }
  return secret;
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string) {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(decoded) as SessionPayload;
  } catch {
    return null;
  }
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function createSessionToken(username: string) {
  const secret = getSessionSecret();
  const payload = encodePayload({
    username,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
}

async function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex === -1) {
    return null;
  }

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const secret = getSessionSecret();
  const expectedSignature = sign(payload, secret);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  const session = decodePayload(payload);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    return null;
  }

  const user = await findAdminUserByUsername(session.username);
  const role = getAdminUserRole(user);
  return role ? { ...session, role } : null;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export function buildLoginRedirectUrl(redirectTo = "/shop") {
  const params = new URLSearchParams({
    redirectTo,
  });

  return `/login?${params.toString()}`;
}

export async function isAuthenticated() {
  return (await getCurrentSession()) !== null;
}

export async function requireAuth() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export async function requireAdmin() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    const params = new URLSearchParams({
      error: "Chi admin moi duoc xem trang nay",
    });
    redirect(`/login?${params.toString()}`);
  }

  return session;
}

export async function redirectIfAuthenticated() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }
}

export async function requireNoAdminExists() {
  if (await hasAdminUsers()) {
    const params = new URLSearchParams({
      error: "He thong da co tai khoan admin",
    });
    redirect(`/login?${params.toString()}`);
  }
}

export async function loginWithCredentials(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const authenticated = await verifyAdminCredentials(normalizedUsername, password);

  if (!authenticated) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, createSessionToken(normalizedUsername), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });

  return true;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
