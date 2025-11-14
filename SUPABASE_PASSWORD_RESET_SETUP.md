# Supabase Password Reset Setup Guide

## Overview

The password reset feature is now fully implemented in the frontend. To make it work, you need to configure a few things in your Supabase project.

## Required Supabase Configuration

### 1. Email Templates Configuration

Go to your Supabase Dashboard → Authentication → Email Templates

#### Configure "Reset Password" Template

1. Navigate to the "Reset Password" email template
2. Update the confirmation URL to point to your application:

**For Development:**

```
{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
```

**For Production:**

```
https://yourdomain.com/reset-password?token={{ .Token }}&type=recovery
```

3. Customize the email content (optional):

```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

### 2. URL Configuration

Go to Supabase Dashboard → Authentication → URL Configuration

#### Site URL

Set your application's base URL:

- **Development:** `http://localhost:5173`
- **Production:** `https://yourdomain.com`

#### Redirect URLs

Add these URLs to the allowed redirect URLs list:

- **Development:**
  - `http://localhost:5173/reset-password`
  - `http://localhost:5173/dashboard`
- **Production:**
  - `https://yourdomain.com/reset-password`
  - `https://yourdomain.com/dashboard`

### 3. Email Settings (Optional but Recommended)

Go to Supabase Dashboard → Project Settings → Auth

#### Enable Email Confirmations

- Ensure "Enable email confirmations" is checked
- This prevents unauthorized password resets

#### Rate Limiting

- Configure rate limits to prevent abuse
- Recommended: 5 password reset requests per hour per email

### 4. SMTP Configuration (For Production)

For production, configure custom SMTP to avoid Supabase's rate limits:

1. Go to Project Settings → Auth → SMTP Settings
2. Enable custom SMTP
3. Configure your email provider (e.g., SendGrid, AWS SES, Mailgun):
   - SMTP Host
   - SMTP Port
   - SMTP Username
   - SMTP Password
   - Sender Email
   - Sender Name

## How It Works

### User Flow:

1. **Forgot Password Page** (`/forgot-password`)

   - User enters their email
   - Clicks "Send Reset Link"
   - Supabase sends email with reset link

2. **Email**

   - User receives email with reset link
   - Link format: `https://yourdomain.com/reset-password?token=xxx&type=recovery`

3. **Reset Password Page** (`/reset-password`)
   - User clicks link from email
   - Supabase automatically authenticates them with the token
   - User enters new password
   - Password is updated
   - User is redirected to dashboard

### Security Features:

- Reset tokens expire after 1 hour (Supabase default)
- Tokens are single-use only
- Password must meet strength requirements:
  - Minimum 6 characters (enforced by Supabase)
  - Frontend validates for 8+ characters with uppercase, lowercase, number, and symbol
- Rate limiting prevents abuse

## Testing the Feature

### Local Testing:

1. Start your development server
2. Go to `http://localhost:5173/forgot-password`
3. Enter a test email address
4. Check your email inbox
5. Click the reset link
6. Enter a new password
7. Verify you're redirected to dashboard

### Important Notes:

- In development, Supabase uses their email service (limited to 3 emails per hour)
- For production, set up custom SMTP for unlimited emails
- Test with a real email address you have access to
- Check spam folder if email doesn't arrive

## Troubleshooting

### Email Not Received

- Check Supabase logs: Dashboard → Logs → Auth Logs
- Verify email address is correct
- Check spam/junk folder
- Ensure SMTP is configured (production)
- Check rate limits haven't been exceeded

### Reset Link Not Working

- Verify redirect URLs are configured correctly
- Check that token hasn't expired (1 hour limit)
- Ensure Site URL matches your application URL
- Check browser console for errors

### Password Update Fails

- Verify password meets requirements
- Check Supabase logs for errors
- Ensure user session is valid from reset link

## Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Additional Security Recommendations

1. **Enable MFA** for admin accounts
2. **Monitor auth logs** regularly for suspicious activity
3. **Set up email notifications** for password changes
4. **Implement account lockout** after multiple failed attempts
5. **Use strong password policies** in Supabase settings

## Next Steps

After configuring Supabase:

1. Test the complete flow in development
2. Update email templates with your branding
3. Configure custom SMTP for production
4. Add password reset to your user documentation
5. Monitor usage and adjust rate limits as needed
