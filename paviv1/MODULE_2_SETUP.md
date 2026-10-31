# Brightloop Software – Module 2 Setup & Operations Guide
## Supabase Integration, Database, Authentication & RBAC

This guide details the step-by-step setup required to connect your Supabase project, execute database migrations, bootstrap the initial enterprise administrator, and test all three role-based access portals (**Admin**, **Staff**, and **Customer**).

---

## 1. Supabase Project Setup & API Credentials

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and navigate to your project.
2. Go to **Project Settings** (gear icon at bottom left) &rarr; **API**.
3. Under **Project API keys**, copy:
   - **Project URL:** `https://your-project-ref.supabase.co`
   - **Publishable Key (Anon Key):** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

> [!CAUTION]
> **Security Rules:**
> - NEVER share or expose your `service_role` key in frontend code or in Git.
> - Only use the `anon` / publishable key on the client side.
> - Do not commit your `.env` file to version control.

---

## 2. Local Environment (`.env`) Configuration

Inside the `paviv1/` folder, copy `.env.example` to create your local `.env` file:

```powershell
cd C:\CODE_WITH_PAVI\ODOO\Subscription-Management-System-ODOO\paviv1
Copy-Item .env.example .env
```

Open `paviv1/.env` in your text editor and fill in your keys:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-publishable-key-here
```

Restart your Vite development server after editing `.env`:

```bash
npm run dev
```

---

## 3. Database Migration Execution

Navigate to **Supabase Dashboard &rarr; SQL Editor &rarr; New Query**, and run each script located in `paviv1/supabase/migrations/`:

### Step 3.1: Execute `01_create_profiles_and_rbac.sql`
- Creates `public.profiles` with `role IN ('admin', 'staff', 'customer')` and `account_status IN ('active', 'invited', 'suspended')`.
- Creates non-recursive helper functions (`is_admin`, `is_staff_or_admin`).
- Enables Row Level Security (RLS) and automatic `auth.users` profile creation trigger.

### Step 3.2: Execute `02_create_staff_invitations.sql`
- Creates `public.staff_invitations` with expiration periods.
- Enables Admin-only RLS policies.
- Deploys `invite_staff_member(target_email)` stored procedure.

### Step 3.3: Execute `03_bootstrap_admin.sql`
- Deploys `bootstrap_initial_admin(admin_email)` stored procedure.

---

## 4. Supabase Authentication Settings

In the **Supabase Dashboard &rarr; Authentication**:

1. **Email Provider Configuration:**
   - Go to **Authentication &rarr; Providers &rarr; Email**.
   - Ensure **Enable Email provider** is turned **ON**.
   - **Confirm email:**
     - For production: Keep enabled (users receive a verification email upon signup).
     - For fast local hackathon testing: You may temporarily toggle *Confirm email* OFF to sign in immediately without waiting for confirmation emails.

2. **URL Configuration & Redirects:**
   - Go to **Authentication &rarr; URL Configuration**.
   - **Site URL:** Set to `http://localhost:5173`
   - **Redirect URLs:** Add:
     - `http://localhost:5173/**`
     - `http://localhost:5173/reset-password`
     - `http://localhost:5173/portal`
     - `http://localhost:5173/staff`

---

## 5. Secure Initial Admin Account Creation

The registered initial administrator email is:
`admin.brightloopodoohack@gmail.com`

Follow this one-time bootstrap workflow:

1. In Supabase Dashboard, go to **Authentication &rarr; Users &rarr; Add User &rarr; Create User**.
2. Enter:
   - **Email:** `admin.brightloopodoohack@gmail.com`
   - **Password:** Choose a strong, secret password (minimum 8 chars with uppercase, lowercase, numbers, and special characters).
   - Check **Auto Confirm User?** &rarr; Yes.
3. Click **Create User**.
4. Go to **SQL Editor &rarr; New Query** and execute:
   ```sql
   SELECT public.bootstrap_initial_admin('admin.brightloopodoohack@gmail.com');
   ```
5. Confirm the query output returns:
   ```json
   {
     "success": true,
     "email": "admin.brightloopodoohack@gmail.com",
     "role": "admin",
     "status": "active"
   }
   ```
6. Navigate to `http://localhost:5173/login`, click the **Admin** tab, enter the credentials, and sign in to the Admin Dashboard.

---

## 6. Testing the Three Roles

### Role 1: Customer
1. Navigate to `http://localhost:5173/register`.
2. Fill out Full Name, email, and password adhering to security complexity rules (> 8 chars, uppercase, lowercase, symbol).
3. Click **Complete Customer Registration**.
4. Sign in under the **Customer** tab at `/login`.
5. Verify you are redirected to `/portal` (Customer Self-Service Hub).
6. Verify attempts to access `/staff-management` or admin endpoints are blocked.

### Role 2: Staff
1. Log in as **Admin**.
2. Go to **Staff Management** (`/staff-management`).
3. Enter a staff email (e.g. `operator@brightloop.io`) and click **Send Invitation**.
4. In Supabase Auth, create the user with `operator@brightloop.io`.
5. The trigger automatically matches the pending invitation and creates a profile with role `staff`!
6. Navigate to `http://localhost:5173/login`, click the **Staff** tab, and sign in.
7. Verify you are redirected to `/staff` (Staff Operations Desk).
8. Verify Staff cannot access `/staff-management` or invite other staff.

### Role 3: Admin
1. Navigate to `/login` &rarr; Click **Admin** tab.
2. Sign in with `admin.brightloopodoohack@gmail.com`.
3. Verify access to the complete enterprise dashboard, all business modules, and Staff Management (`/staff-management`).

---

## 7. Password Recovery Testing

1. Navigate to `http://localhost:5173/forgot-password`.
2. Enter your account email and click **Send Password Reset Link**.
3. Open the email and click the recovery link (redirects to `http://localhost:5173/reset-password`).
4. Enter your new password and confirmation.
5. Click **Save New Password & Sign In**.
6. Verify you can immediately sign in with the new password.

---

## 8. Optional Custom SMTP Setup (Gmail)

Initially, Supabase sends up to 30 emails/hour on the free tier. To configure Gmail SMTP for high-volume custom delivery:
1. In Google Account &rarr; Security &rarr; Enable 2-Step Verification &rarr; Generate an **App Password** for "Mail".
2. In Supabase Dashboard &rarr; **Project Settings &rarr; Authentication &rarr; SMTP Settings**:
   - **Sender email:** `admin.brightloopodoohack@gmail.com`
   - **Sender name:** Brightloop Software
   - **Host:** `smtp.gmail.com`
   - **Port:** `587`
   - **Username:** `admin.brightloopodoohack@gmail.com`
   - **Password:** *(Your 16-character Google App Password)*
