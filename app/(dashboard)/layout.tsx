import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import LeftSideBar from "@/components/layout/LeftSideBar";
import TopBar from "@/components/layout/TopBar";
import { ToasterProvider } from "@/lib/ToasterProvider";


const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MMstyles-Admin Dashboard",
  description: "Admin dashboard to manage MMstyles data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={manrope.className}>
       <ToasterProvider/>
          <div className="min-h-screen bg-slate-100/80 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.16),transparent_28%)] flex max-lg:flex-col">
            <LeftSideBar/>
            <TopBar/>
            <div className="flex-1">{children}</div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
