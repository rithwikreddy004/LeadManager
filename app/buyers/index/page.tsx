"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const [failedRows, setFailedRows] = useState<{ row: number; message: string }[]>([]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch buyers
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
          router.push("/login");
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
    setPage(1);
  };

  return (
    <>
    <Navbar/>
    <div className="buyers-page">
      <h1>Buyer Leads</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Name, Phone, or Email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filters-container">
        {["city", "propertyType", "status", "timeline"].map((key) => (
          <select
            key={key}
            value={(filters as any)[key]}
            onChange={(e) => handleFilterChange(key as any, e.target.value)}
          >
            <option value="">{key}</option>
          </select>
        ))}
      </div>

      <div className="csv-import">
        <label>Import Buyers CSV (max 200 rows)</label>
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
              setPage(1);
            } else if (res.ok) {
              alert(`${data.inserted} buyers imported successfully!`);
              setPage(1);
            }
          }}
        />
      </div>

      {failedRows.length > 0 && (
        <div className="csv-errors">
          <h2>CSV Errors</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Row #</th>
                  <th>Error Message</th>
                </tr>
              </thead>
              <tbody>
                {failedRows.map((f) => (
                  <tr key={f.row}>
                    <td>{f.row}</td>
                    <td>{f.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="csv-export">
        <button
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

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Property Type</th>
              <th>Budget</th>
              <th>Timeline</th>
              <th>Status</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {buyers.length === 0 ? (
              <tr>
                <td colSpan={9}>No buyers found</td>
              </tr>
            ) : (
              buyers.map((b) => (
                <tr key={b.id}>
                  <td>{b.fullName}</td>
                  <td>{b.phone}</td>
                  <td>{b.city}</td>
                  <td>{b.propertyType}</td>
                  <td>{b.budgetMin ?? 0} – {b.budgetMax ?? 0}</td>
                  <td>{b.timeline}</td>
                  <td>{b.status}</td>
                  <td>{new Date(b.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/buyers/${b.id}`}>View / Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {Math.ceil(total / pageSize)}</span>
        <button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      <style jsx>{`
        .buyers-page {
          padding: 2rem;
          margin-top:8rem;
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: sans-serif;
        }

        h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: #111827;
          text-align: center;
        }

        .search-container input,
        .filters-container select,
        .csv-import input {
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #9ca3af;
          outline: none;
        }

        .search-container input:focus,
        .filters-container select:focus,
        .csv-import input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }

        .filters-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .csv-import {
          margin-bottom: 1rem;
        }

        .csv-errors h2 {
          color: #b91c1c;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .table-container {
          overflow-x-auto;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background-color: #ffffff;
        }

        th, td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
        }

        tr:hover {
          background-color: #f3f4f6;
        }

        .csv-export button,
        .pagination button {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }

        .csv-export button {
          background-color: #16a34a;
          color: #fff;
        }

        .csv-export button:hover {
          background-color: #15803d;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .pagination button {
          background-color: #bfdbfe;
          color: #1e40af;
        }

        .pagination button:hover {
          background-color: #93c5fd;
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
    </>
  );
}
