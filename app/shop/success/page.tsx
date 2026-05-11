import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MessageCircleMore, Copy, Key, Mail, ShieldCheck } from "lucide-react";
import { getAccountByOrderId } from "@/lib/accounts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const orderId = typeof params.orderId === "string" ? params.orderId : null;
  const account = orderId ? await getAccountByOrderId(orderId) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fffdf8_0%,#f5eee3_100%)] px-4 py-10">
      <section className="w-full max-w-2xl">
        <Card className="border-stone-200 bg-white/90 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-4 border-b border-stone-100 pb-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-100 p-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <Badge variant="success" className="mx-auto w-fit gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                Giao hàng thành công
              </Badge>
              <CardTitle className="text-4xl font-bold text-stone-900">
                Tài khoản của bạn đã sẵn sàng
              </CardTitle>
              <p className="text-stone-500">
                Cảm ơn bạn đã tin dùng dịch vụ. Thông tin tài khoản được hiển thị bên dưới.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            {account ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 rounded-2xl border border-stone-200 bg-stone-50/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500">
                      <Mail className="h-3.5 w-3.5" />
                      Email đăng nhập
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-stone-900 break-all">{account.email}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 rounded-2xl border border-stone-200 bg-stone-50/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500">
                      <Key className="h-3.5 w-3.5" />
                      Mật khẩu
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-stone-900">{account.password || "********"}</span>
                    </div>
                  </div>
                </div>

                {account.sessionToken && (
                  <div className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Session Token (Sử dụng để login nhanh)
                    </div>
                    <div className="relative group">
                      <div className="max-h-24 overflow-y-auto rounded-lg bg-white border border-stone-200 p-3 font-mono text-[11px] leading-relaxed text-stone-600 break-all">
                        {account.sessionToken}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-amber-800">
                    <div className="flex items-center gap-2 font-bold mb-1">
                        <MessageCircleMore className="h-4 w-4" />
                        Lưu ý quan trọng
                    </div>
                    Vui lòng đổi mật khẩu ngay sau khi đăng nhập thành công để bảo mật tài khoản. Đơn hàng này cũng đã được lưu trong lịch sử mua hàng của bạn.
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
                Không tìm thấy thông tin tài khoản. Vui lòng liên hệ hỗ trợ hoặc kiểm tra Lịch sử đơn hàng.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/my-orders"
                className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-stone-900 px-6 text-sm font-semibold text-stone-50 transition-all hover:bg-stone-800 active:scale-95"
              >
                Xem tất cả đơn hàng
              </Link>
              <Link
                href="/shop"
                className="flex-1 inline-flex h-12 items-center justify-center rounded-xl border border-stone-200 bg-white px-6 text-sm font-semibold text-stone-700 transition-all hover:bg-stone-50 active:scale-95"
              >
                Quay lại shop
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
