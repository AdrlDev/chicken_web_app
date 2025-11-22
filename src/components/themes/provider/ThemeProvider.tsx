import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";
import Background from "@/components/Background";
import { ThemeProvider } from "../ThemeContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <Background>
            <header className="absolute inset-x-0 top-0 z-50">
              <Navbar />
            </header>
            <main className="relative z-10">{children}</main>
          </Background>
        </ThemeProvider>
      </body>
    </html>
  );
}
