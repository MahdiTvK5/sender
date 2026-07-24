# پلتفرم ارسال کانفیگ · Config Share

<div dir="rtl">

یک اپلیکیشن تک‌صفحه‌ای مدرن و فارسی (RTL) برای **اشتراک‌گذاری ناشناس کانفیگ** با رابط کاربری تیره و نئونی. کاربر کانفیگ خود را وارد می‌کند، یک **کد ۵ رقمی یکتا** و یک **لینک هوشمند** دریافت می‌کند که پس از ۲۴ ساعت منقضی می‌شود.

</div>

A modern, mobile-first Persian (RTL) single-page app for **anonymous config sharing** with a premium dark neon UI. Paste a config, get a unique 5-digit code and a smart share link that expires after 24 hours.

## ✨ Features

- **Smart Link Generator** — paste a config, get a unique random 5-digit code (e.g. `69168`) and an exclusive share link (`/s/69168`).
- **Generated Code Card** — large glowing code, live 24-hour countdown timer, status badge (فعال / منقضی شده), QR code, copy & delete actions.
- **Receive section** — enter a 5-digit code and get redirected to the config.
- **Dynamic share page** `/s/[code]` — no login required. Shows the stored config, or:
  - `این لینک منقضی شده است.` when expired
  - `کانفیگی پیدا نشد.` when not found
- **Copy features** — separate copy buttons for the code, the link, and the config, each with a `کپی شد.` toast.
- **Delete** — removes the config, code, link and DB record.
- **QR code** generation for every share link.
- **Dark / Light mode** with persisted preference.
- **Animations** — fade-in cards, hover scale, copy-success animation, animated countdown, neon glow, animated background.
- Full **RTL Persian** support with the Vazirmatn font.

## 🧱 Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** (glassmorphism, gradients, glow)
- **Framer Motion** (animations)
- **Lucide Icons**
- **better-sqlite3** (SQLite database)
- **qrcode** (QR generation)

## 🎨 Theme

- Background: `#0d1117`
- Purple gradient: `#8b5cf6 → #d946ef`
- Cyan: `#06b6d4` · Blue: `#3b82f6`

## 🚀 Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

### Environment variables (optional)

Create a `.env` file:

```bash
# Public base URL used to build share links. If omitted, it is derived from the request host.
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Custom SQLite database path (defaults to ./data/configs.db)
DATABASE_PATH=./data/configs.db
```

## 🔌 API

### `POST /api/create`

Request:

```json
{ "config": "your config text" }
```

Response `201`:

```json
{ "code": "69168", "shareLink": "https://domain.com/s/69168", "expiresAt": 0, "createdAt": 0 }
```

### `GET /api/config/[code]`

Response `200`:

```json
{ "config": "...", "code": "69168", "createdAt": 0, "expiresAt": 0, "status": "active" }
```

- `404` → `کانفیگی پیدا نشد.`
- `410` → `این لینک منقضی شده است.`

### `DELETE /api/config/[code]`

Deletes the record. Response `200`: `{ "success": true }`.

## 🗄️ Database Schema

Table `configs`:

| column      | type    | notes                          |
| ----------- | ------- | ------------------------------ |
| `id`        | TEXT    | UUID, primary key              |
| `code`      | TEXT    | 5-digit code, **unique index** |
| `config`    | TEXT    | raw config payload             |
| `shareLink` | TEXT    | full share URL                 |
| `createdAt` | INTEGER | epoch ms                       |
| `expiresAt` | INTEGER | epoch ms (createdAt + 24h)     |
| `status`    | TEXT    | `active` \| `expired`          |

> To use **PostgreSQL** instead of SQLite, reimplement the queries in `src/lib/store.ts` with `pg`; the schema is identical.

## 🔐 Security

- **Rate limiting** per IP on all API routes (fixed window, in-memory).
- **Input validation** — empty configs rejected, size-capped, strict 5-digit code regex.
- **XSS prevention** — config is rendered as text (React auto-escapes); an `escapeHtml` helper is provided for any HTML context.
- **SQL injection prevention** — all queries use parameterised statements.
- **Unique index** on `code` guarantees uniqueness even under concurrency; generation retries on collision.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).

## 🚢 استقرار روی سرور (VPS + PM2 + Nginx)

<div dir="rtl">

روش پیشنهادی برای این پروژه (چون از SQLite استفاده می‌کند و به دیسک پایدار نیاز دارد).

</div>

```bash
# 1) پیش‌نیازها (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git build-essential nginx
sudo npm install -g pm2

# 2) گرفتن کد و نصب
git clone https://github.com/MahdiTvK5/sender.git
cd sender
npm install

# 3) تنظیمات محیطی
cp .env.example .env
nano .env        # NEXT_PUBLIC_BASE_URL و DATABASE_PATH را تنظیم کنید
sudo mkdir -p /var/lib/config-share && sudo chown $USER:$USER /var/lib/config-share

# 4) build و اجرا با PM2
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup       # دستور چاپ‌شده را اجرا کنید تا بعد از ری‌استارت خودکار بالا بیاید
```

سپس Nginx را به‌عنوان reverse proxy تنظیم کنید (`/etc/nginx/sites-available/config-share`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/config-share /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS رایگان
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**به‌روزرسانی نسخه:**

```bash
git pull && npm install && npm run build && pm2 restart config-share
```

> هدرهای `X-Forwarded-For` و `X-Forwarded-Proto` را در Nginx حفظ کنید؛ rate limiting و ساخت لینک با `https` به آن‌ها متکی است.

### گزینه جایگزین: Docker

```bash
docker build -t config-share .
docker run -d -p 3000:3000 -v config_data:/app/data --name config-share config-share
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── create/route.ts            # POST /api/create
│   │   └── config/[code]/route.ts     # GET & DELETE /api/config/[code]
│   ├── s/[code]/page.tsx              # dynamic share page
│   ├── layout.tsx                     # RTL root layout, fonts, providers
│   ├── page.tsx                       # home (generator + receive)
│   ├── loading.tsx / not-found.tsx
│   └── globals.css
├── components/                        # reusable UI (cards, buttons, toast, QR, countdown…)
└── lib/                               # db, store, validation, rate-limit, types
```
