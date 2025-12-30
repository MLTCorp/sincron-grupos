import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sincron Grupos - Gestao de Grupos WhatsApp",
    template: "%s | Sincron Grupos"
  },
  description: "MicroSaaS para gestao inteligente de grupos WhatsApp com automacoes, comandos e IA",
  keywords: ["whatsapp", "grupos", "automacao", "chatbot", "gestao", "saas"],
  authors: [{ name: "Sincron Grupos" }],
  creator: "Sincron Grupos",
  metadataBase: new URL("https://sincrongrupos.com"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://sincrongrupos.com",
    siteName: "Sincron Grupos",
    title: "Sincron Grupos - Gestao Inteligente de Grupos WhatsApp",
    description: "Automatize, organize e gerencie todos os seus grupos WhatsApp em um so lugar. Comandos, gatilhos, IA e muito mais.",
    images: [
      {
        url: "/opengraph-image.svg",
        width: 1200,
        height: 630,
        alt: "Sincron Grupos - Gestao de Grupos WhatsApp"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Sincron Grupos - Gestao de Grupos WhatsApp",
    description: "Automatize, organize e gerencie todos os seus grupos WhatsApp em um so lugar.",
    images: ["/opengraph-image.svg"]
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
