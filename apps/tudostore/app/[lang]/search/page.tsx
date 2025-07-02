// app/[lang]/search/page.tsx
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/middleware";
import type { Metadata } from "next";
import SearchClient from "./client";

export async function generateMetadata({ params }: { params: { lang: Locale } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  
  return {
    title: dict.searchClasses?.meta?.title || "Search Classes",
    description: dict.searchClasses?.meta?.description || "Search for classes in your area",
  };
}

export default async function SearchPage({ params }: { params: { lang: Locale } }) {
  // Cargar el diccionario en el lado del servidor
  const dictionary = await getDictionary(params.lang);
  
  // Renderizar el componente cliente con las props necesarias
  return <SearchClient params={params} dictionary={dictionary} />;
}
