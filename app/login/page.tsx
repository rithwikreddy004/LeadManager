
"use client";

import { useState } from "react";
import Navbar from "../globalnavbar";
import { useAuth } from "../context/authcontext";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Login failed!");
        return;
      }

      const data = await res.json();
      login(data.token); // Update context immediately
      window.location.href = "/"; // redirect to homepage
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="login-container">
      <h1>Demo Login</h1>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Sign In</button>
      </form>

      <style jsx>{`
        .login-container {
          margin-top:6rem;
          max-width: 400px;
          margin: 5rem auto;
          padding: 2rem;
          background-color: #111827; /* Dark gray/black */
          color: #f9fafb; /* White-ish text */
          border-radius: 0.5rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
        }

        h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          text-align: center;
          color: #f9fafb;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        input {
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #374151;
          background-color: #1f2937;
          color: #f9fafb;
          outline: none;
        }

        input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }

        button {
          padding: 0.75rem;
          background-color: #3b82f6;
          color: #f9fafb;
          font-weight: 600;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        button:hover {
          background-color: #2563eb;
        }
      `}</style>
    </div>
    </>
  );
}
