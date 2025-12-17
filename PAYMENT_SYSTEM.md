# Payment System Documentation

This document explains how the payment status system works in QuoteFlow.

## Overview

The payment system ensures that only users who have completed payment can access the application. Users who sign up but haven't paid are redirected to a payment pending page with bank transfer instructions.

## Features

- **Payment Status Tracking**: Each business has a `paymentStatus` field (PAID or UNPAID)
- **Access Control**: Unpaid users are blocked from accessing the app via middleware
- **Payment Pending Page**: Shows bank transfer instructions to unpaid users
- **Admin Toggle**: Easy database toggle to mark users as paid/unpaid
- **Future-Ready**: System designed to integrate payment gateways in the future

## How It Works

### 1. New User Signup
- When a user signs up, their `paymentStatus` is automatically set to `UNPAID`
- They can verify their email and log in
- Upon login, they are redirected to `/payment-pending`

### 2. Payment Pending Page (`/payment-pending`)
- Shows bank transfer instructions
- Displays the business email as payment reference
- Users cannot access the rest of the app until marked as paid
- Provides a logout button

### 3. Admin Payment Management (`/admin`)
- Lists all businesses with their payment status
- Shows email verification status
- One-click toggle to mark businesses as PAID/UNPAID
- Color-coded status badges for easy identification

### 4. Middleware Protection
- Checks payment status on every protected route
- Redirects unpaid users to `/payment-pending`
- Redirects paid users away from `/payment-pending` to `/dashboard`
- Public routes (login, signup, intake, approve) are not affected

## Admin Usage

### View All Businesses
Navigate to `/admin` to see all businesses and their payment statuses.

### Mark User as Paid
1. Go to `/admin`
2. Find the business in the list
3. Click "Mark Paid" button
4. User will be able to access the app on their next page navigation

### Mark User as Unpaid
1. Go to `/admin`
2. Find the business in the list
3. Click "Mark Unpaid" button
4. User will be redirected to `/payment-pending` on their next navigation

## API Endpoints

### GET `/api/admin/payment-status`
Returns a list of all businesses with their payment status.

**Response:**
```json
{
  "success": true,
  "businesses": [
    {
      "id": "clx123...",
      "email": "business@example.com",
      "name": "Example Business",
      "phone": "+1234567890",
      "paymentStatus": "UNPAID",
      "emailVerified": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### PATCH `/api/admin/payment-status`
Updates the payment status of a business.

**Request:**
```json
{
  "businessId": "clx123...",
  "paymentStatus": "PAID"
}
```

**Response:**
```json
{
  "success": true,
  "business": {
    "id": "clx123...",
    "email": "business@example.com",
    "name": "Example Business",
    "paymentStatus": "PAID"
  }
}
```

## Database Schema

### Business Model
```prisma
model Business {
  // ... other fields
  paymentStatus PaymentStatus @default(UNPAID)
  // ... other fields
}

enum PaymentStatus {
  UNPAID
  PAID
}
```

## Future Enhancements

The system is designed to easily integrate payment gateways in the future:

1. **Stripe Integration**: Add Stripe checkout for automated payments
2. **PayPal Integration**: Support PayPal as an alternative payment method
3. **Subscription Model**: Convert to recurring subscriptions
4. **Payment History**: Track payment transactions and history
5. **Invoicing**: Automatically generate invoices for payments
6. **Webhooks**: Automatically update payment status when payments are received

## Customization

### Update Bank Transfer Details
Edit the payment instructions in [app/payment-pending/page.tsx](app/payment-pending/page.tsx):

```tsx
<p><strong>Account Name:</strong> Your Company Name</p>
<p><strong>Account Number:</strong> 123456789</p>
<p><strong>Bank:</strong> Example Bank</p>
```

### Change Default Payment Status
To make new users start as PAID (for testing), update the schema:

```prisma
paymentStatus PaymentStatus @default(PAID)
```

Then run:
```bash
npx prisma migrate dev --name change_default_payment
```

## Security Notes

- The `/admin` route is currently unprotected. You should add authentication to restrict access to admins only.
- Consider adding role-based access control (RBAC) to distinguish between regular users and admins.
- Payment reference validation should be implemented when processing bank transfers.
