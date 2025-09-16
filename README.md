
# LeadManager

**Project:** Capture, list, and manage buyer leads with validation, search/filter, and CSV import/export.


---

## **Table of Contents**

* [Tech Stack](#tech-stack)
* [Setup](#setup)
* [Pages & Features](#pages--features)
* [Screenshots](#screenshots)
* [Design Notes](#design-notes)
* [Done vs Skipped](#done-vs-skipped)
  

---

## **Tech Stack**

* **Frontend:** Next.js 13 (App Router) + TypeScript + React Hooks
* **Backend/DB:** Supabase (Postgres) with migrations
* **Validation:** Zod (client + server)
* **Auth:** Simple login with token/localStorage
* **Styling:** CSS Modules + Tailwind (optional)
* **CSV Import/Export:** Papaparse or built-in parsing

---

## **Setup**

Setup (Run Locally)
1. Clone the repository
git clone https://github.com/rithwikreddy004/LeadManager.git

cd LeadManager

3. Install dependencies
npm install

4. Environment Variables

Create a .env.local file in the project root:


Supabase (or your Postgres DB)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

Optional: JWT secret
NEXTAUTH_SECRET=your-secret

Replace USER, PASSWORD, HOST, PORT, and DB_NAME for local Postgres.

4. Database Setup
With Supabase

Go to your Supabase project → Table Editor → create the following tables:

buyers

buyer_history

Or run Prisma migrations directly:

npx prisma migrate dev --name init

With Local PostgreSQL

Create a local database:

createdb buyer_lead_app


Apply migrations:

npx prisma migrate dev --name init


This will create tables automatically with correct schema.

5. Run the app locally
npm run dev


Visit http://localhost:3000
 to see the app.

## **Pages & Features**

### **1. Create Lead – `/buyers/new`**

* Full form with validation:

  * Required: `fullName`, `phone`, `city`, `propertyType`, `purpose`, `timeline`, `source`
  * Conditional: `bhk` required if `propertyType` is Apartment/Villa
  * Budget validation: `budgetMax >= budgetMin`
* On submit: Creates buyer + history entry

### **2. List & Search – `/buyers`**

* Server-side pagination (10 rows per page)
* Filters: `city`, `propertyType`, `status`, `timeline`
* Debounced search by `fullName|phone|email`
* Sort by `updatedAt` desc
* Actions: View / Edit

### **3. View & Edit – `/buyers/[id]`**

* Show all fields, edit with validation
* Concurrency: `updatedAt` check, friendly message on stale data
* Last 5 changes rendered from `buyer_history`

### **4. Import / Export**

* CSV Import: max 200 rows, row validation + table of errors
* CSV Export: current filtered list

---

## **Screenshots**


![Landing Page](#)#Landing Page
<img width="1915" height="865" alt="Screenshot 2025-09-14 202157" src="https://github.com/user-attachments/assets/d2192ec9-3dcd-40b3-9754-9e8c11a971cc" />


![Create Lead](#)#Create Lead
<img width="1883" height="859" alt="Screenshot 2025-09-14 202244" src="https://github.com/user-attachments/assets/10580676-a479-405c-b6cf-221b372698f9" />


![Buyer List](#)#Buyer List
<img width="1895" height="841" alt="Screenshot 2025-09-14 202404" src="https://github.com/user-attachments/assets/6ca72a06-c0e1-4c8b-97ae-3d186fedd704" />

![CSV Import with row wise errors if any](#)#CSV Import 
<img width="1883" height="857" alt="Screenshot 2025-09-14 202648" src="https://github.com/user-attachments/assets/8f9e253b-5271-459f-8237-fc8e38cf907f" />

![Edit Lead](#)#Edit Lead
<img width="1874" height="840" alt="Screenshot 2025-09-14 202734" src="https://github.com/user-attachments/assets/d8e12830-19bc-454b-bbe3-94f0a1fbc954" />


<img width="1885" height="847" alt="Screenshot 2025-09-14 202757" src="https://github.com/user-attachments/assets/37030919-48b2-464a-aa27-6e9e8d66cb34" />




---






## **Design Notes**

* **Validation:** Both client (React + Zod) and server (API route + Zod)
* **SSR vs Client:**

  * Listing (`/buyers`) is server-side rendered for pagination/filter
  * Forms & auth are client components
* **Ownership enforcement:**

  * Users can only edit/delete their own buyers
  * All users can read all buyers
* **Auth flow:** Token stored in localStorage or Supabase session

---

## **Done vs Skipped**

**✅ Completed**

* Buyer CRUD (with ownership)
* CSV import/export with validation
* Filters/search/pagination
* History tracking for edits
* Sticky Navbar with login/logout
* Form validations (client + server)
Full-text search across multiple fields



---



## **Testing & Quality**

* CSV row validator unit test ✅
* Accessible forms: labels, keyboard focus, announcements ✅





