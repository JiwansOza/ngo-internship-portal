# NGO Reach Platform

A comprehensive internship management platform that connects NGOs with interns through a modern web application built with React, TypeScript, and Supabase.

## 🌟 Features

### 🔐 Authentication & User Management
- Secure user registration and login
- Protected routes for authenticated users
- User profile management
- Role-based access control

### 📋 Application Management
- Multi-step internship application form
- Application status tracking
- PDF download functionality for applications
- Resume upload and management

### 💰 Fundraising System
- Progress tracking for fundraising goals
- Leaderboard with real-time rankings
- Milestone rewards and badges
- Progress update functionality

### 🔗 Affiliate Payment Links
- Personalized payment links for each user
- Public donation pages
- Payment tracking and statistics
- Shareable donation links

### 📊 Admin Dashboard
- Comprehensive fundraising data overview
- Export functionality for data analysis
- User management and monitoring
- Real-time statistics

### 🏆 Certificate System
- Automatic certificate generation
- PDF download for completion certificates
- Eligibility tracking based on progress

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Query, React Context
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **PDF Generation**: jsPDF, html2canvas

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JiwansOza/ngo-internship-portal.git
   cd ngo-internship-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Run the SQL scripts in `supabase/migrations/`
   - Or use the complete setup script: `complete-database-setup.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
ngo-internship-portal/
├── public/                 # Static assets
│   ├── favicon.svg        # Platform favicon
│   └── icon-512.svg       # App icon
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # External service integrations
│   │   └── supabase/     # Supabase client and types
│   ├── lib/              # Utility functions
│   ├── pages/            # Application pages
│   └── main.tsx          # Application entry point
├── supabase/             # Database migrations
└── scripts/              # Utility scripts
```

## 🗄️ Database Schema

### Core Tables
- `profiles` - User profile information
- `applications` - Internship applications
- `onboarding_tasks` - User onboarding checklist
- `fundraising_progress` - Fundraising tracking
- `certificates` - Certificate eligibility
- `affiliate_links` - Payment links
- `donations` - Donation records

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Enable Row Level Security (RLS)
3. Run the migration scripts
4. Configure authentication settings
5. Set up storage buckets for resumes

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📱 Features in Detail

### Application System
- Multi-step form with progress indicators
- File upload for resumes
- Real-time validation
- Status tracking and updates

### Fundraising Platform
- Goal setting and progress tracking
- Leaderboard with rankings
- Milestone achievements
- Progress visualization

### Affiliate Links
- Unique payment links per user
- Customizable campaign details
- Public donation pages
- Payment tracking and analytics

### Admin Features
- Comprehensive data overview
- Export functionality
- User management
- Real-time monitoring

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables

### Manual Deployment
```bash
npm run build
# Serve the dist folder
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `/docs` folder
- Review the SQL setup scripts

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Payment gateway integration
- [ ] Email notification system
- [ ] Multi-language support
- [ ] Advanced reporting features

---

**Built with ❤️ for the NGO community**
