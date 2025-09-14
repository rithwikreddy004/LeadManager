import { PrismaClient } from "@prisma/client";
import { Parser } from "json2csv";
import { getCurrentUser } from "@/app/api/login/auth";

const prisma = new PrismaClient();

const timelineMap: Record<string, string> = {
  ZeroToThreeMonths: "0-3m",
  ThreeToSixMonths: "3-6m",
  GreaterThanSixMonths: ">6m",
  Exploring: "Exploring",
};

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const url = new URL(req.url);
    const city = url.searchParams.get("city") || undefined;
    const propertyType = url.searchParams.get("propertyType") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const timeline = url.searchParams.get("timeline") || undefined;
    const searchQuery = url.searchParams.get("search") || undefined;

    const where: any = { ownerId: currentUser.id };
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (timeline) where.timeline = timeline;

    if (searchQuery) {
      const terms = searchQuery.toLowerCase().split(" ").filter(Boolean);
      where.AND = terms.map((term: string) => ({
        OR: [
          { fullName: { contains: term, mode: "insensitive" } },
          { phone: { contains: term } },
          { email: { contains: term, mode: "insensitive" } },
        ],
      }));
    }

    const buyers = await prisma.buyer.findMany({ where });

    const rows = buyers.map((b) => ({
      ...b,
      timeline: timelineMap[b.timeline as keyof typeof timelineMap] || b.timeline,
      tags: b.tags?.join(", ") || "",
    }));

    const fields = [
      "fullName", "email", "phone", "city", "propertyType",
      "bhk", "purpose", "budgetMin", "budgetMax", "timeline",
      "source", "notes", "tags", "status"
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename=buyers.csv`,
        "Content-Type": "text/csv",
      },
    });
  } catch (err) {
    console.error("CSV Export error:", err);
    return new Response(JSON.stringify({ error: "Failed to export buyers" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
