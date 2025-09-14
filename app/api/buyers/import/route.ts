import { PrismaClient } from "@prisma/client";
import csv from "csv-parser";
import { Readable } from "stream";
import { getCurrentUser } from "@/app/api/login/auth";
import { buyerSchema } from "../../../schemas/buyer";


const prisma = new PrismaClient();

const reverseTimelineMap: Record<string, string> = {
  "0-3m": "ZeroToThreeMonths",
  "3-6m": "ThreeToSixMonths",
  ">6m": "GreaterThanSixMonths",
  Exploring: "Exploring",
};

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const csvText = await req.text();
    const rows: any[] = [];
    const stream = Readable.from(csvText);

    // Parse CSV
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    const errors: { row: number; message: string }[] = [];
    const validRows: any[] = [];

    // Validate each row using buyerSchema
    for (let idx = 0; idx < rows.length; idx++) {
      const rowNum = idx + 2; 
      const row = rows[idx];

      // Transform CSV fields
      const transformedRow = {
        ...row,
        budgetMin: row.budgetMin ? Number(row.budgetMin) : undefined,
        budgetMax: row.budgetMax ? Number(row.budgetMax) : undefined,
        tags: row.tags?.split(",").map((t: string) => t.trim()) || [],
        timeline: reverseTimelineMap[row.timeline] || row.timeline,
        bhk: row.bhk || undefined,
        email: row.email || undefined,
        notes: row.notes || undefined,
      };

      // Validate with zod schema
      const parsed = buyerSchema.safeParse(transformedRow);

      if (!parsed.success) {
        // Collect all errors
        Object.values(parsed.error.flatten().fieldErrors).forEach((msgs) => {
          msgs?.forEach((msg) => errors.push({ row: rowNum, message: msg }));
        });
      } else {
        // Additional logical check: budgetMax > budgetMin
        if (
          parsed.data.budgetMin !== undefined &&
          parsed.data.budgetMax !== undefined &&
          parsed.data.budgetMax < parsed.data.budgetMin
        ) {
          errors.push({ row: rowNum, message: "budgetMax must be greater than budgetMin" });
        } else {
          validRows.push(parsed.data);
        }
      }
    }

    if (validRows.length === 0) {
      return new Response(
        JSON.stringify({ errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Insert valid rows into DB
    for (const row of validRows) {
      const buyer = await prisma.buyer.create({
        data: {
          ...row,
          ownerId: currentUser.id,
        },
      });

      await prisma.buyerHistory.create({
        data: {
          buyerId: buyer.id,
          changedBy: currentUser.id,
          diff: { action: "Created via CSV import", data: row },
        },
      });
    }

    return new Response(
      JSON.stringify({ inserted: validRows.length, errors }),
      { status: errors.length ? 207 : 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("CSV parsing error", err);
    return new Response(
      JSON.stringify({ error: "Failed to parse CSV" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
