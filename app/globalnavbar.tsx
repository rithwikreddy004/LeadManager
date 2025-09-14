"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <>
      <nav className="navbar">
        <div className="logo">LeadManager</div>
        <div className="links">
          {/*
          <Link href="/">Home</Link>
          <Link href="/buyers/new">Create Lead</Link>
          <Link href="/buyers/index">View Leads</Link>
          <Link href="/login">Login</Link>*/}


          <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>

          <Link href="/buyers/new" style={{ color: "#fff", textDecoration: "none" }}>Create Lead</Link>

          <Link href="/buyers/index" style={{ color: "#fff", textDecoration: "none" }}>View Leads</Link>

          <Link href="/login" style={{ color: "#fff", textDecoration: "none" }}>Login</Link>
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

        .links a {
          color: #fff !important;       /* Force white */
          text-decoration: none !important; /* Remove default underline */
          font-weight: 500;
          position: relative;
          padding: 0.5rem 0;
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

        .links a:hover {
          color: #60a5fa !important; /* hover color */
        }

        .links a:hover::after {
          width: 100%;
        }
      `}</style>
    </>
  );
}
