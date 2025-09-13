import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import csv from "csv-parser";
import { Readable } from "stream";

const prisma = new PrismaClient();

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

const cities: City[] = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"];
const propertyTypes: PropertyType[] = ["Apartment", "Villa", "Plot", "Office", "Retail"];
const statuses: Status[] = [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
];

const reverseTimelineMap: Record<string, Timeline> = {
  "0-3m": "ZeroToThreeMonths",
  "3-6m": "ThreeToSixMonths",
  ">6m": "GreaterThanSixMonths",
  Exploring: "Exploring",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const buffer = Buffer.from(req.body);
  const stream = Readable.from(buffer);
  const rows: any[] = [];

  stream
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      const errors: { row: number; message: string }[] = [];
      const validRows: any[] = [];

      // Validate rows
      rows.forEach((row, idx) => {
        const rowNum = idx + 2; // header = row 1
        const rowErrors: string[] = [];

        // Map timeline
        const dbTimeline = reverseTimelineMap[row.timeline];
        if (!dbTimeline) rowErrors.push(`Invalid timeline: ${row.timeline}`);
        else row.timeline = dbTimeline;

        // Required fields
        if (!row.fullName || !row.phone) rowErrors.push("Missing required fields");
        if (!cities.includes(row.city as City)) rowErrors.push(`Invalid city: ${row.city}`);
        if (!propertyTypes.includes(row.propertyType as PropertyType))
          rowErrors.push(`Invalid propertyType: ${row.propertyType}`);
        if (!statuses.includes(row.status as Status)) rowErrors.push(`Invalid status: ${row.status}`);

        if (rowErrors.length > 0) {
          rowErrors.forEach((m) => errors.push({ row: rowNum, message: m }));
        } else {
          validRows.push(row);
        }
      });

      if (validRows.length === 0) return res.status(400).json({ errors });

      const insertedCount = 0;

      try {
        // Insert each valid row with history in a transaction
        for (const row of validRows) {
          const buyer = await prisma.buyer.create({
            data: {
              ...row,
              ownerId: "demo-user",
              budgetMin: Number(row.budgetMin),
              budgetMax: Number(row.budgetMax),
              tags: row.tags?.split(",").map((t: string) => t.trim()) || [],
            },
          });

          await prisma.buyerHistory.create({
            data: {
              buyerId: buyer.id,
              changedBy: "demo-user",
              diff: { action: "Created via CSV import", data: row },
            },
          });
        }

        return res.status(errors.length ? 207 : 200).json({
          inserted: validRows.length,
          errors,
        });
      } catch (err) {
        console.error("DB Error", err);
        return res.status(500).json({ error: "DB Error" });
      }
    });
}
