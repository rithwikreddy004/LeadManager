"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

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

  // Fetch buyer + history on mount
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

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (!buyer || !formData) return <div className="p-6 text-red-600">Buyer not found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">View / Edit Buyer</h1>
      {message && <p className="mb-4 text-red-600">{message}</p>}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <input type="hidden" value={formData.updatedAt} />

        
        <div>
          <label className="block text-gray-700 font-medium">Full Name</label>
          <input
            type="text"
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>

        
        <div>
          <label className="block text-gray-700 font-medium">Phone</label>
          <input
            type="text"
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        
        <div>
          <label className="block text-gray-700 font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        
        <div>
          <label className="block text-gray-700 font-medium">City</label>
          <select
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
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
          <label className="block text-gray-700 font-medium">Property Type</label>
          <select
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            value={formData.propertyType}
            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
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
          <label className="block text-gray-700 font-medium">Status</label>
          <select
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
            required
          >
            <option value="">Select status</option>
            <option value="New">New</option>
            <option value="Qualified">Qualified</option>
            <option value="Contacted">Contacted</option>
            <option value="Visited">Visited</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Converted">Converted</option>
            <option value="Dropped">Dropped</option>
          </select>
        </div>

        
        <div>
          <label className="block text-gray-700 font-medium">Timeline</label>
          <select
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
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

        
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium">Budget Min</label>
            <input
              type="number"
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
              value={formData.budgetMin ?? ""}
              onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-medium">Budget Max</label>
            <input
              type="number"
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
              value={formData.budgetMax ?? ""}
              onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
            />
          </div>
        </div>

        
        <div>
          <label className="block text-gray-700 font-medium">Notes</label>
          <textarea
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            value={formData.notes ?? ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        
        <div>
          <label className="block text-gray-700 font-medium">Tags</label>
          <input
            type="text"
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            value={formData.tags?.join(", ") ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value.split(",").map((t) => t.trim()) })
            }
          />
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Save
        </button>
      </form>

      
      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Last 5 Changes</h2>
      <div className="bg-white shadow rounded-lg p-4">
        {history.length === 0 ? (
          <p className="text-gray-500">No history available</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="border-b border-gray-200 pb-2">
                <div className="text-gray-700 font-medium">
                  {h.changedBy} — {new Date(h.changedAt).toLocaleString()}
                </div>
                <pre className="text-sm text-gray-600">{JSON.stringify(h.diff, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
