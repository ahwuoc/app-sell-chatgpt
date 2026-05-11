import Link from "next/link";
import { loginAction } from "../actions";
import { redirectIfAuthenticated } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "../submit-button";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await redirectIfAuthenticated();

  const params = (await searchParams) ?? {};
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : null;
  const redirectTo =
    typeof params.redirectTo === "string" && params.redirectTo.startsWith("/")
      ? params.redirectTo
      : "/";

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-md">
        <Card className="border bg-background shadow-xl">
          <CardHeader className="space-y-4">
            <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
              <ShieldCheck className="h-4 w-4" />
              Bao ve dashboard
            </Badge>
            <div className="space-y-1">
              <CardTitle className="text-2xl">Dang nhap</CardTitle>
              <p className="text-sm text-muted-foreground">
                Dang nhap de truy cap trang luu tru tai khoan.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form action={loginAction} className="space-y-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />
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
                  autoComplete="current-password"
                  placeholder="Nhap password"
                  required
                />
              </div>

              <SubmitButton className="h-11 w-full gap-2">
                <Lock className="h-4 w-4" />
                Dang nhap
              </SubmitButton>
            </form>

            <p className="text-sm text-muted-foreground">
              Chua co tai khoan?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Dang ky
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
