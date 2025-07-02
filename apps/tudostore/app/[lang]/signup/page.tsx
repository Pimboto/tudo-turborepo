//app\[lang]\register\page.tsx
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
import { Checkbox } from "@/components/ui/checkbox";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/middleware";

export default async function RegisterPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar
        lang={lang}
        dictionary={dict.navbar}
        variant="light"
        transparentOnTop={false}
      />

      <div className="flex-1 flex items-center justify-center py-12 px-4 pt-24">
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
              {dict.register.title}
            </CardTitle>
            <CardDescription className="text-center">
              {dict.register.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="first-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {dict.register.firstName}
                </label>
                <Input id="first-name" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="last-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {dict.register.lastName}
                </label>
                <Input id="last-name" placeholder="Doe" required />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {dict.register.email}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {dict.register.password}
              </label>
              <Input id="password" type="password" required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {dict.register.terms}{" "}
                <Link
                  href={`/${lang}/terms`}
                  className="text-primary hover:underline"
                >
                  {dict.register.termsLink}
                </Link>{" "}
                {dict.register.termsAnd}{" "}
                <Link
                  href={`/${lang}/privacy`}
                  className="text-primary hover:underline"
                >
                  {dict.register.privacyLink}
                </Link>
              </label>
            </div>
            <Button type="submit" className="w-full">
              {dict.register.signUpButton}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              {dict.register.haveAccount}{" "}
              <Link
                href={`/${lang}/login`}
                className="text-primary hover:underline"
              >
                {dict.register.logIn}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
