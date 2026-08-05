# Web3Forms Integration Setup Guide

## What is Web3Forms?

Web3Forms is a contact form backend service that sends form submissions directly to your email without requiring a backend server. It's perfect for static websites and JAMstack applications.

## Features

✅ **No backend required** - Form submissions go directly to your email  
✅ **Spam protection** - Built-in honeypot and reCAPTCHA support  
✅ **Free tier available** - 250 submissions/month on free plan  
✅ **Email notifications** - Instant email alerts for new submissions  
✅ **Custom redirects** - Redirect users after successful submission  
✅ **File uploads** - Support for file attachments (paid plans)

---

## Setup Instructions

### Step 1: Get Your Web3Forms Access Key

1. Go to **https://web3forms.com**
2. Click **"Get Started Free"**
3. Sign up with your email (or use GitHub/Google login)
4. After login, you'll see your **Access Key** on the dashboard
5. Copy the access key (looks like: `a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6`)

### Step 2: Configure Your Email

1. In the Web3Forms dashboard, set the **"To Email"** to where you want to receive appointment requests
   - Example: `drjpnautiyal@gmail.com` or `clinic@nautiyal.com`
2. Optionally configure:
   - **From Name**: "Dr. Nautiyal Clinic Website"
   - **Subject Line**: Can be customized in code (already set)
   - **Reply-To**: Patient's email/phone (already configured)

### Step 3: Add Access Key to Your Project

1. Open `.env` file in the root of your project
2. Replace `YOUR_WEB3FORMS_ACCESS_KEY_HERE` with your actual access key:

```env
VITE_WEB3FORMS_ACCESS_KEY=a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6
```

3. **IMPORTANT:** Never commit the `.env` file with your real access key to GitHub!

### Step 4: Add `.env` to `.gitignore`

Make sure `.env` is listed in your `.gitignore` file:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

### Step 5: Configure for Production (Netlify)

When deploying to Netlify:

1. Go to your Netlify site dashboard
2. Navigate to **Site Settings** → **Environment Variables**
3. Add a new variable:
   - **Key:** `VITE_WEB3FORMS_ACCESS_KEY`
   - **Value:** Your Web3Forms access key
4. Click **Save**
5. Redeploy your site

---

## Testing the Form

### Local Testing:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the contact section
3. Fill out and submit the appointment form
4. Check your configured email for the submission

### What You'll Receive:

Email subject: **"New Appointment Request from [Patient Name]"**

Email body includes:
- Patient Name
- Phone Number
- Preferred Date
- Treatment Category
- Consultation Mode (In-Clinic / Online WhatsApp)
- Additional Notes/Symptoms

---

## Web3Forms API Response

The form expects this response format:

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

On error:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Customization Options

### Email Template

You can customize the email template in the ContactSection.jsx `onSubmit` function:

```javascript
const formData = {
  access_key: WEB3FORMS_ACCESS_KEY,
  name: data.fullName,
  phone: data.phone,
  date: data.preferredDate,
  category: data.category,
  mode: data.mode === 'in-clinic' ? 'In-Clinic (Dehradun)' : 'Online WhatsApp',
  message: data.notes || 'No additional notes provided',
  subject: `New Appointment Request from ${data.fullName}`,
  from_name: 'Dr. Nautiyal Clinic Website',
  // Add more custom fields here
};
```

### Add Spam Protection

To add reCAPTCHA or honeypot:

1. In Web3Forms dashboard, enable **reCAPTCHA**
2. Get your reCAPTCHA site key
3. Add to form:

```javascript
const formData = {
  ...formData,
  'g-recaptcha-response': recaptchaToken, // Add reCAPTCHA token
  botcheck: '' // Honeypot field (leave empty)
};
```

---

## Pricing

### Free Tier:
- **250 submissions/month**
- Email notifications
- Spam protection
- Good for small clinics

### Pro Plan ($4.99/month):
- **10,000 submissions/month**
- File uploads
- Custom webhooks
- Priority support

### Enterprise:
- Unlimited submissions
- Custom features
- Contact Web3Forms for pricing

---

## Troubleshooting

### Form submission fails with "Access key is required"
- Check that `.env` file exists with `VITE_WEB3FORMS_ACCESS_KEY`
- Restart dev server after adding environment variable
- For production, verify Netlify environment variable is set

### Not receiving emails
- Check spam/junk folder
- Verify email address in Web3Forms dashboard
- Check Web3Forms dashboard for submission logs

### CORS errors
- Web3Forms should handle CORS automatically
- If issues persist, contact Web3Forms support

---

## Alternative: Custom Backend (If Needed)

If you prefer to use your own backend instead of Web3Forms:

1. Create an endpoint in your server: `POST /api/appointments`
2. Update `onSubmit` to call your API:

```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

3. Handle email sending in your backend using Nodemailer/SendGrid

---

## Support

- **Web3Forms Docs:** https://docs.web3forms.com
- **Web3Forms Support:** support@web3forms.com
- **Dashboard:** https://web3forms.com/dashboard

---

## Security Notes

1. **Never expose your access key in frontend code** - Always use environment variables
2. **Add rate limiting** - Web3Forms has built-in rate limiting, but consider adding client-side debouncing
3. **Validate on server side** - While Web3Forms validates, always sanitize data
4. **Use HTTPS** - Always deploy on HTTPS (Netlify provides this automatically)

---

## Completed ✅

Once you've completed setup:
- [ ] Created Web3Forms account
- [ ] Copied access key
- [ ] Added key to `.env` file
- [ ] Tested form locally
- [ ] Added environment variable to Netlify
- [ ] Deployed and tested in production
- [ ] Verified email delivery

Your contact form is now live and will send appointment requests directly to your email!
