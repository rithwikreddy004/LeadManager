"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
type Timeline = "ZeroToThreeMonths" | "ThreeToSixMonths" | "GreaterThanSixMonths" | "Exploring";

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

export default function BuyersPage() {
  const router = useRouter();

  // Filters & search
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    propertyType: "",
    status: "",
    timeline: "",
  });

  // CSV failed rows
  const [failedRows, setFailedRows] = useState<{ row: number; message: string }[]>([]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch buyers whenever filters/search/page changes
  // Fetch buyers whenever filters/search/page changes
useEffect(() => {
  const fetchBuyers = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search: debouncedSearch || "",
        ...filters,
      });

      const res = await fetch(`/api/buyers?${params.toString()}`);

      if (res.status === 401) {
        alert("Please login first!");
        router.push("/login"); // redirect to login page
        return;
      }

      if (!res.ok) {
        console.error("Failed to fetch buyers:", await res.text());
        return;
      }

      const data = await res.json();
      setBuyers(data.buyers || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching buyers:", error);
    }
  };

  fetchBuyers();
}, [debouncedSearch, filters, page, router]);


  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // reset page when filter changes
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Buyer Leads</h1>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Name, Phone, or Email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["city", "propertyType", "status", "timeline"].map((key) => (
          <select
            key={key}
            value={(filters as any)[key]}
            onChange={(e) => handleFilterChange(key as any, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">{key}</option>
            {/* You can populate options dynamically if needed */}
          </select>
        ))}
      </div>

      {/* CSV Import */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Import Buyers CSV (max 200 rows)</label>
        <input
          type="file"
          accept=".csv"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const text = await file.text();
            const res = await fetch("/api/buyers/import", {
              method: "POST",
              headers: { "Content-Type": "text/csv" },
              body: text,
            });

            const data = await res.json();
            if (res.status === 400) {
              console.log("Errors:", data.errors);
              alert("CSV Import failed. See console for errors.");
            } else if (res.status === 207) {
              setFailedRows(data.errors);
              alert(`✅ ${data.inserted} buyers imported. ⚠️ ${data.errors.length} rows failed.`);
              setPage(1); // refresh
            } else if (res.ok) {
              alert(`${data.inserted} buyers imported successfully!`);
              setPage(1);
            }
          }}
          className="border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {/* CSV Errors */}
      {failedRows.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-red-600 mb-2">CSV Errors</h2>
          <div className="overflow-x-auto shadow rounded bg-white">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-4 py-2 border-b border-gray-200 text-left">Row #</th>
                  <th className="px-4 py-2 border-b border-gray-200 text-left">Error Message</th>
                </tr>
              </thead>
              <tbody>
                {failedRows.map((f) => (
                  <tr key={f.row} className="hover:bg-red-50">
                    <td className="px-4 py-2 border-b border-gray-200">{f.row}</td>
                    <td className="px-4 py-2 border-b border-gray-200">{f.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSV Export */}
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={async () => {
            const params = new URLSearchParams({
              page: page.toString(),
              search: debouncedSearch || "",
              ...filters,
            });
            const res = await fetch(`/api/buyers/export?${params.toString()}`);
            if (!res.ok) return alert("Failed to export CSV");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `buyers_export_${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Buyers Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
        <table className="min-w-full border border-gray-200 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 border-b border-gray-200">Name</th>
              <th className="px-4 py-3 border-b border-gray-200">Phone</th>
              <th className="px-4 py-3 border-b border-gray-200">City</th>
              <th className="px-4 py-3 border-b border-gray-200">Property Type</th>
              <th className="px-4 py-3 border-b border-gray-200">Budget</th>
              <th className="px-4 py-3 border-b border-gray-200">Timeline</th>
              <th className="px-4 py-3 border-b border-gray-200">Status</th>
              <th className="px-4 py-3 border-b border-gray-200">Updated</th>
              <th className="px-4 py-3 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {buyers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500 border-b border-gray-200">
                  No buyers found
                </td>
              </tr>
            ) : (
              buyers.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b border-gray-200">{b.fullName}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{b.phone}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{b.city}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{b.propertyType}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{b.budgetMin ?? 0} – {b.budgetMax ?? 0}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{b.timeline}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{b.status}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{new Date(b.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 border-b border-gray-200">
                    <Link href={`/buyers/${b.id}`} className="text-blue-600 hover:text-blue-800">
                      View / Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700 font-medium">
          Page {page} of {Math.ceil(total / pageSize)}
        </span>
        <button
          disabled={page * pageSize >= total}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
