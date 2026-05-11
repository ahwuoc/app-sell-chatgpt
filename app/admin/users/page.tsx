import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Wallet,
  ShieldCheck,
  UserPlus,
  Search,
  Calendar,
  ShoppingBag,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { updateBalanceAction, updateUserRoleAction } from "@/app/actions";
import { SubmitButton } from "@/app/submit-button";
import { DeleteUserButton } from "@/components/delete-user-button";
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
import { requireAdmin } from "@/lib/auth";
import { listAdminUsers } from "@/lib/admin-users";
import { listOrders } from "@/lib/orders";
import { listTransactions } from "@/lib/transactions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

export default async function AdminUsersPage() {
  await requireAdmin();

  const [users, orders, transactions] = await Promise.all([
    listAdminUsers(),
    listOrders(),
    listTransactions(100),
  ]);

  const adminCount = users.filter((user) => user.role === "admin").length;
  const userCount = users.length - adminCount;
  const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);

  // Calculate order counts per user
  const userOrderStats = orders.reduce((acc, order) => {
    const username = order.buyerUsername;
    if (username) {
      acc[username] = (acc[username] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">

        {/* Header Section */}
        <header className="flex flex-col gap-6 rounded-[24px] border border-white bg-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Users className="h-4 w-4" />
              User Management
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Hệ thống người dùng
            </h1>
            <p className="max-w-2xl text-slate-500">
              Quản lý tài khoản khách hàng, phân quyền quản trị và điều chỉnh số dư hệ thống.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Bàn làm việc
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200"
            >
              <UserPlus className="h-4 w-4" />
              Thêm User mới
            </Link>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-blue-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <Users className="h-4 w-4" /> Tổng người dùng
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{users.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">Hệ thống đang phục vụ</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-amber-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Ban quản trị
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-600">{adminCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">{userCount} người dùng thường</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-emerald-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Tổng số dư
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-600">{formatPrice(totalBalance)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">Tổng tiền lưu thông hệ thống</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-purple-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Hoạt động
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-600">{orders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">Tổng số đơn hàng đã đặt</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Users Table */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden rounded-3xl">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-50 px-8 py-6 md:flex-row md:items-center md:justify-between space-y-0">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Danh sách thành viên</CardTitle>
              <CardDescription>Tra cứu và thực hiện các thay đổi quyền hạn, số dư.</CardDescription>
            </div>
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm username..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-50">
                    <TableHead className="px-8 py-4 text-slate-600 font-bold">Thành viên</TableHead>
                    <TableHead className="px-6 py-4 text-slate-600 font-bold">Quyền hạn</TableHead>
                    <TableHead className="px-6 py-4 text-slate-600 font-bold">Số dư hiện tại</TableHead>
                    <TableHead className="px-6 py-4 text-slate-600 font-bold text-center">Đơn hàng</TableHead>
                    <TableHead className="px-6 py-4 text-slate-600 font-bold">Thao tác nhanh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.username} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 font-bold text-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{user.username}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <Calendar className="h-3 w-3" />
                              Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <Badge
                          variant="secondary"
                          className={`h-5 px-2 text-[10px] font-black uppercase rounded-md ${user.role === "admin"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                            }`}
                        >
                          {user.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <span className="text-sm font-black text-emerald-600">
                          {formatPrice(user.balance || 0)}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center">
                        <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                          {userOrderStats[user.username] || 0} đơn
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col gap-3 max-w-[280px]">
                          {/* Balance Update Form */}
                          <form action={updateBalanceAction} className="flex gap-1">
                            <input type="hidden" name="username" value={user.username} />
                            <select
                              name="type"
                              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-1 text-[10px] font-bold outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
                              defaultValue="add"
                            >
                              <option value="add">Cộng (+)</option>
                              <option value="subtract">Trừ (-)</option>
                              <option value="set">Đặt (Set)</option>
                            </select>
                            <div className="relative flex-1">
                              <Wallet className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                              <input
                                type="number"
                                name="balance"
                                placeholder="Số tiền..."
                                className="h-8 w-full rounded-lg border border-slate-200 pl-8 pr-2 text-[11px] outline-none transition-all focus:ring-2 focus:ring-slate-100 bg-white"
                                required
                              />
                            </div>
                            <SubmitButton className="h-8 rounded-lg bg-slate-900 px-3 text-[10px] font-bold">Lưu</SubmitButton>
                          </form>

                          {/* Role and Delete row */}
                          <div className="flex items-center gap-2">
                            <form action={updateUserRoleAction} className="flex flex-1 gap-2">
                              <input type="hidden" name="username" value={user.username} />
                              <select
                                name="role"
                                defaultValue={user.role || "user"}
                                className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
                              >
                                <option value="user">Người dùng (User)</option>
                                <option value="admin">Quản trị viên (Admin)</option>
                              </select>
                              <SubmitButton className="h-8 rounded-lg border-none bg-slate-100 px-3 text-[10px] font-bold text-slate-600 shadow-none hover:bg-slate-200">
                                Lưu
                              </SubmitButton>
                            </form>
                            <DeleteUserButton username={user.username} />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        {/* Transaction History */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Lịch sử giao dịch</CardTitle>
                <CardDescription>Tất cả thay đổi số dư: cộng, trừ, mua hàng, hoàn tiền.</CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1 font-bold text-slate-500">{transactions.length} bản ghi</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Wallet className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">Chưa có giao dịch nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-50">
                      <TableHead className="px-8 py-4 text-slate-600 font-bold">Thời gian</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold">User</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold">Loại</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold text-right">Số tiền</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold text-right">Trước</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold text-right">Sau</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold">Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-slate-50 hover:bg-slate-50/30">
                        <TableCell className="px-8 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">{tx.createdAt}</TableCell>
                        <TableCell className="px-6 py-4 text-sm font-bold text-slate-900">{tx.username}</TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-black uppercase px-2 ${tx.type === "credit" ? "bg-emerald-50 text-emerald-600" :
                                tx.type === "debit" ? "bg-red-50 text-red-600" :
                                  tx.type === "purchase" ? "bg-blue-50 text-blue-600" :
                                    tx.type === "refund" ? "bg-amber-50 text-amber-600" :
                                      "bg-slate-50 text-slate-600"
                              }`}
                          >
                            {tx.type === "credit" ? "Cộng" :
                              tx.type === "debit" ? "Trừ" :
                                tx.type === "purchase" ? "Mua hàng" :
                                  tx.type === "refund" ? "Hoàn tiền" : "Đặt"}
                          </Badge>
                        </TableCell>
                        <TableCell className={`px-6 py-4 text-sm font-bold text-right ${tx.type === "credit" || tx.type === "refund" ? "text-emerald-600" : "text-red-600"
                          }`}>
                          {tx.type === "credit" || tx.type === "refund" ? "+" : "-"}{formatPrice(tx.amount)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-400 text-right">{formatPrice(tx.balanceBefore)}</TableCell>
                        <TableCell className="px-6 py-4 text-sm font-bold text-slate-700 text-right">{formatPrice(tx.balanceAfter)}</TableCell>
                        <TableCell className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">{tx.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
