import { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
const prisma = new PrismaClient();

type City = "Chandigarh" | "Mohali" | "Zirakpur" | "Panchkula" | "Other";
type PropertyType = "Apartment" | "Villa" | "Plot" | "Office" | "Retail";
type Status = "New" | "Qualified" | "Contacted" | "Visited" | "Negotiation" | "Converted" | "Dropped";
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

interface BuyersPageProps {
  buyers: Buyer[];
  total: number;
  page: number;
  pageSize: number;
  filters: {
    city?: string;
    propertyType?: string;
    status?: string;
    timeline?: string;
    search?: string;
  };
}

export const getServerSideProps: GetServerSideProps<BuyersPageProps> = async (ctx) => {
  const q = ctx.query;

  // Convert query params safely
  const page = Array.isArray(q.page) ? parseInt(q.page[0]) : parseInt(q.page || "1");
  const city = Array.isArray(q.city) ? q.city[0] : q.city;
  const propertyType = Array.isArray(q.propertyType) ? q.propertyType[0] : q.propertyType;
  const status = Array.isArray(q.status) ? q.status[0] : q.status;
  const timeline = Array.isArray(q.timeline) ? q.timeline[0] : q.timeline;
  const search = Array.isArray(q.search) ? q.search[0] : q.search;

  const pageSize = 10;

  // Build where clause for Prisma
  const where: any = {};
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;
  if (search) {
    const terms = search.toLowerCase().split(" ").filter(Boolean);
    where.AND = terms.map((term: string) => ({
      OR: [
        { fullName: { contains: term, mode: "insensitive" } },
        { phone: { contains: term } },
        { email: { contains: term, mode: "insensitive" } },
      ],
    }));
  }

  const buyers = await prisma.buyer.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await prisma.buyer.count({ where });

  return {
    props: {
      buyers: buyers.map((b) => ({
        ...b,
        updatedAt: b.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      filters: {
        city: city ?? "",
        propertyType: propertyType ?? "",
        status: status ?? "",
        timeline: timeline ?? "",
        search: search ?? "",
      },
    },}
};


export default function BuyersPage({ buyers, total, page, pageSize, filters }: BuyersPageProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce effect: update debouncedSearch 500ms after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
  // Copy router.query and ensure it's string type
  const query: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(router.query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value ?? ""])
    ),
    page: "1", // reset page to 1 on search
  };

  if (debouncedSearch) {
    query.search = debouncedSearch;
  } else {
    delete query.search;
  }

  router.push({ pathname: router.pathname, query }, undefined, { shallow: false });
}, [debouncedSearch]);


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Buyer Leads</h1>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Name, Phone, or Email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
        <table className="min-w-full border border-gray-200 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b border-gray-200">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b border-gray-200">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b border-gray-200">City</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b border-gray-200">Property Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b border-gray-200">Budget</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b border-gray-200">Timeline</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b border-gray-200">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b border-gray-200">Updated</th>
              <th className="px-4 py-3 border-b border-gray-200"></th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {buyers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500 border-b border-gray-200">
                  No buyers found
                </td>
              </tr>
            ) : (
              buyers.map((b, idx) => (
                <tr key={b.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{b.fullName}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{b.phone}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{b.city}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{b.propertyType}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{b.budgetMin ?? 0} – {b.budgetMax ?? 0}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{b.timeline}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{b.status}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{new Date(b.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 border-b border-gray-200">
                    <Link href={`/buyers/${b.id}`} className="text-blue-600 font-medium hover:text-blue-800">
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
        {page > 1 && (
          <Link
            href={`/buyers?page=${page - 1}`}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            Previous
          </Link>
        )}
        <span className="text-gray-700 font-medium">
          Page {page} of {Math.ceil(total / pageSize)}
        </span>
        {page * pageSize < total && (
          <Link
            href={`/buyers?page=${page + 1}`}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
