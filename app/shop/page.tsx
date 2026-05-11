import Link from "next/link";
import { createOrderAction } from "../actions";
import { countSellableAccounts } from "@/lib/accounts";
import { countOrdersByStatus } from "@/lib/orders";
import { getCurrentSession } from "@/lib/auth";
import {
  findAdminUserByUsername,
  getAdminUserBalance,
} from "@/lib/admin-users";
import { SubmitButton } from "../submit-button";
import { SHOP_PRICE } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRICE = SHOP_PRICE;
const PRODUCT_IMAGE = "https://taphoammo.com/uploads/products/1772524493_69a693cd3d7e0.webp?v=1776537222";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export default async function ShopPage() {
  const session = await getCurrentSession();
  const [sellableCount, completedOrders, currentUser] = await Promise.all([
    countSellableAccounts(),
    countOrdersByStatus("completed"),
    session ? findAdminUserByUsername(session.username) : Promise.resolve(null),
  ]);
  const currentBalance = getAdminUserBalance(currentUser);
  const canAfford = currentBalance >= PRICE;

  const searchParams = {} as any;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/shop" className="text-lg font-bold text-gray-900">GPT Shop</Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-sm text-gray-500">{session.username}</span>
                <span className="text-sm font-semibold text-emerald-600">{formatPrice(currentBalance)}</span>
                <Link href="/my-orders" className="text-sm text-blue-600 hover:underline">Đơn hàng</Link>
                {session.role === "admin" && (
                  <Link href="/admin" className="text-sm text-gray-500 hover:underline">Admin</Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:underline">Đăng nhập</Link>
                <Link href="/register" className="text-sm font-semibold text-blue-600 hover:underline">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Product image */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 mb-8">
          <img
            src={PRODUCT_IMAGE}
            alt="ChatGPT Plus"
            className="w-full object-cover"
          />
        </div>

        {/* Product info */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tài khoản ChatGPT Plus</h1>
        <p className="text-gray-500 mb-6">
          Tài khoản ChatGPT giá rẻ, không bảo hành. Bàn giao tự động ngay sau khi thanh toán.
        </p>

        {/* Price & stock */}
        <div className="flex items-baseline gap-4 mb-8">
          <span className="text-3xl font-bold text-gray-900">{formatPrice(PRICE)}</span>
          <span className="text-sm text-gray-400">/ 1 tài khoản</span>
          <span className={`ml-auto text-sm font-medium ${sellableCount > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {sellableCount > 0 ? `Còn ${sellableCount} tài khoản` : "Hết hàng"}
          </span>
        </div>

        {/* Buy button */}
        <form action={createOrderAction} className="mb-6">
          {session ? (
            sellableCount > 0 && canAfford ? (
              <SubmitButton className="w-full h-12 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors">
                Mua ngay — {formatPrice(PRICE)}
              </SubmitButton>
            ) : (
              <button type="button" disabled className="w-full h-12 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed">
                {sellableCount <= 0 ? "Tạm hết hàng" : "Số dư không đủ"}
              </button>
            )
          ) : (
            <Link href="/login" className="flex items-center justify-center w-full h-12 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors">
              Đăng nhập để mua
            </Link>
          )}
        </form>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-400 border-t border-gray-100 pt-6">
          <span>Đã bán: <strong className="text-gray-600">{completedOrders}</strong></span>
          <span>Kho: <strong className="text-gray-600">{sellableCount}</strong></span>
          <span>Giao hàng: <strong className="text-gray-600">Tự động</strong></span>
        </div>
      </div>
    </div>
  );
}
