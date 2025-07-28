# 🔗 Affiliate Payment Links System

## Overview

The affiliate payment links system allows users to create and share personalized payment links for their fundraising campaigns. This enables easy donation collection from friends, family, and supporters.

## 🚀 Features

### For Fundraisers (Users)
- ✅ **Personalized Payment Links**: Each user gets a unique affiliate link
- ✅ **Customizable Campaigns**: Edit title, description, and target amount
- ✅ **Real-time Progress Tracking**: See donations and progress updates
- ✅ **Easy Sharing**: Copy link or use native share functionality
- ✅ **Donation Statistics**: View total donations, amounts, and averages

### For Donors (Public)
- ✅ **Beautiful Donation Pages**: Professional, mobile-friendly donation forms
- ✅ **Multiple Payment Options**: UPI integration for Indian payments
- ✅ **Preset Amounts**: Quick selection of common donation amounts
- ✅ **Custom Messages**: Leave personal messages with donations
- ✅ **Progress Visualization**: See campaign progress and impact

## 📊 Database Schema

### Affiliate Links Table
```sql
CREATE TABLE public.affiliate_links (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  link_code VARCHAR(20) UNIQUE,        -- e.g., "ABC12345"
  title VARCHAR(255),                   -- Campaign title
  description TEXT,                     -- Campaign description
  target_amount DECIMAL(10,2),         -- Fundraising goal
  is_active BOOLEAN DEFAULT true,      -- Link status
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Donations Table
```sql
CREATE TABLE public.donations (
  id UUID PRIMARY KEY,
  affiliate_link_id UUID REFERENCES affiliate_links(id),
  donor_name VARCHAR(255),              -- Donor's name
  donor_email VARCHAR(255),             -- Donor's email
  amount DECIMAL(10,2),                -- Donation amount
  message TEXT,                        -- Optional message
  payment_status VARCHAR(50),           -- pending/completed/failed
  payment_method VARCHAR(50),           -- UPI/Card/etc
  transaction_id VARCHAR(255),          -- Payment reference
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🔄 Workflow

### 1. User Registration
- ✅ Automatic affiliate link creation on signup
- ✅ Unique 8-character link code generation
- ✅ Default campaign settings

### 2. Link Management
- ✅ Access via `/affiliate` route
- ✅ Edit campaign details (title, description, target)
- ✅ Copy/share functionality
- ✅ Real-time progress tracking

### 3. Donation Process
- ✅ Public access via `/donate/:linkCode`
- ✅ Beautiful donation form
- ✅ Amount selection (preset + custom)
- ✅ Donor information collection
- ✅ Payment processing (UPI integration)

### 4. Progress Updates
- ✅ Automatic fundraising progress updates
- ✅ Real-time donation tracking
- ✅ Statistics and analytics

## 🛠️ Technical Implementation

### Frontend Routes
```typescript
// User management page
/affiliate                    // Manage affiliate link

// Public donation page
/donate/:linkCode            // Public donation form
```

### Key Functions
```typescript
// Get user's affiliate link
getUserAffiliateLink(userId: string)

// Get affiliate link by code (public)
getAffiliateLinkByCode(linkCode: string)

// Create donation
createDonation(affiliateLinkId: string, donationData)

// Update affiliate link
updateAffiliateLink(linkId: string, updates)

// Generate shareable URL
generateShareableUrl(linkCode: string)
```

### Security Features
- ✅ **Row Level Security (RLS)**: Users can only access their own links
- ✅ **Public Access**: Donation pages are publicly accessible
- ✅ **Input Validation**: Form validation and sanitization
- ✅ **Rate Limiting**: Protection against spam

## 📱 User Experience

### Fundraiser Dashboard
1. **Access**: Click "My Link" in dashboard header
2. **Customize**: Edit campaign title, description, target
3. **Share**: Copy link or use native share
4. **Track**: View real-time progress and statistics

### Donor Experience
1. **Visit**: Click shared affiliate link
2. **Learn**: Read campaign details and progress
3. **Donate**: Select amount and fill form
4. **Pay**: Complete UPI payment
5. **Confirm**: Receive confirmation

## 🎯 Example URLs

### Fundraiser Management
```
https://yourdomain.com/affiliate
```

### Public Donation Pages
```
https://yourdomain.com/donate/ABC12345
https://yourdomain.com/donate/XYZ78901
```

## 📈 Analytics & Reporting

### Available Metrics
- ✅ Total donations received
- ✅ Total amount raised
- ✅ Average donation amount
- ✅ Campaign completion rate
- ✅ Donor engagement

### Export Capabilities
- ✅ CSV export of donation data
- ✅ Campaign performance reports
- ✅ Donor analytics

## 🔧 Configuration

### Default Settings
- **Link Code Length**: 8 characters
- **Default Target**: ₹5,000
- **Payment Method**: UPI
- **Currency**: Indian Rupees (₹)

### Customization Options
- ✅ Campaign title and description
- ✅ Target amount adjustment
- ✅ Payment method selection
- ✅ Currency support

## 🚀 Future Enhancements

### Planned Features
- 🔄 **Multiple Payment Gateways**: Razorpay, Stripe integration
- 🔄 **Social Media Integration**: Direct sharing to platforms
- 🔄 **Email Notifications**: Donation alerts and updates
- 🔄 **QR Code Generation**: Easy mobile sharing
- 🔄 **Campaign Analytics**: Detailed performance insights
- 🔄 **Donor Management**: Donor database and communication

### Advanced Features
- 🔄 **Recurring Donations**: Monthly/yearly subscriptions
- 🔄 **Team Fundraising**: Group campaigns
- 🔄 **Matching Gifts**: Corporate donation matching
- 🔄 **Tax Receipts**: Automated tax documentation
- 🔄 **International Payments**: Multi-currency support

## 🛡️ Security Considerations

### Data Protection
- ✅ **Encrypted Storage**: Sensitive data encryption
- ✅ **Secure Transmission**: HTTPS for all communications
- ✅ **Access Control**: Role-based permissions
- ✅ **Audit Logging**: Track all donation activities

### Compliance
- ✅ **GDPR Compliance**: Data privacy protection
- ✅ **PCI DSS**: Payment card security standards
- ✅ **Local Regulations**: Indian payment regulations

## 📞 Support

For technical support or feature requests:
- 📧 Email: support@yourdomain.com
- 📱 Phone: +91-XXXXXXXXXX
- 💬 Chat: Available on website

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready 