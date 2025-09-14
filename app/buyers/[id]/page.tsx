"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";


import Navbar from "../../globalnavbar";

type City = "Chandigarh" | "Mohali" | "Zirakpur" | "Panchkula" | "Other";
type PropertyType = "Apartment" | "Villa" | "Plot" | "Office" | "Retail";
type Status =
  | "New"
  | "Qualified"
  | "Contacted"
  | "Visited"
  | "Negotiation"
  | "Converted"
  | "Dropped";
type Timeline =
  | "ZeroToThreeMonths"
  | "ThreeToSixMonths"
  | "GreaterThanSixMonths"
  | "Exploring";

interface Buyer {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  city: City;
  propertyType: PropertyType;
  bhk?: string | null;
  purpose: "Buy" | "Rent";
  budgetMin?: number | null;
  budgetMax?: number | null;
  timeline: Timeline;
  source: string;
  status: Status;
  notes?: string | null;
  tags?: string[];
  ownerId: string;
  updatedAt: string;
}

interface BuyerHistory {
  id: string;
  buyerId: string;
  changedBy: string;
  changedAt: string;
  diff: Record<string, { old: any; new: any }>;
}

export default function BuyerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [formData, setFormData] = useState<Buyer | null>(null);
  const [history, setHistory] = useState<BuyerHistory[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch buyer + history
  useEffect(() => {
    async function fetchBuyer() {
      setLoading(true);
      try {
        const res = await fetch(`/api/buyers/${id}`);
        if (!res.ok) throw new Error("Buyer not found");
        const data = await res.json();
        setBuyer(data.buyer);
        setFormData(data.buyer);
        setHistory(data.history || []);
      } catch (err) {
        console.error(err);
        setMessage("Buyer not found or error fetching data");
      } finally {
        setLoading(false);
      }
    }
    fetchBuyer();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setMessage(null);
    try {
      const res = await fetch(`/api/buyers/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.status === 409) {
        setMessage("Record changed by someone else. Please refresh and try again.");
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setMessage(errorData?.message || "Something went wrong. Try again.");
        return;
      }

      const updated = await res.json();
      setBuyer(updated.buyer);
      setFormData(updated.buyer);
      setHistory(updated.history);
      setMessage("Buyer updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Network error. Please try again.");
    }
  };

  if (loading) return <div className="bp-page">Loading...</div>;
  if (!buyer || !formData) return <div className="bp-page error">Buyer not found</div>;

  return (
    <>
    <Navbar/>
    <div className="bp-page">
      <h1>View / Edit Buyer</h1>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="form-container">
        <input type="hidden" value={formData.updatedAt} />

        <div>
          <label>Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label>City</label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value as City })}
            required
          >
            <option value="">Select city</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Mohali">Mohali</option>
            <option value="Zirakpur">Zirakpur</option>
            <option value="Panchkula">Panchkula</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Property Type</label>
          <select
            value={formData.propertyType}
            onChange={(e) =>
              setFormData({ ...formData, propertyType: e.target.value as PropertyType })
            }
            required
          >
            <option value="">Select property type</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot</option>
            <option value="Office">Office</option>
            <option value="Retail">Retail</option>
          </select>
        </div>

        <div>
          <label>Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
            required
          >
            <option value="">Select status</option>
            {["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"].map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label>Timeline</label>
          <select
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value as Timeline })}
            required
          >
            <option value="">Select timeline</option>
            <option value="ZeroToThreeMonths">0-3 Months</option>
            <option value="ThreeToSixMonths">3-6 Months</option>
            <option value="GreaterThanSixMonths">6+ Months</option>
            <option value="Exploring">Exploring</option>
          </select>
        </div>

        <div className="budget-row">
          <div>
            <label>Budget Min</label>
            <input
              type="number"
              value={formData.budgetMin ?? ""}
              onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
            />
          </div>
          <div>
            <label>Budget Max</label>
            <input
              type="number"
              value={formData.budgetMax ?? ""}
              onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label>Notes</label>
          <textarea
            value={formData.notes ?? ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div>
          <label>Tags</label>
          <input
            type="text"
            value={formData.tags?.join(", ") ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value.split(",").map((t) => t.trim()) })
            }
          />
        </div>

        <button type="submit">Save</button>
      </form>

      <h2>Last 5 Changes</h2>
      <div className="history-container">
        {history.length === 0 ? (
          <p>No history available</p>
        ) : (
          <ul>
            {history.map((h) => (
              <li key={h.id}>
                <div className="history-header">
                  {h.changedBy} — {new Date(h.changedAt).toLocaleString()}
                </div>
                <pre>{JSON.stringify(h.diff, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        .bp-page {
          padding: 2rem;
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: sans-serif;
          margin-top:6rem;
        }

        h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          color: #111827;
        }

        .message {
          color: #b91c1c;
          margin-bottom: 1rem;
        }

        .form-container {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          font-weight: 500;
          color: #374151;
        }

        input,
        select,
        textarea {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #9ca3af;
          border-radius: 0.375rem;
          outline: none;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
        }

        .budget-row {
          display: flex;
          gap: 1rem;
        }

        button {
          width: fit-content;
          padding: 0.5rem 1rem;
          background-color: #2563eb;
          color: #fff;
          font-weight: 500;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        button:hover {
          background-color: #1d4ed8;
        }

        h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #111827;
        }

        .history-container {
          background-color: #ffffff;
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .history-header {
          font-weight: 500;
          color: #374151;
        }

        pre {
          background-color: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-size: 0.875rem;
        }

        .error {
          color: #b91c1c;
        }
      `}</style>
    </div>
    </>
  );
}
