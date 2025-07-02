//components\Footer.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/middleware";
import { usePathname } from "next/navigation";

interface FooterProps {
  dictionary: Dictionary["footer"];
  lang?: Locale;
}

export function Footer({ dictionary, lang }: FooterProps) {
  const pathname = usePathname();
  // Extract language from pathname if not provided as prop
  const currentLang = lang || (pathname?.split("/")[1] as Locale) || "en";

  return (
    <footer className="bg-background border-t border-border py-12 w-full">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href={`/${currentLang}`} className="flex items-center">
              <div className="relative h-10 w-40">
                <Image
                  src="/images/tudo-logo.png"
                  alt="TUDO Logo"
                  fill
                  style={{ objectFit: "contain", objectPosition: "left" }}
                />
              </div>
            </Link>
            <p className="text-muted-foreground">
              {dictionary.description}
            </p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">{dictionary.companyHeading}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${currentLang}/about`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.aboutUs}
                </Link>
              </li>
              <li>
                <Link
                  href="#careers"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.careers}
                </Link>
              </li>
              <li>
                <Link
                  href="#partners"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.partners}
                </Link>
              </li>
              <li>
                <Link
                  href="#press"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.press}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">
              {dictionary.resourcesHeading}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#blog"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.blog}
                </Link>
              </li>
              <li>
                <Link
                  href="#help"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.helpCenter}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLang}/pricing#faq`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.faq}
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  {dictionary.contactUs}
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">{dictionary.legalHeading}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.terms}
                </Link>
              </li>
              <li>
                <Link
                  href="#privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href="#cookies"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.cookies}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>{dictionary.copyright.replace('{year}', new Date().getFullYear().toString())}</p>
        </div>
      </div>
    </footer>
  );
}
