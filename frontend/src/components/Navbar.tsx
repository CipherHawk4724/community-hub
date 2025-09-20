// components/Navbar.tsx
"use client";

import Link from "next/link";
import React, { useState } from "react";
// Assuming you have 'lucide-react' or similar for icons, using a simple SVG fallback
// import { Menu, X } from 'lucide-react'; 

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Base classes for navigation links
  const linkClasses = "text-gray-700 font-semibold hover:text-blue-600 transition p-2";

  return (
    <nav className="bg-white shadow p-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          Community Hub
        </Link>

        {/* Desktop Navigation Links (Visible on Medium screens and up) */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/" className={linkClasses}>Home</Link>
          <Link href="/create" className={linkClasses}>Create</Link>
          <Link href="/vote" className={linkClasses}>Vote</Link>
          <Link href="/donate" className={linkClasses}>Donate</Link>
          <Link 
            href="/proposer/dashboard" 
            className="text-indigo-600 font-bold hover:text-indigo-800 transition"
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile Menu Button (Visible only on small screens) */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            // Close Icon (X)
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            // Hamburger Icon
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown (Toggles visibility based on 'isOpen') */}
      {isOpen && (
        <div className="md:hidden mt-2 border-t border-gray-100 flex flex-col space-y-2">
          <Link href="/" className={linkClasses} onClick={toggleMenu}>Home</Link>
          <Link href="/create" className={linkClasses} onClick={toggleMenu}>Create</Link>
          <Link href="/vote" className={linkClasses} onClick={toggleMenu}>Vote</Link>
          <Link href="/donate" className={linkClasses} onClick={toggleMenu}>Donate</Link>
          <Link 
            href="/proposer/dashboard" 
            className="text-indigo-600 font-bold hover:text-indigo-800 transition p-2"
            onClick={toggleMenu}
          >
            Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;