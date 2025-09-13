import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { Parser } from "json2csv"; // npm i json2csv

const prisma = new PrismaClient();

const timelineMap: Record<string, string> = {
  ZeroToThreeMonths: "0-3m",
  ThreeToSixMonths: "3-6m",
  GreaterThanSixMonths: ">6m",
  Exploring: "Exploring",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    // (Optional) Add filters/search from query later if needed
    const buyers = await prisma.buyer.findMany();

    // Convert timeline from DB enum → short label
    const rows = buyers.map((b) => ({
      ...b,
      timeline: timelineMap[b.timeline as keyof typeof timelineMap] || b.timeline,
    }));

    const fields = [
      "fullName",
      "email",
      "phone",
      "city",
      "propertyType",
      "bhk",
      "purpose",
      "budgetMin",
      "budgetMax",
      "timeline",
      "source",
      "notes",
      "tags",
      "status",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    res.setHeader("Content-Disposition", "attachment; filename=buyers.csv");
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (err) {
    console.error("CSV Export error:", err);
    res.status(500).json({ error: "Failed to export buyers" });
  }
}
