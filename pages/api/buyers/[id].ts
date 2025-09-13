import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

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
  } = req.body;

  if (!id || typeof id !== "string") return res.status(400).json({ error: "Invalid ID" });

  // Fetch current buyer
  const currentBuyer = await prisma.buyer.findUnique({ where: { id } });
  if (!currentBuyer) return res.status(404).json({ error: "Buyer not found" });

  // Check concurrency
  if (new Date(updatedAt).getTime() !== currentBuyer.updatedAt.getTime()) {
    return res.status(409).json({ error: "Record changed, please refresh" });
  }

  // Compute diff for history
  const diff: Record<string, { old: any; new: any }> = {};
  for (const key of Object.keys(req.body)) {
    if (key === "updatedAt") continue;
    if ((req.body as any)[key] !== (currentBuyer as any)[key]) {
      diff[key] = { old: (currentBuyer as any)[key], new: (req.body as any)[key] };
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

  // Log to buyerHistory if any changes
  if (Object.keys(diff).length > 0) {
    await prisma.buyerHistory.create({
      data: {
        buyerId: id,
        changedBy: "demo-user", // you can replace with logged-in user
        diff,
      },
    });
  }

  res.status(200).json({ buyer: updatedBuyer });
}
