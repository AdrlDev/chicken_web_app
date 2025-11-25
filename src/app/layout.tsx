import type { Metadata } from "next";
import "./globals.css";
import Background from "@/components/Background";
import { ThemeProvider } from "@/components/themes/ThemeContext";
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans', // optional CSS variable
})

export const metadata: Metadata = {
  title: "Chicken Detection",
  description: "Can detect chicken if healthy or not healthy chicken",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={`${poppins.variable}`}>
        <ThemeProvider>
          <Background>
            <main className="relative z-10">{children}</main>
          </Background>
        </ThemeProvider>
      </body>
    </html>
  );
}
