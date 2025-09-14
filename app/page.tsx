"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-gray-900 shadow-md">
        <div className="text-2xl font-bold">LeadManager</div>
        <div className="space-x-6">
          <Link href="/" className="hover:text-blue-400 transition">
            Home
          </Link>
          <Link href="/buyers/new" className="hover:text-blue-400 transition">
            Create Lead
          </Link>
          <Link href="/buyers/index" className="hover:text-blue-400 transition">
            View Leads
          </Link>
          <Link href="/login" className="hover:text-blue-400 transition">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero / Main Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 md:px-0">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Welcome to LeadManager</h1>
        <p className="text-lg md:text-xl mb-8 max-w-xl">
          Efficiently manage your buyer leads, track statuses, and quickly create or edit leads.
        </p>

        {/* Quick Links */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/buyers/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition"
          >
            Create New Lead
          </Link>
          <Link
            href="/buyers/index"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold transition"
          >
            View Leads
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 mt-auto text-center text-gray-400">
        &copy; {new Date().getFullYear()} LeadManager. All rights reserved.
      </footer>
    </div>
  );
}
