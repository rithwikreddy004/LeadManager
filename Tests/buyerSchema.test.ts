import { buyerSchema } from "../app/schemas/buyer";

describe("buyerSchema", () => {
  it("rejects when budgetMax is less than budgetMin", () => {
    const invalid = {
      fullName: "John Doe",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "Two", 
      purpose: "Buy",
      budgetMin: 2000,
      budgetMax: 1000, // only this should fail
      timeline: "ThreeToSixMonths",
      source: "Website",
    };

    const result = buyerSchema.safeParse(invalid);
    if (!result.success) {
      console.log(result.error.format()); // see which rule failed
    }
    expect(result.success).toBe(false);
  });

  it("accepts a valid buyer lead", () => {
    const valid = {
      fullName: "Jane Doe",
      phone: "9876543210",
      city: "Mohali",
      propertyType: "Villa",
      bhk: "Three",
      purpose: "Buy",
      budgetMin: 1000,
      budgetMax: 5000,
      timeline: "ThreeToSixMonths",
      source: "Referral",
    };
    const result = buyerSchema.safeParse(valid);
    if (!result.success) {
      console.log(result.error.format());
    }
    expect(result.success).toBe(true);
  });
});
