
"use client";

import Link from "next/link";
import "./styles/landingpage.css";

import "./globalnavbar"
import Navbar from "./globalnavbar";

export default function HomePage() {
  return (
    <div className="container">
      <Navbar/>

      <main>
        <h1>Welcome to LeadManager</h1>
        <p>
          Efficiently manage your buyer leads, track statuses, and quickly create or edit leads.
        </p>
        <div className="main-buttons">
          <Link href="/buyers/new" className="create">Create New Lead</Link>
          <Link href="/buyers/index" className="view">View Leads</Link>
        </div>
      </main>

      <footer>
        &copy; {new Date().getFullYear()} LeadManager. All rights reserved.
      </footer>
    </div>
  );
}
