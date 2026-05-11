"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminUser,
  deductAdminUserBalance,
  findAdminUserByUsername,
  getAdminUserBalance,
  refundAdminUserBalance,
  updateAdminUserBalance,
  updateAdminUserRole,
  deleteAdminUser,
} from "@/lib/admin-users";
import {
  buildLoginRedirectUrl,
  getCurrentSession,
  loginWithCredentials,
  logout,
  requireAdmin,
} from "@/lib/auth";
import {
  assignAccountToOrder,
  countSellableAccounts,
  createAccounts,
  deleteAccount,
  findExistingAccounts,
  listAvailableAccountsForSale,
  markAccountAsSold,
  releaseAccountFromOrder,
  updateAccountStatus,
  updateAccountSaleStatus,
  findAccountByEmail,
} from "@/lib/accounts";
import type {
  AccountSaleStatus,
  AccountStatus,
  CreateAccountInput,
} from "@/types/account";
import {
  createOrder,
  getOrderById,
  assignOrderAccount,
  cancelOrder,
  completeOrder,
  listOrdersByUsername,
} from "@/lib/orders";
import { SHOP_PRICE } from "@/lib/config";
import { logTransaction } from "@/lib/transactions";

// --- Helper Functions ---

function readRequiredField(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Thiếu trường dữ liệu bắt buộc: ${key}`);
  }
  return value.trim();
}

function redirectWithMessage(type: "success" | "error", message: string) {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/admin?${params.toString()}`);
}

function redirectToLogin(message: string, redirectTo = "/admin") {
  const params = new URLSearchParams({ error: message, redirectTo });
  redirect(`/login?${params.toString()}`);
}

function redirectToRegister(message: string) {
  const params = new URLSearchParams({ error: message });
  redirect(`/register?${params.toString()}`);
}

function redirectToShop(message: string) {
  const params = new URLSearchParams({ error: message });
  redirect(`/shop?${params.toString()}`);
}

function redirectToOrders(type: "success" | "error", message: string) {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/orders?${params.toString()}`);
}

// --- Auth Actions ---

export async function loginAction(formData: FormData) {
  const username = readRequiredField(formData, "username");
  const password = readRequiredField(formData, "password");
  const redirectToValue = formData.get("redirectTo");
  const redirectTo =
    typeof redirectToValue === "string" && redirectToValue.startsWith("/")
      ? redirectToValue
      : "/admin";

  const authenticated = await loginWithCredentials(username, password);

  if (!authenticated) {
    redirectToLogin("Thông tin đăng nhập không chính xác", redirectTo);
  }

  redirect(redirectTo);
}

export async function registerAction(formData: FormData) {
  const username = readRequiredField(formData, "username").toLowerCase();
  const password = readRequiredField(formData, "password");
  const confirmPassword = readRequiredField(formData, "confirmPassword");

  if (username.length < 3) redirectToRegister("Username phải có ít nhất 3 ký tự");
  if (password.length < 6) redirectToRegister("Mật khẩu phải có ít nhất 6 ký tự");
  if (password !== confirmPassword) redirectToRegister("Mật khẩu nhập lại không khớp");

  const result = await createAdminUser(username, password);
  if (!result.success) redirectToRegister(result.message);

  const authenticated = await loginWithCredentials(username, password);
  if (!authenticated) redirectToLogin("Không thể đăng nhập sau khi đăng ký");

  redirect("/shop");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}

// --- Shop & Order Actions ---

export async function createOrderAction(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) redirect(buildLoginRedirectUrl("/shop"));

  const currentUser = await findAdminUserByUsername(session.username);
  const currentBalance = getAdminUserBalance(currentUser);

  if (currentBalance < SHOP_PRICE) {
    redirectToShop("Số dư không đủ để thực hiện giao dịch");
  }

  const [sellableCount, availableAccounts] = await Promise.all([
    countSellableAccounts(),
    listAvailableAccountsForSale(),
  ]);

  if (sellableCount <= 0 || availableAccounts.length === 0) {
    redirectToShop("Sản phẩm hiện đang hết hàng");
  }

  const selectedAccount = availableAccounts[0];
  const deducted = await deductAdminUserBalance(session.username, SHOP_PRICE);

  if (!deducted) {
    redirectToShop("Lỗi khi trừ số dư, vui lòng thử lại");
  }

  await logTransaction({
    username: session.username,
    type: "purchase",
    amount: SHOP_PRICE,
    balanceBefore: currentBalance,
    balanceAfter: currentBalance - SHOP_PRICE,
    note: "Mua tài khoản ChatGPT",
  });

  const orderId = await createOrder({
    buyerUsername: session.username,
    buyerContact: "Shop Purchase",
  });

  try {
    let reserved = false;
    let reservedAccount = selectedAccount;

    for (const account of availableAccounts) {
      reserved = await assignAccountToOrder(account.id, orderId);
      if (reserved) {
        reservedAccount = account;
        break;
      }
    }

    if (!reserved) {
      await refundAdminUserBalance(session.username, SHOP_PRICE);
      await cancelOrder(orderId);
      await logTransaction({
        username: session.username,
        type: "refund",
        amount: SHOP_PRICE,
        balanceBefore: currentBalance - SHOP_PRICE,
        balanceAfter: currentBalance,
        note: "Hoàn tiền — hết hàng",
      });
      redirectToShop("Tất cả tài khoản vừa được người khác mua mất, tiền đã được hoàn lại. Vui lòng thử lại.");
    }

    const processed = await Promise.all([
      assignOrderAccount(orderId, reservedAccount.id, reservedAccount.email),
      markAccountAsSold(reservedAccount.id, orderId),
      completeOrder(orderId)
    ]);

    if (processed.some(r => !r)) {
      await refundAdminUserBalance(session.username, SHOP_PRICE);
      await logTransaction({
        username: session.username,
        type: "refund",
        amount: SHOP_PRICE,
        balanceBefore: currentBalance - SHOP_PRICE,
        balanceAfter: currentBalance,
        note: "Hoàn tiền — lỗi xử lý đơn",
      });
      throw new Error("Lỗi khi xử lý đơn hàng, tiền đã được hoàn lại");
    }

    revalidatePath("/admin");
    revalidatePath("/orders");
    revalidatePath("/shop");
    revalidatePath("/my-orders");
    revalidatePath("/admin/users");
  } catch (error: any) {
    console.error("Purchase error:", error);
    redirectToShop(`Lỗi xử lý: ${error.message}`);
  }

  redirect(`/shop/success?orderId=${orderId}`);
}

// --- Admin Account Actions ---

export async function bulkImportAccountsAction(formData: FormData) {
  await requireAdmin();
  const payload = readRequiredField(formData, "bulkData");

  const rows = payload
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const seenEmails = new Set<string>();

  const accounts = rows.map((row, index): CreateAccountInput => {
    const parts = row.split("|").map((part) => part.trim());
    let [email, password, sessionToken, accountId, mailkp, passwordMailkp] = ["", "", "", "", "", ""];

    if (parts.length >= 4) {
      [email, password, sessionToken, accountId, mailkp, passwordMailkp] = parts;
    } else if (parts.length >= 2) {
      [email, accountId] = parts;
    }

    if (!email || !accountId) {
      redirectWithMessage("error", `Dòng ${index + 1} không hợp lệ (Cần ít nhất Email và ClientID)`);
    }

    if (seenEmails.has(email.toLowerCase())) {
      redirectWithMessage("error", `Dòng ${index + 1} bị trùng email trong danh sách import`);
    }

    seenEmails.add(email.toLowerCase());

    return { email, accountId, password, sessionToken, mailkp, passwordMailkp, status: "not-registered" };
  });

  const existing = await findExistingAccounts(accounts);
  if (existing.length > 0) {
    redirectWithMessage("error", `Email đã tồn tại trong hệ thống: ${existing[0].email}`);
  }

  await createAccounts(accounts);
  revalidatePath("/admin");
  redirectWithMessage("success", `Đã import thành công ${accounts.length} tài khoản`);
}

export async function updateAccountStatusAction(formData: FormData) {
  await requireAdmin();
  const id = readRequiredField(formData, "id");
  const status = readRequiredField(formData, "status") as AccountStatus;

  const allowedStatuses: AccountStatus[] = ["reg-success", "reg-failed", "not-registered"];
  if (!allowedStatuses.includes(status)) throw new Error("Trạng thái không hợp lệ");

  await updateAccountStatus(id, status);
  revalidatePath("/admin");
  revalidatePath("/orders");
  revalidatePath("/shop");
  redirectWithMessage("success", "Đã cập nhật trạng thái tài khoản");
}

export async function updateAccountSaleStatusAction(formData: FormData) {
  await requireAdmin();
  const id = readRequiredField(formData, "id");
  const saleStatus = readRequiredField(formData, "saleStatus") as AccountSaleStatus;

  await updateAccountSaleStatus(id, saleStatus);
  revalidatePath("/admin");
  revalidatePath("/shop");
  redirectWithMessage("success", "Đã cập nhật trạng thái đăng bán");
}

export async function deleteAccountAction(formData: FormData) {
  await requireAdmin();
  const id = readRequiredField(formData, "id");
  await deleteAccount(id);
  revalidatePath("/admin");
  revalidatePath("/shop");
  redirectWithMessage("success", "Đã xóa tài khoản khỏi hệ thống");
}

// --- Admin Order Management ---

export async function assignOrderAccountAction(formData: FormData) {
  await requireAdmin();
  const orderId = readRequiredField(formData, "orderId");
  const accountId = readRequiredField(formData, "accountId");

  const availableAccounts = await listAvailableAccountsForSale();
  const selectedAccount = availableAccounts.find((a) => a.id === accountId);

  if (!selectedAccount?.email) {
    redirectToOrders("error", "Tài khoản không còn khả dụng để gán");
    return;
  }

  const order = await getOrderById(orderId);
  if (!order || order.status !== "pending" || order.accountId) {
    redirectToOrders("error", "Đơn hàng không hợp lệ để gán tài khoản");
    return;
  }

  const reserved = await assignAccountToOrder(accountId, orderId);
  if (!reserved) {
    redirectToOrders("error", "Tài khoản vừa được sử dụng cho đơn hàng khác");
    return;
  }

  const assigned = await assignOrderAccount(orderId, accountId, selectedAccount.email);
  if (!assigned) {
    await releaseAccountFromOrder(accountId, orderId);
    redirectToOrders("error", "Không thể cập nhật thông tin đơn hàng");
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/orders");
  redirectToOrders("success", "Đã gán tài khoản cho đơn hàng thành công");
}

export async function completeOrderAction(formData: FormData) {
  await requireAdmin();
  const orderId = readRequiredField(formData, "orderId");
  const order = await getOrderById(orderId);

  if (!order || order.status !== "assigned" || !order.accountId) {
    redirectToOrders("error", "Đơn hàng không ở trạng thái có thể hoàn tất");
    return;
  }

  await markAccountAsSold(order.accountId, orderId);
  await completeOrder(orderId);

  revalidatePath("/admin");
  revalidatePath("/orders");
  revalidatePath("/shop");
  redirectToOrders("success", "Đã xác nhận hoàn tất đơn hàng");
}

export async function cancelOrderAction(formData: FormData) {
  await requireAdmin();
  const orderId = readRequiredField(formData, "orderId");
  const order = await getOrderById(orderId);

  if (!order || !["pending", "assigned"].includes(order.status)) {
    redirectToOrders("error", "Đơn hàng này không thể hủy");
    return;
  }

  if (order.accountId && order.status === "assigned") {
    await releaseAccountFromOrder(order.accountId, orderId);
  }

  await cancelOrder(orderId);
  revalidatePath("/admin");
  revalidatePath("/orders");
  revalidatePath("/shop");
  redirectToOrders("success", "Đã hủy đơn hàng và hoàn trả kho (nếu có)");
}

// --- Admin User Management ---

export async function updateBalanceAction(formData: FormData) {
  await requireAdmin();
  const username = readRequiredField(formData, "username");
  const amountStr = readRequiredField(formData, "balance");
  const type = formData.get("type") as string || "set";
  const amount = parseInt(amountStr, 10);

  if (isNaN(amount) || amount < 0) throw new Error("Số tiền không hợp lệ");

  const user = await findAdminUserByUsername(username);
  if (!user) throw new Error("Người dùng không tồn tại");

  let newBalance = amount;
  let message = `Đã đặt số dư cho ${username} là ${amount}`;
  let txType: "credit" | "debit" | "set" = "set";

  if (type === "add") {
    newBalance = (user.balance || 0) + amount;
    message = `Đã cộng ${amount} vào tài khoản ${username}`;
    txType = "credit";
  } else if (type === "subtract") {
    newBalance = Math.max(0, (user.balance || 0) - amount);
    message = `Đã trừ ${amount} từ tài khoản ${username}`;
    txType = "debit";
  }

  const balanceBefore = user.balance || 0;
  await updateAdminUserBalance(username, newBalance);

  await logTransaction({
    username,
    type: txType,
    amount,
    balanceBefore,
    balanceAfter: newBalance,
    note: message,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  redirectWithMessage("success", message);
}

export async function updateUserRoleAction(formData: FormData) {
  await requireAdmin();
  const username = readRequiredField(formData, "username");
  const role = readRequiredField(formData, "role");
  if (role !== "admin" && role !== "user") {
    redirectWithMessage("error", "Quyền không hợp lệ, chỉ chấp nhận admin hoặc user");
    return;
  }

  const session = await getCurrentSession();
  if (session?.username === username) {
    redirectWithMessage("error", "Bạn không thể tự thay đổi quyền của chính mình");
  }

  await updateAdminUserRole(username, role);
  revalidatePath("/admin/users");
  redirectWithMessage("success", `Đã cập nhật quyền thành ${role} cho ${username}`);
}

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();
  const username = readRequiredField(formData, "username");

  const session = await getCurrentSession();
  if (session?.username === username) {
    redirectWithMessage("error", "Bạn không thể tự xóa tài khoản của mình");
  }

  await deleteAdminUser(username);
  revalidatePath("/admin/users");
  redirectWithMessage("success", `Đã xóa vĩnh viễn người dùng ${username}`);
}

// --- External API Actions ---

export async function getMessagesAction(email: string) {
  const session = await getCurrentSession();
  if (!session) throw new Error("Vui lòng đăng nhập");

  if (session.role !== "admin") {
    const userOrders = await listOrdersByUsername(session.username);
    const hasOrder = userOrders.some(order => order.accountEmail === email && order.status === 'completed');
    if (!hasOrder) {
      throw new Error("Bạn không có quyền truy cập tài khoản này");
    }
  }

  // Fetch credentials from DB
  const account = await findAccountByEmail(email);
  if (!account || !account.password || !account.sessionToken) {
    throw new Error("Không tìm thấy thông tin xác thực cho tài khoản này");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://tools.dongvanfb.net/api/get_messages_oauth2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: account.email,
        pass: account.password,
        refresh_token: account.sessionToken,
        client_id: account.accountId,
        list_mail: 'all'
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === true && data.messages) {
      return {
        success: true,
        messages: data.messages.map((msg: any) => {
          let otp = msg.code || "";
          if (otp === "") {
            const matches = msg.message?.match(/>\s*(\d{6})\s*<\/p>/) || msg.message?.match(/[^#](\d{6})/);
            otp = matches ? (matches[1] || matches[0].trim()) : null;
            if (otp) otp = otp.toString().match(/\d{6}/)?.[0] || null;
          }
          return { ...msg, otp };
        })
      };
    }
    return { success: false, message: data.message || "Không có tin nhắn mới" };
  } catch (error: any) {
    console.error("CheckMail error:", error);
    if (error.name === 'AbortError') {
      return { success: false, message: "Lỗi: API phản hồi quá chậm (Timeout 15s)" };
    }
    return { success: false, message: `Lỗi kết nối: ${error.message}` };
  }
}
