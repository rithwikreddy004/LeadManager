"use client";

import { useState } from "react";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      alert("Logged in successfully!");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block font-medium mb-1";

  return (
    <div className="max-w-sm mx-auto p-6 bg-white shadow-lg rounded-lg mt-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Demo Login</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
