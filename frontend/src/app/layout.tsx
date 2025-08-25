import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Community Hub",
  description: "Decentralized community hub for proposals, voting, and donations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
