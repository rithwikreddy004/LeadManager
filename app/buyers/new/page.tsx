"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerSchema } from "../../schemas/buyer";
import Navbar from "../../globalnavbar";

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
      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          alert("You are not logged in! Please login first.");
          window.location.href = "/login";
        } else {
          alert("Error: " + (resData.error || "Something went wrong"));
        }
        return;
      }

      alert("Buyer created successfully!");
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="form-container">
      <h1>Create Buyer Lead</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Full Name</label>
          <input {...register("fullName")} />
          {errors.fullName?.message && (
            <p className="error">{errors.fullName.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input {...register("email")} />
          {errors.email?.message && <p className="error">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input {...register("phone")} />
          {errors.phone?.message && <p className="error">{errors.phone.message}</p>}
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>City</label>
            <select {...register("city")}>
              {["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.city?.message && <p className="error">{errors.city.message}</p>}
          </div>

          <div className="form-group">
            <label>Property Type</label>
            <select {...register("propertyType")}>
              {["Apartment", "Villa", "Plot", "Office", "Retail"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.propertyType?.message && <p className="error">{errors.propertyType.message}</p>}
          </div>
        </div>

        {["Apartment", "Villa"].includes(propertyType) && (
          <div className="form-group">
            <label>BHK</label>
            <select {...register("bhk")}>
              {["Studio", "One", "Two", "Three", "Four"].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {errors.bhk?.message && <p className="error">{errors.bhk.message}</p>}
          </div>
        )}

        <div className="grid-2">
          <div className="form-group">
            <label>Purpose</label>
            <select {...register("purpose")}>
              {["Buy", "Rent"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.purpose?.message && <p className="error">{errors.purpose.message}</p>}
          </div>

          <div className="form-group">
            <label>Timeline</label>
            <select {...register("timeline")}>
              {["ZeroToThreeMonths", "ThreeToSixMonths", "GreaterThanSixMonths", "Exploring"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.timeline?.message && <p className="error">{errors.timeline.message}</p>}
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Budget Min (INR)</label>
            <input type="number" {...register("budgetMin", { valueAsNumber: true })} />
            {errors.budgetMin?.message && <p className="error">{errors.budgetMin.message}</p>}
          </div>

          <div className="form-group">
            <label>Budget Max (INR)</label>
            <input type="number" {...register("budgetMax", { valueAsNumber: true })} />
            {errors.budgetMax?.message && <p className="error">{errors.budgetMax.message}</p>}
          </div>
        </div>

        <div className="form-group">
          <label>Source</label>
          <select {...register("source")}>
            {["Website", "Referral", "WalkIn", "Call", "Other"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.source?.message && <p className="error">{errors.source.message}</p>}
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea {...register("notes")} rows={3} />
          {errors.notes?.message && <p className="error">{errors.notes.message}</p>}
        </div>

        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            {...register("tags", {
              setValueAs: (v) =>
                typeof v === "string"
                  ? v.split(",").map((t) => t.trim()).filter(Boolean)
                  : [],
            })}
            placeholder="e.g. premium, hot lead"
          />
          {errors.tags?.message && <p className="error">{errors.tags.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>Create Buyer</button>
      </form>

      <style jsx>{`
        .form-container {
          marin-top:8rem;
          max-width: 600px;
          margin: 3rem auto;
          padding: 2rem;
          background-color: #111827; /* dark gray */
          color: #f9fafb; /* white text */
          border-radius: 0.5rem;
          box-shadow: 0 5px 15px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
        }

        h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        label {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        input, select, textarea {
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #374151;
          background-color: #1f2937;
          color: #f9fafb;
          outline: none;
        }

        input:focus, select:focus, textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.5);
        }

        textarea {
          resize: vertical;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .grid-2 {
            grid-template-columns: 1fr 1fr;
          }
        }

        .error {
          color: #f87171;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        button {
          padding: 0.75rem;
          background-color: #3b82f6;
          color: #f9fafb;
          font-weight: 600;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        button:hover {
          background-color: #2563eb;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
    </>
  );
}
