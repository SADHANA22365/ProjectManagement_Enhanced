# TaskFlow – Project Management Platform

A professional full-stack project management app built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

- **Role-based auth** — Register as Admin or User (client) with JWT via Supabase Auth
- **Admin Dashboard** — Full project & task management, assign tasks to users, track progress
- **Client Portal** — View assigned projects, task progress, file sharing
- **Progress Bars** — Visual task completion tracking per project
- **Task Assignment** — Create tasks and assign to any registered user
- **User Profile Editing** — Update name, email, phone, and bio
- **File Sharing** — Upload and manage files per project
- **Activity Updates** — Post and comment on project updates
- **Dark Mode** — Full dark/light theme support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS Variables |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Password / JWT) |
| Storage | Supabase Storage |
| Deployment | Vercel / Render / Railway |

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (free tier works)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd client-project-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
# Fill in your Supabase credentials
```

### 4. Set up Supabase database

Run this SQL in your Supabase SQL editor:

```sql
-- Users table (extends Supabase auth.users)
create table users (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  role text default 'client' check (role in ('admin', 'client')),
  phone text,
  bio text
);

-- Projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  client_id uuid references users(id),
  start_date date not null,
  deadline date not null,
  status text default 'In Progress' check (status in ('In Progress', 'Completed', 'Delayed')),
  created_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'To Do' check (status in ('To Do', 'In Progress', 'Completed')),
  assigned_to uuid references users(id),
  deadline date,
  created_at timestamptz default now()
);

-- Updates
create table updates (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  content text not null,
  created_by uuid references users(id),
  timestamp timestamptz default now()
);

-- Comments
create table comments (
  id uuid default gen_random_uuid() primary key,
  update_id uuid references updates(id) on delete cascade,
  user_id uuid references users(id),
  comment text not null,
  timestamp timestamptz default now()
);

-- Files
create table files (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  uploaded_by uuid references users(id),
  created_at timestamptz default now()
);

-- Client notes
create table client_notes (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references users(id),
  note text not null,
  created_at timestamptz default now()
);

-- Trigger: auto-insert user profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### 5. Enable Supabase Auth
- Go to **Authentication > Providers** → Enable **Email**
- Optionally disable email confirmation for dev

### 6. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | Storage bucket name (default: `project-files`) |

> ⚠️ Never commit `.env.local` — it's in `.gitignore`

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
```bash
docker build -t taskflow .
docker run -p 3000:3000 --env-file .env.local taskflow
```

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Create/manage projects, create/assign/delete tasks, manage files, post updates, view all data |
| **User (Client)** | View assigned projects, view tasks, upload files, post notes |

## License
MIT
