# DAUST Resource Management System (RMS)

## 📌 Project Overview
DAUST RMS is a comprehensive web application designed to centralize and automate the reservation of university resources. It replaces manual booking processes with a digital, real-time platform, allowing students to book classrooms, laboratories, and equipment while giving administration full control over approvals and inventory.

**Live Demo:** [https://daust-resource-management-system.vercel.app/]
## Project Structure
```bash
src/
├── lib/           # Supabase client configuration
├── pages/         # Application Views (Home, Dashboard, Login, etc.)
│   ├── AdminDashboard.jsx
│   ├── BookResource.jsx
│   ├── MyBookings.jsx
│   └── ...
├── App.jsx        # Main Router & Layout logic
└── index.css      # Tailwind Global Styles

## Key Features

### For Students
- **Real-Time Availability:** Visual "Busy Slots" indicator prevents booking conflicts before they happen.
- **Resource Catalog:** Filterable list of rooms, labs, and equipment with images and details.
- **Mobile-First Design:** Fully responsive interface with a mobile-friendly booking history (Card view).
- **Booking Tracking:** Track the status of requests (Pending, Approved, Rejected).

### For Administration
- **Approval Workflow:** Review and Approve/Reject student booking requests.
- **Inventory Management:**
  - **Add Resources:** Upload photos directly to Supabase Storage.
  - **Edit Resources:** Update capacity, descriptions, or types.
  - **Soft Delete:** safely remove resources from the dashboard without breaking historical data.
- **Admin Dashboard:** Centralized view of all pending actions.

## Tech Stack
- **Frontend:** React.js (Vite), Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email/Password)
- **Storage:** Supabase Storage (Image hosting)
- **Notifications:** React Hot Toast
- **Routing:** React Router DOM (with SPA configuration)
- **Deployment:** Vercel


3. **Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_public_anon_key
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

## Database Schema & Security
The project uses Row Level Security (RLS) to ensure data privacy:
- **profiles:** Links to Auth users. Stores roles (student vs admin).
- **resources:** Stores inventory data. Includes an `is_active` flag for soft deletion.
- **bookings:** Links users to resources with start/end times. Includes specific policies to prevent overlapping approved bookings.
- **storage:** Public bucket `resource-images` for hosting resource photos.

## Testing (Admin Access)
To test the Administrator features (Add/Edit Resource, Approval Workflow), use the following credentials:
- **Email:** admin@daust.org
- **Password:** admin123

## Responsiveness
The application features a custom Hamburger Menu on mobile and automatically switches from Table Views (Desktop) to Card Views (Mobile) for better usability on small screens.
