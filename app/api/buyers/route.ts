import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getCurrentUser } from "../login/auth"; 

const prisma = new PrismaClient();


const buyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["Studio", "One", "Two", "Three", "Four"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.number().int().optional(),
  budgetMax: z.number().int().optional(),
  timeline: z.enum([
    "ZeroToThreeMonths",
    "ThreeToSixMonths",
    "GreaterThanSixMonths",
    "Exploring",
  ]),
  source: z.enum(["Website", "Referral", "WalkIn", "Call", "Other"]),
  status: z
    .enum([
      "New",
      "Qualified",
      "Contacted",
      "Visited",
      "Negotiation",
      "Converted",
      "Dropped",
    ])
    .optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
});


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;

    // Filters
    const city = searchParams.get("city")?.trim();
    const propertyType = searchParams.get("propertyType")?.trim();
    const statusParam = searchParams.get("status")?.trim();
    const timelineParam = searchParams.get("timeline")?.trim();

    // Map timeline/status strings to Prisma enums
    const timelineMap: Record<string, string> = {
      ZeroToThreeMonths: "ZeroToThreeMonths",
      ThreeToSixMonths: "ThreeToSixMonths",
      GreaterThanSixMonths: "GreaterThanSixMonths",
      Exploring: "Exploring",
    };

    const statusMap: Record<string, string> = {
      New: "New",
      Qualified: "Qualified",
      Contacted: "Contacted",
      Visited: "Visited",
      Negotiation: "Negotiation",
      Converted: "Converted",
      Dropped: "Dropped",
    };

    const where: any = {};
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (statusParam && statusMap[statusParam]) where.status = statusMap[statusParam];
    if (timelineParam && timelineMap[timelineParam]) where.timeline = timelineMap[timelineParam];

    // Search
    const search = searchParams.get("search")?.trim();
    if (search) {
      const terms = search.toLowerCase().split(" ").filter(Boolean);
      where.AND = terms.map((term) => ({
        OR: [
          { fullName: { contains: term, mode: "insensitive" } },
          { phone: { contains: term } },
          { email: { contains: term, mode: "insensitive" } },
        ],
      }));
    }

    // Fetch buyers with pagination
    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.buyer.count({ where });

    return NextResponse.json({ buyers, total, page, pageSize });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}




// POST – create buyer + initial history
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const currentUser = await getCurrentUser(); 
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const parsed = buyerSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    

    const buyer = await prisma.buyer.create({
      data: {
        ...parsed.data,
        ownerId: currentUser.id,
      },
    });

    // create initial history record (who created & full snapshot)
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: currentUser.id,
        diff: { created: buyer }, // or { created: parsed.data }
      },
    });

    return NextResponse.json(buyer);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

