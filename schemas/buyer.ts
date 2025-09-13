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
});*/



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
});