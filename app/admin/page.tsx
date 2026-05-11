import Link from "next/link";
import {
  deleteAccountAction,
  logoutAction,
  updateAccountStatusAction,
  updateBalanceAction,
  updateAccountSaleStatusAction,
} from "../actions";
import { SubmitButton } from "../submit-button";
import { ImportModal } from "@/components/import-modal";
import { MessagesModal } from "@/components/messages-modal";
import { requireAdmin } from "@/lib/auth";
import {
  countSellableAccounts,
  countSoldAccounts,
  listAccounts,
} from "@/lib/accounts";
import { listAdminUsers } from "@/lib/admin-users";
import { listOrders } from "@/lib/orders";
import type { AccountStatus, AccountView } from "@/types/account";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database,
  ExternalLink,
  History,
  LogOut,
  Package,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  Users,
  Wallet,
  X,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;


function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

export default async function AdminPage() {
  await requireAdmin();

  const [accounts, users, orders, sellableCount, soldCount] = await Promise.all([
    listAccounts(),
    listAdminUsers(),
    listOrders(),
    countSellableAccounts(),
    countSoldAccounts(),
  ]);

  const totalUserBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
  const totalRevenue = orders.filter(o => o.status === 'completed').length * 10000;

  const stats = {
    totalAccounts: accounts.length,
    sellable: sellableCount,
    sold: soldCount,
    totalUsers: users.length,
    revenue: totalRevenue,
    totalBalance: totalUserBalance,
  };

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        <header className="flex flex-col gap-6 rounded-[24px] border border-white bg-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Database className="h-4 w-4" />
              Admin Control Panel
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Hệ thống quản trị
            </h1>
            <p className="max-w-2xl text-slate-500">
              Quản lý tài khoản, người dùng và theo dõi doanh thu thời gian thực.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
            >
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Xem shop
            </Link>
            <Link
              href="/orders"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200"
            >
              <ShoppingBag className="h-4 w-4" />
              Tất cả đơn hàng
            </Link>
            <ImportModal />
            <form action={logoutAction}>
              <SubmitButton variant="outline" className="h-11 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700">
                <LogOut className="h-4 w-4" />
              </SubmitButton>
            </form>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden group">
            <div className="h-1 bg-blue-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <Package className="h-4 w-4" /> Tổng tài khoản
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{stats.totalAccounts}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400 flex gap-4">
                <span>{stats.sellable} sẵn sàng</span>
                <span>{stats.sold} đã bán</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-emerald-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Doanh thu (Ước tính)
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-600">{formatPrice(stats.revenue)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">
                Dựa trên {stats.sold} đơn hàng hoàn tất
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-amber-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <Users className="h-4 w-4" /> Người dùng
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{stats.totalUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">
                {users.filter(u => u.role === 'admin').length} Admin, {users.filter(u => u.role !== 'admin').length} User
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-purple-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Tổng số dư
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-600">{formatPrice(stats.totalBalance)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">
                Tiền của người dùng trong hệ thống
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-8">
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Quản lý Tài khoản</CardTitle>
                  <CardDescription>Danh sách tài khoản Hotmail/ChatGPT trong kho</CardDescription>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-slate-50 border-slate-100 text-slate-600 font-bold">
                  {accounts.length}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-50">
                        <TableHead className="px-8 py-4 text-slate-600">Email</TableHead>
                        <TableHead className="px-6 py-4 text-slate-600">Inbox</TableHead>
                        <TableHead className="px-6 py-4 text-slate-600">Trạng thái</TableHead>
                        <TableHead className="px-6 py-4 text-slate-600">Đăng bán</TableHead>
                        <TableHead className="px-6 py-4 text-slate-600">Cập nhật</TableHead>
                        <TableHead className="px-6 py-4 text-center text-slate-600">Xóa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.slice(0, 50).map((account) => (
                        <TableRow key={account.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                          <TableCell className="px-8 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900">{account.email}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{account.accountId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <MessagesModal email={account.email} />
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge
                              variant={account.saleStatus === 'sold' ? 'outline' : account.saleStatus === 'available' ? 'default' : 'secondary'}
                              className={`font-medium ${account.saleStatus === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}`}
                            >
                              {account.saleStatus === 'sold' ? 'Đã bán' : account.saleStatus === 'available' ? 'Đang bán' : 'Tạm dừng'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <form action={updateAccountStatusAction} className="flex items-center gap-2">
                                <input type="hidden" name="id" value={account.id} />
                                <select
                                  name="status"
                                  defaultValue={account.status}
                                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium focus:ring-2 focus:ring-slate-100 outline-none"
                                >
                                  <option value="not-registered">Chưa reg</option>
                                  <option value="reg-success">Thành công</option>
                                  <option value="reg-failed">Thất bại</option>
                                </select>
                                <SubmitButton className="h-8 px-3 text-xs bg-slate-900">Lưu</SubmitButton>
                              </form>

                              {account.saleStatus !== 'sold' && (
                                <form action={updateAccountSaleStatusAction} className="flex items-center gap-2">
                                  <input type="hidden" name="id" value={account.id} />
                                  <input
                                    type="hidden"
                                    name="saleStatus"
                                    value={account.saleStatus === 'available' ? 'reserved' : 'available'}
                                  />
                                  <button
                                    type="submit"
                                    className={`h-7 px-3 text-[10px] font-bold rounded-md transition-all ${account.saleStatus === 'available'
                                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                      }`}
                                  >
                                    {account.saleStatus === 'available' ? 'Ngừng bán' : 'Bật bán ngay'}
                                  </button>
                                </form>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <form action={deleteAccountAction}>
                              <input type="hidden" name="id" value={account.id} />
                              <button
                                type="submit"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500 transition-all hover:bg-red-50 hover:border-red-200 active:scale-90"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </form>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-8">
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-5">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" /> Quản lý Người dùng
                  </CardTitle>
                  <CardDescription>Chuyển sang trang riêng để quản lý số dư, quyền và tài khoản</CardDescription>
                </div>
                <Link
                  href="/admin/users"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100 active:scale-95"
                >
                  Mở trang user
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6 pt-5">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {users.filter((user) => user.role === "admin").length} admin,{" "}
                    {users.filter((user) => user.role !== "admin").length} user thường
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  Tách riêng màn quản lý user để dễ thao tác hơn khi số lượng tài khoản tăng lên.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden rounded-3xl">
              <CardHeader className="border-b border-slate-50 px-6 py-5">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-500" /> Đơn hàng gần đây
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-1">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="px-6 py-3 border-b border-slate-50 last:border-0 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className="text-[10px] text-slate-400">{order.buyerContact}</span>
                      </div>
                      <Badge className="text-[10px] px-1.5 py-0">
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-50">
                  <Link href="/orders" className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1">
                    Xem tất cả đơn hàng <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main >
  );
}
