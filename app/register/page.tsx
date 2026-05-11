import Link from "next/link";
import { registerAction } from "../actions";
import { redirectIfAuthenticated, requireNoAdminExists } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "../submit-button";
import { UserPlus, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await redirectIfAuthenticated();

  const params = (await searchParams) ?? {};
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-md">
        <Card className="border bg-background shadow-xl">
          <CardHeader className="space-y-4">
            <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
              <ShieldCheck className="h-4 w-4" />
              Đăng ký thành viên
            </Badge>
            <div className="space-y-1">
              <CardTitle className="text-2xl">Dang ky</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tao tai khoan de dang nhap vao dashboard luu tru.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form action={registerAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="Nhap username"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Nhap password"
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Nhap lai password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Nhap lai password"
                  minLength={6}
                  required
                />
              </div>

              <SubmitButton className="h-11 w-full gap-2">
                <UserPlus className="h-4 w-4" />
                Tao tai khoan
              </SubmitButton>
            </form>

            <p className="text-sm text-muted-foreground">
              Da co tai khoan?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Dang nhap
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
