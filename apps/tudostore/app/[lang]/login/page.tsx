//app\[lang]\login\page.tsx
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/middleware";

export default async function LoginPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  return (
    <>
      <Navbar
        lang={lang}
        dictionary={dict.navbar}
        variant="light"
        transparentOnTop={false}
      />

      <main className="min-h-screen flex flex-col pt-24 pb-12 px-4">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="relative h-12 w-48">
                  <Image
                    src="/images/tudo-logo.png"
                    alt="TUDO Logo"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
              <CardTitle className="text-2xl font-heading text-center">
                {dict.login.title}
              </CardTitle>
              <CardDescription className="text-center">
                {dict.login.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {dict.login.email}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {dict.login.password}
                  </label>
                  <Link
                    href={`/${lang}/forgot-password`}
                    className="text-sm text-primary hover:underline"
                  >
                    {dict.login.forgotPassword}
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                {dict.login.loginButton}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                {dict.login.noAccount}{" "}
                <Link
                  href={`/${lang}/register`}
                  className="text-primary hover:underline"
                >
                  {dict.login.signUp}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
