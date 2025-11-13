import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
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
      <body className={`font-sans antialiased`}>
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-lg md:text-xl font-bold text-balance leading-tight">Scottish Pantry Network</h1>
              <div className="flex items-center gap-2 md:gap-3">
                <CacheControl />
                <RoleSwitcher />
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-73px)]">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
