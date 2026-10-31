# Brightloop Software – Supabase Database Migrations

This directory contains the PostgreSQL migration scripts for **Module 2: Authentication, Profiles, and Role-Based Access Control (RBAC)**.

---

## Migration Execution Order

Execute these scripts in the **Supabase Dashboard &rarr; SQL Editor**:

1. **`01_create_profiles_and_rbac.sql`**
   - Creates the `public.profiles` table with role constraints (`admin`, `staff`, `customer`).
   - Implements non-recursive security helper functions (`is_admin`, `is_staff_or_admin`).
   - Adds automatic `updated_at` trigger.
   - Adds security trigger preventing self-escalation of roles.
   - Adds trigger on `auth.users` to automatically create customer profiles upon public signup.
   - Enables Row Level Security (RLS) on `profiles`.

2. **`02_create_staff_invitations.sql`**
   - Creates the `public.staff_invitations` table with status checking (`pending`, `accepted`, `expired`, `cancelled`).
   - Enables RLS so only verified Admins can read, create, update, or cancel staff invitations.
   - Creates the `invite_staff_member(target_email)` stored procedure.

3. **`03_bootstrap_admin.sql`**
   - Defines the secure `bootstrap_initial_admin(admin_email)` procedure.
   - Binds initial enterprise administrative authority to `admin.brightloopodoohack@gmail.com`.
   - Prevents unauthorized takeover once an admin is active.

4. **`04_fix_admin_bootstrap.sql` (Corrective Migration)**
   - Resolves the trigger deadlock during initial admin setup.
   - Updates `protect_profile_roles()` to allow the narrowly-scoped bootstrap transaction for `admin.brightloopodoohack@gmail.com`.
   - Executes the bootstrap procedure and returns the verified admin profile record.

---

## How to Run Migrations in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. In the left navigation, click **SQL Editor**.
4. Click **New Query**.
5. Copy and paste the contents of `01_create_profiles_and_rbac.sql` &rarr; Click **Run**.
6. Repeat for `02_create_staff_invitations.sql` &rarr; Click **Run**.
7. Create your initial Admin user (see below), then execute `03_bootstrap_admin.sql`.

---

## Initial Admin Bootstrap Guide

1. In Supabase Dashboard, go to **Authentication &rarr; Users**.
2. Click **Add User &rarr; Create User**.
3. Enter:
   - **Email:** `admin.brightloopodoohack@gmail.com`
   - **Password:** Strong password (e.g. 12+ characters with uppercase, lowercase, numbers, and special symbols).
   - Check **Auto Confirm User?** &rarr; Yes.
4. Go to **SQL Editor** &rarr; Run:
   ```sql
   SELECT public.bootstrap_initial_admin('admin.brightloopodoohack@gmail.com');
   ```
5. Confirm output shows `'role': 'admin'`.
