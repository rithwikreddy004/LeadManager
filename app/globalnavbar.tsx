



"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "./context/authcontext";

export default function Navbar() {
  const { loggedIn, logout } = useAuth();

  

  return (
    <>
      <nav className="navbar">
        <div className="logo">LeadManager</div>
        <div className="links">
          <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>
          <Link href="/buyers/new" style={{ color: "#fff", textDecoration: "none" }}>Create Lead</Link>
          <Link href="/buyers/index" style={{ color: "#fff", textDecoration: "none" }}>View Leads</Link>


          {loggedIn ? (
          <button onClick={logout} className="logout-btn">Logout</button>
        ) : (
          <Link href="/login" style={{ color: "#fff", textDecoration: "none" }}>Login</Link>
        )}
        </div>
      </nav>

      <style jsx>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #111;
          border-bottom: 1px solid #444;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          letter-spacing: -0.5px;
          color: #fff;
        }

        .links {
          display: flex;
          gap: 2rem;
        }

        .links a,
        .links .logout-btn {
          color: #fff !important;
          text-decoration: none !important;
          font-weight: 500;
          position: relative;
          padding: 0.5rem 0;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.3s;
        }

        .links a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 0;
          background-color: #3b82f6;
          transition: width 0.3s;
        }

        .links a:hover::after {
          width: 100%;
        }

        .links a:hover,
        .links .logout-btn:hover {
          color: #60a5fa !important;
        }
      `}</style>
    </>
  );
}
