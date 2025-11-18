import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { RoleSwitcher } from "@/components/role-switcher"
import { CacheControl } from "@/components/cache-control"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Scottish Pantry Network",
  description: "Meal collection management system",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased bg-background text-foreground selection:bg-primary/10 selection:text-primary`}>
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Added a subtle logo placeholder or icon if needed, keeping text for now but styled better */}
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">S</span>
                </div>
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">Scottish Pantry Network</h1>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <CacheControl />
                <RoleSwitcher />
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-73px)] animate-in fade-in duration-500">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
