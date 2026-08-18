# پلتفرم ارسال کانفیگ · Config Share (Python / FastAPI)

<div dir="rtl">

اپلیکیشن وب فارسی (RTL) برای **اشتراک‌گذاری ناشناس کانفیگ** با رابط کاربری تیره و نئونی. کاربر کانفیگ خود را وارد می‌کند، یک **کد ۵ رقمی یکتا** و یک **لینک هوشمند** می‌گیرد که پس از ۲۴ ساعت منقضی می‌شود. این نسخه کاملاً با **پایتون (FastAPI + SQLite)** نوشته شده و برای اجرا روی سرور فقط به `pip install` و یک دستور نیاز دارد — بدون Node و بدون مرحله build.

</div>

A Persian (RTL) web app for **anonymous config sharing** with a premium dark neon UI, written entirely in **Python (FastAPI + SQLite)**. No Node, no build step.

## ✨ Features

- **سازنده لینک هوشمند** — کانفیگ را وارد کنید و کد ۵ رقمی یکتا + لینک اختصاصی بگیرید.
- **کارت کد** — کد بزرگ و درخشان، تایمر شمارش معکوس ۲۴ ساعته، وضعیت (فعال/منقضی شده)، QR، و دکمه‌های کپی و حذف.
- **دریافت کانفیگ** — با وارد کردن کد ۵ رقمی به صفحهٔ `/s/{code}` هدایت می‌شوید.
- **صفحهٔ اشتراک `/s/{code}`** — بدون نیاز به ورود؛ نمایش کانفیگ، یا `این لینک منقضی شده است.` / `کانفیگی پیدا نشد.`
- کپی با نوتیفیکیشن `کپی شد.`، تولید QR برای هر لینک، حالت تاریک/روشن، انیمیشن‌ها و افکت‌های نئونی، و پشتیبانی کامل RTL با فونت وزیرمتن.

## 🧱 Tech Stack

- **Python 3.10+**، **FastAPI**، **Uvicorn**
- **SQLite** (ماژول `sqlite3` داخلی پایتون)
- **Jinja2** برای قالب‌ها
- **qrcode** برای تولید QR (خروجی SVG)
- HTML/CSS/JS خالص برای UI (بدون نیاز به build)

## 🚀 اجرای محلی

```bash
# ۱) ساخت محیط مجازی و نصب وابستگی‌ها
python3 -m venv .venv
source .venv/bin/activate          # ویندوز: .venv\Scripts\activate
pip install -r requirements.txt

# ۲) تنظیمات (اختیاری)
cp .env.example .env               # مقادیر را در صورت نیاز ویرایش کنید

# ۳) اجرا
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

سپس مرورگر را روی `http://localhost:8000` باز کنید.

### متغیرهای محیطی (`.env`)

| متغیر           | پیش‌فرض             | توضیح                                              |
| --------------- | ------------------- | ------------------------------------------------- |
| `BASE_URL`      | (خالی)              | آدرس عمومی برای ساخت لینک؛ خالی = از روی درخواست    |
| `DATABASE_PATH` | `./data/configs.db` | مسیر فایل دیتابیس SQLite                            |
| `TTL_HOURS`     | `24`                | مدت اعتبار هر لینک به ساعت                          |
| `HOST` / `PORT` | `0.0.0.0` / `8000`  | میزبان و پورت                                       |

## 🔌 API

### `POST /api/create`

```json
// درخواست
{ "config": "متن کانفیگ" }
// پاسخ 201
{ "code": "69168", "shareLink": "https://domain.com/s/69168", "expiresAt": 0, "createdAt": 0, "qr": "data:image/svg+xml;base64,..." }
```

### `GET /api/config/{code}`

```json
// پاسخ 200
{ "config": "...", "code": "69168", "createdAt": 0, "expiresAt": 0, "status": "active" }
```

- `404` → `کانفیگی پیدا نشد.`
- `410` → `این لینک منقضی شده است.`

### `DELETE /api/config/{code}`

حذف رکورد. پاسخ `200`: `{ "success": true }`.

## 🗄️ Database Schema

جدول `configs`:

| ستون        | نوع     | توضیح                              |
| ----------- | ------- | ---------------------------------- |
| `id`        | TEXT    | UUID، کلید اصلی                     |
| `code`      | TEXT    | کد ۵ رقمی، **ایندکس یکتا**          |
| `config`    | TEXT    | متن کانفیگ                          |
| `shareLink` | TEXT    | آدرس کامل لینک اشتراک               |
| `createdAt` | INTEGER | زمان ایجاد (میلی‌ثانیه)             |
| `expiresAt` | INTEGER | زمان انقضا (createdAt + ۲۴ ساعت)    |
| `status`    | TEXT    | `active` یا `expired`              |

## 🔐 Security

- **Rate limiting** بر اساس IP روی همهٔ مسیرهای API.
- **اعتبارسنجی ورودی** (کانفیگ خالی مجاز نیست، محدودیت اندازه، الگوی سخت‌گیرانهٔ کد ۵ رقمی).
- **جلوگیری از XSS** — کانفیگ به‌صورت متن و با auto-escape قالب Jinja2 رندر می‌شود.
- **جلوگیری از SQL Injection** — همهٔ کوئری‌ها پارامتری هستند.
- **ایندکس یکتا** روی `code` + تولید مجدد در صورت تکرار.
- هدرهای امنیتی (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).

## 🚢 استقرار روی سرور (systemd + Nginx)

```bash
# ۱) نصب پیش‌نیازها (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y python3 python3-venv python3-pip nginx git

# ۲) گرفتن کد و نصب
git clone https://github.com/MahdiTvK5/sender.git
cd sender
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# ۳) تنظیمات
cp .env.example .env
nano .env      # BASE_URL=https://your-domain.com و مسیر دیتابیس را تنظیم کنید
```

سرویس systemd در مسیر `/etc/systemd/system/config-share.service`:

```ini
[Unit]
Description=Config Share (FastAPI)
After=network.target

[Service]
User=www-data
WorkingDirectory=/home/USER/sender
Environment="PATH=/home/USER/sender/.venv/bin"
EnvironmentFile=/home/USER/sender/.env
ExecStart=/home/USER/sender/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

> مسیر `/home/USER/sender` و `User` را متناسب با سرور خود تنظیم کنید و مطمئن شوید کاربر به پوشهٔ `data/` دسترسی نوشتن دارد.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now config-share
sudo systemctl status config-share
```

Nginx به‌عنوان reverse proxy (`/etc/nginx/sites-available/config-share`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
cd sender && git pull && source .venv/bin/activate && pip install -r requirements.txt && sudo systemctl restart config-share
```

### گزینهٔ جایگزین: Docker

```bash
docker build -t config-share .
docker run -d -p 8000:8000 -v config_data:/app/data --name config-share config-share
```

## 📁 ساختار پروژه

```
app/
├── main.py            # FastAPI app: مسیرهای صفحه و API
├── config.py          # تنظیمات (از .env)
├── db.py              # اتصال و اسکیمای SQLite
├── store.py           # لایهٔ دسترسی به داده (ساخت/خواندن/حذف)
├── security.py        # rate limit، اعتبارسنجی، escape، QR
├── templates/         # base / index / share / state (Jinja2, RTL)
└── static/
    ├── css/styles.css # طراحی نئونی گلس‌مورفیسم + حالت روشن
    └── js/app.js      # تولید، کپی، شمارش معکوس، Toast، تم
requirements.txt
.env.example
Dockerfile
```
