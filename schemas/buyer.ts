import { z } from "zod";

/*
export const buyerFormSchema = z.object({
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
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
});



// Zod schema remains unchanged
export const buyerSchema = z.object({
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
});*/


export const buyerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z
      .string()
      .email("Invalid email")
      .optional()
      .or(z.literal("")), // allow empty string
    phone: z
      .string()
      .regex(/^\d{10,15}$/, "Phone must be 10–15 digits"),
    city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
    propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
    bhk: z.enum(["Studio", "One", "Two", "Three", "Four"]).optional(),
    purpose: z.enum(["Buy", "Rent"]),
    budgetMin: z.coerce.number().int().nonnegative().optional(),
    budgetMax: z.coerce.number().int().nonnegative().optional(),
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
  })
  // --- Cross-field validations ---
  .refine(
    (data) =>
      data.budgetMin == null ||
      data.budgetMax == null ||
      data.budgetMax >= data.budgetMin,
    {
      message: "Maximum budget must be greater than or equal to minimum budget",
      path: ["budgetMax"],
    }
  )
  .refine(
    (data) =>
      data.propertyType !== "Apartment" &&
      data.propertyType !== "Villa"
        ? true
        : !!data.bhk && data.bhk.trim() !== "",
    {
      message: "BHK is required for Apartment or Villa",
      path: ["bhk"],
    }
  );
