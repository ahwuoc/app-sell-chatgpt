import {
  assignOrderAccountAction,
  cancelOrderAction,
  completeOrderAction,
} from "../actions";
import { SubmitButton } from "../submit-button";
import { requireAdmin } from "@/lib/auth";
import { listAvailableAccountsForSale } from "@/lib/accounts";
import { listOrders } from "@/lib/orders";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order";
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
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Calendar,
  CreditCard,
  Settings2,
  Database,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const orderStatusLabel: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  assigned: "Đã gán account",
  completed: "Đã hoàn tất",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

export default async function OrdersPage() {
  await requireAdmin();

  const [orders, availableAccounts] = await Promise.all([
    listOrders(),
    listAvailableAccountsForSale(),
  ]);

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">

        {/* Header Section */}
        <header className="flex flex-col gap-6 rounded-[24px] border border-white bg-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <ShoppingBag className="h-4 w-4" />
              Order Management
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Quản trị đơn mua
            </h1>
            <p className="max-w-2xl text-slate-500">
              Theo dõi luồng giao dịch và xử lý bàn giao tài khoản cho khách hàng.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại Dashboard
            </Link>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-blue-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Tổng đơn hàng
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{orders.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-amber-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Đang chờ
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-600">
                {orders.filter(o => o.status === 'pending' || o.status === 'assigned').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-emerald-500 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Đã hoàn tất
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-600">
                {orders.filter(o => o.status === 'completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <div className="h-1 bg-slate-400 w-full" />
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-slate-500 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Tài khoản khả dụng
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{availableAccounts.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Orders Table */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-50 px-8 py-6">
            <CardTitle className="text-xl font-bold text-slate-900">Danh sách đơn hàng</CardTitle>
            <CardDescription>Theo dõi chi tiết các giao dịch mua tài khoản</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <ShoppingBag className="h-12 w-12 opacity-10 mb-4" />
                <p className="text-sm font-medium">Chưa có đơn hàng nào trong hệ thống.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-50">
                      <TableHead className="px-8 py-4 text-slate-600 font-bold">Mã đơn & Ngày tạo</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold">Khách hàng</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold">Giá trị</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold">Trạng thái</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold">Dữ liệu bàn giao</TableHead>
                      <TableHead className="px-6 py-4 text-slate-600 font-bold">Xử lý</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                        <TableCell className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[11px] font-bold text-slate-400">#{order.id.slice(-8).toUpperCase()}</span>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Calendar className="h-3 w-3" />
                              {order.createdAt}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{order.buyerUsername || 'Guest'}</span>
                              <span className="text-[10px] text-slate-400">{order.buyerContact}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5 font-black text-slate-900">
                          {order.totalPriceLabel}
                          {order.quantity > 1 && (
                            <div className="text-[11px] font-medium text-slate-400">
                              {order.unitPriceLabel} x {order.quantity}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <Badge
                            variant="secondary"
                            className={`
                              font-bold text-[10px] uppercase px-2 py-0.5 rounded-md
                              ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                              ${order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                              ${order.status === 'assigned' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                              ${order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' : ''}
                              ${order.status === 'refunded' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                            `}
                          >
                            {orderStatusLabel[order.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <div className="flex flex-col gap-2">
                            {order.accounts && order.accounts.length > 0 ? (
                              order.accounts.map((acc, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="p-1 bg-slate-50 rounded-lg border border-slate-100">
                                    <Mail className="h-3 w-3 text-slate-400" />
                                  </div>
                                  <span className="text-[11px] font-medium text-slate-600">{acc.email}</span>
                                </div>
                              ))
                            ) : order.accountEmail ? (
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <span className="text-xs font-medium text-slate-600">{order.accountEmail}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300 italic">Chưa có dữ liệu</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {order.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <form action={assignOrderAccountAction} className="flex items-center gap-2">
                                  <input type="hidden" name="orderId" value={order.id} />
                                  <div className="relative">
                                    <Database className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <select
                                      name="accountId"
                                      className="h-9 w-[180px] rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                                      required
                                      defaultValue=""
                                    >
                                      <option value="" disabled>Chọn Account...</option>
                                      {availableAccounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                          {account.email}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <SubmitButton className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95">
                                    Gán
                                  </SubmitButton>
                                </form>
                                <form action={cancelOrderAction}>
                                  <input type="hidden" name="orderId" value={order.id} />
                                  <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all border border-red-100">
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </form>
                              </div>
                            )}

                            {order.status === "assigned" && (
                              <div className="flex items-center gap-2">
                                <form action={completeOrderAction}>
                                  <input type="hidden" name="orderId" value={order.id} />
                                  <SubmitButton className="h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95">
                                    Hoàn tất
                                  </SubmitButton>
                                </form>
                                <form action={cancelOrderAction}>
                                  <input type="hidden" name="orderId" value={order.id} />
                                  <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all border border-red-100">
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </form>
                              </div>
                            )}

                            {["completed", "cancelled", "refunded"].includes(order.status) && (
                              <div className="flex items-center gap-2 text-slate-300">
                                <Settings2 className="h-4 w-4 opacity-20" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Đã chốt</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
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
