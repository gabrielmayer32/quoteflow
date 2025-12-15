# Remote Quote MVP

A B2B SaaS platform for service businesses in Mauritius to handle remote quotations and pre-approvals efficiently.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudflare R2 account (optional, will fallback to local storage)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd remote-quote

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
docker-compose up -d
npx prisma migrate dev

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📱 Features

### For Service Businesses
- **Dashboard** - View stats and manage requests
- **Request Management** - Track and filter service requests
- **Quote Builder** - Create professional quotes with line items
- **PDF Generation** - Generate branded quote PDFs
- **Status Tracking** - Monitor quotes from submission to completion
- **Mobile App** - Fully responsive mobile experience

### For Clients
- **Easy Intake** - Submit requests with photos/videos (no login required)
- **Quote Review** - View detailed quote breakdowns
- **Quick Approval** - Approve or reject with one click
- **PDF Download** - Save quotes for records

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Storage**: Cloudflare R2 (S3-compatible)
- **PDF**: @react-pdf/renderer

## 📂 Project Structure

```
app/
├── (protected)/      # Authenticated routes
├── api/             # API endpoints
├── approve/         # Public quote approval
├── intake/          # Public intake form
├── login/
└── signup/
components/          # Reusable components
lib/                 # Utilities and configs
prisma/              # Database schema & migrations
```

## 🔐 Environment Variables

Required variables (see `.env.example`):

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_APP_URL=
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_ACCOUNT_ID=
R2_USE_SIGNED_URLS=
```

## 📖 Documentation

- **[PROGRESS.md](PROGRESS.md)** - Development timeline and tasks
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[R2_SETUP.md](R2_SETUP.md)** - Cloudflare R2 configuration
- **[MVP_COMPLETE.md](MVP_COMPLETE.md)** - Feature completion summary

## 🚢 Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/remote-quote)

Or follow the detailed [deployment guide](DEPLOYMENT.md).

## 📊 Status

**Build**: ✅ Passing
**Tests**: ✅ Manual testing complete
**Mobile**: ✅ Fully responsive
**Deployment**: 🎯 Ready for production

**Progress**: 35/37 tasks (95% complete)

## 🎯 Roadmap

### Completed ✅
- Authentication system
- Dashboard with analytics
- Client intake flow
- Request management
- Quote builder
- Quote approval flow
- PDF generation
- R2 file storage
- Mobile responsiveness

### Planned 📋
- Email notifications
- Payment integration
- Client portal
- Scheduling system
- Multi-user support
- Analytics dashboard

## 🤝 Contributing

This is a private MVP project. For questions or support, contact the project maintainer.

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for service businesses in Mauritius
