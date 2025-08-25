"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <h1 className="text-xl font-bold">Community Hub</h1>
      <div className="flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/create">Create</Link>
        <Link href="/vote">Vote</Link>
        <Link href="/donate">Donate</Link>
      </div>
    </nav>
  );
}
