// app/api/buyers/[id]/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/login/auth";

const prisma = new PrismaClient();


export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // last segment
  if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  // Fetch buyer
  const buyer = await prisma.buyer.findUnique({ where: { id } });
  if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

  // Optional ownership check
  if (buyer.ownerId !== currentUser.id) {
    return NextResponse.json({ error: "You can only view your own leads" }, { status: 403 });
  }

  // Fetch last 5 history entries
  const history = await prisma.buyerHistory.findMany({
    where: { buyerId: id },
    orderBy: { changedAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    buyer: { ...buyer, updatedAt: buyer.updatedAt.toISOString() },
    history: history.map((h) => ({
      ...h,
      changedAt: h.changedAt.toISOString(),
      diff: h.diff ?? {},
    })),
  });
}


export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get id from URL
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // last segment
  if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json();
  const {
    fullName,
    email,
    phone,
    city,
    propertyType,
    bhk,
    purpose,
    budgetMin,
    budgetMax,
    timeline,
    source,
    status,
    notes,
    tags,
    updatedAt,
  } = body;

  // Fetch current buyer
  const currentBuyer = await prisma.buyer.findUnique({ where: { id } });
  if (!currentBuyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

  // Ownership check
  if (currentBuyer.ownerId !== currentUser.id) {
    return NextResponse.json({ error: "You can only edit your own leads" }, { status: 403 });
  }

  // Check concurrency
  if (new Date(updatedAt).getTime() !== currentBuyer.updatedAt.getTime()) {
    return NextResponse.json({ error: "Record changed, please refresh" }, { status: 409 });
  }

  // Compute diff for history
  const diff: Record<string, { old: any; new: any }> = {};
  for (const key of Object.keys(body)) {
    if (key === "updatedAt") continue;
    if ((body as any)[key] !== (currentBuyer as any)[key]) {
      diff[key] = { old: (currentBuyer as any)[key], new: (body as any)[key] };
    }
  }

  // Update buyer
  const updatedBuyer = await prisma.buyer.update({
    where: { id },
    data: {
      fullName,
      email,
      phone,
      city,
      propertyType,
      bhk,
      purpose,
      budgetMin,
      budgetMax,
      timeline,
      source,
      status,
      notes,
      tags,
    },
  });

  
  if (Object.keys(diff).length > 0) {
    await prisma.buyerHistory.create({
      data: {
        buyerId: id,
        changedBy: currentUser.id,
        diff,
      },
    });
  }

  
  const history = await prisma.buyerHistory.findMany({
    where: { buyerId: id },
    orderBy: { changedAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    buyer: updatedBuyer,
    history: history.map((h) => ({
      ...h,
      changedAt: h.changedAt.toISOString(),
      diff: h.diff ?? {},
    })),
  });
}
