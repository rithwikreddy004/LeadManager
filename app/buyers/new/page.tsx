"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerSchema } from "@/schemas/buyer";

export default function CreateBuyerPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(buyerSchema),
  });

  const propertyType = watch("propertyType");

  const onSubmit = async (data: any) => {
    try {
      if (typeof data.tags === "string") {
        data.tags = data.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);
      }

      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.log("Error:", errorData);
        return;
      }

      const buyer = await res.json();
      console.log("Created buyer:", buyer);
      alert("Buyer created successfully!");
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block font-medium mb-1";
  const errorClass = "text-red-500 text-sm mt-1";

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Buyer Lead</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className={labelClass}>Full Name</label>
          <input {...register("fullName")} className={inputClass} />
          {(errors.fullName as any)?.message && (
            <p className={errorClass}>{(errors.fullName as any)?.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email</label>
          <input {...register("email")} className={inputClass} />
          {(errors.email as any)?.message && (
            <p className={errorClass}>{(errors.email as any)?.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>Phone</label>
          <input {...register("phone")} className={inputClass} />
          {(errors.phone as any)?.message && (
            <p className={errorClass}>{(errors.phone as any)?.message}</p>
          )}
        </div>

        {/* City & Property Type in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <select {...register("city")} className={inputClass}>
              {["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
            {(errors.city as any)?.message && (
              <p className={errorClass}>{(errors.city as any)?.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Property Type</label>
            <select {...register("propertyType")} className={inputClass}>
              {["Apartment", "Villa", "Plot", "Office", "Retail"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {(errors.propertyType as any)?.message && (
              <p className={errorClass}>{(errors.propertyType as any)?.message}</p>
            )}
          </div>
        </div>

        {/* Conditional BHK */}
        {["Apartment", "Villa"].includes(propertyType) && (
          <div>
            <label className={labelClass}>BHK</label>
            <select {...register("bhk")} className={inputClass}>
              {["Studio", "One", "Two", "Three", "Four"].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {(errors.bhk as any)?.message && (
              <p className={errorClass}>{(errors.bhk as any)?.message}</p>
            )}
          </div>
        )}

        {/* Purpose & Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Purpose</label>
            <select {...register("purpose")} className={inputClass}>
              {["Buy", "Rent"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {(errors.purpose as any)?.message && (
              <p className={errorClass}>{(errors.purpose as any)?.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Timeline</label>
            <select {...register("timeline")} className={inputClass}>
              {[
                "ZeroToThreeMonths",
                "ThreeToSixMonths",
                "GreaterThanSixMonths",
                "Exploring",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {(errors.timeline as any)?.message && (
              <p className={errorClass}>{(errors.timeline as any)?.message}</p>
            )}
          </div>
        </div>

        {/* Budget Min & Max */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Budget Min (INR)</label>
            <input
              type="number"
              {...register("budgetMin", { valueAsNumber: true })}
              className={inputClass}
            />
            {(errors.budgetMin as any)?.message && (
              <p className={errorClass}>{(errors.budgetMin as any)?.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Budget Max (INR)</label>
            <input
              type="number"
              {...register("budgetMax", { valueAsNumber: true })}
              className={inputClass}
            />
            {(errors.budgetMax as any)?.message && (
              <p className={errorClass}>{(errors.budgetMax as any)?.message}</p>
            )}
          </div>
        </div>

        {/* Source */}
        <div>
          <label className={labelClass}>Source</label>
          <select {...register("source")} className={inputClass}>
            {["Website", "Referral", "WalkIn", "Call", "Other"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {(errors.source as any)?.message && (
            <p className={errorClass}>{(errors.source as any)?.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notes</label>
          <textarea {...register("notes")} className={inputClass} rows={3} />
          {(errors.notes as any)?.message && (
            <p className={errorClass}>{(errors.notes as any)?.message}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className={labelClass}>Tags (comma-separated)</label>
          <input
            {...register("tags")}
            placeholder="e.g. premium, hot lead"
            className={inputClass}
          />
          {(errors.tags as any)?.message && (
            <p className={errorClass}>{(errors.tags as any)?.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Create Buyer
        </button>
      </form>
    </div>
  );
}
