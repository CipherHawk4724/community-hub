"use client";

import Link from "next/link";
import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-blue-600">Community Hub</div>
      <div className="flex gap-4">
        <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
          Home
        </Link>
        <Link href="/create" className="text-gray-700 hover:text-blue-600 transition">
          Create
        </Link>
        <Link href="/vote" className="text-gray-700 hover:text-blue-600 transition">
          Vote
        </Link>
        <Link href="/donate" className="text-gray-700 hover:text-blue-600 transition">
          Donate
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
