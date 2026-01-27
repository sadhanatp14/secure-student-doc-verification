# 🚀 Deployment Guide - Crypt-o-Course

Complete guide to deploy your full-stack application to production.

---

## 📋 Deployment Overview

Your application has 3 components that need deployment:
1. **MongoDB Database** → MongoDB Atlas (Cloud)
2. **Backend (Node.js/Express)** → Render.com (Free tier)
3. **Frontend (Next.js)** → Vercel (Free tier)

**Important:** Your current MongoDB URI `mongodb://localhost:27017` only works on your local machine. For deployment, you need a cloud database.

---

## ☁️ STEP 1: MongoDB Atlas Setup (Cloud Database)

### **1.1 Create MongoDB Atlas Account**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free (no credit card required)
3. Create a new cluster (M0 Free tier)

### **1.2 Create Database User**
1. In Atlas dashboard → **Database Access** → Add Database User
2. Username: `admin_user` (or any name)
3. Password: Generate a secure password (save it!)
4. Database User Privileges: **Atlas Admin** or **Read and Write to any database**

### **1.3 Whitelist IP Addresses**
1. **Network Access** → Add IP Address
2. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is required for deployment platforms
   - More secure: Add specific IPs later

### **1.4 Get Connection String**
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string:
   ```
   mongodb+srv://admin_user:<password>@cluster0.xxxxx.mongodb.net/student-doc-verification?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual database password
5. Replace `student-doc-verification` with your database name (optional)

**Example:**
```
mongodb+srv://admin_user:MySecurePass123@cluster0.abc123.mongodb.net/crypt-o-course?retryWrites=true&w=majority
```

### **1.5 Create Admin User in Database**
1. In Atlas dashboard → **Browse Collections**
2. Select your database → `users` collection
3. Click **"Insert Document"**
4. Add this JSON (replace password hash):
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
  "role": "admin",
  "isVerified": true,
  "createdAt": {"$date": "2026-01-28T00:00:00.000Z"}
}
```

**Generate password hash:**
```javascript
// Run this in your local backend (or use bcrypt online tool)
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash); // Use this in MongoDB
```

---

## 🖥️ STEP 2: Backend Deployment (Render.com)

### **2.1 Prepare Backend for Deployment**

**Update package.json** (if not already present):
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Check server.js** has proper port handling:
```javascript
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### **2.2 Create GitHub Repository** (if not done)
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/crypt-o-course-backend.git
git push -u origin main
```

### **2.3 Deploy to Render.com**

1. Go to https://render.com and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your backend repository

**Configuration:**
- **Name:** `crypt-o-course-backend`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** Leave blank (or `backend` if you pushed the entire project)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

### **2.4 Add Environment Variables**

In Render dashboard → **Environment** → Add these:

```bash
MONGO_URI=mongodb+srv://admin_user:YourPassword@cluster0.xxxxx.mongodb.net/crypt-o-course?retryWrites=true&w=majority

PORT=5001

JWT_SECRET=production-jwt-secret-min-32-chars-change-this-to-random-string

AES_SECRET=production-aes-secret-32chars-random-string-here-change

INVITE_SECRET=production-invite-secret-change-this-to-random

EMAIL_USER=sadhana.aquaris@gmail.com

EMAIL_PASSWORD=cineilmcccwsvqms

NODE_ENV=production
```

**⚠️ IMPORTANT:** Generate new secrets for production! Don't use development secrets.

**Generate random secrets:**
```bash
# Run in terminal to generate random strings:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **2.5 Deploy**
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build
3. Your backend will be live at: `https://crypt-o-course-backend.onrender.com`

### **2.6 Test Backend API**
```bash
# Test health endpoint
curl https://crypt-o-course-backend.onrender.com/api/auth/login

# Should return: "No token provided" or similar (means server is running)
```

---

## 🌐 STEP 3: Frontend Deployment (Vercel)

### **3.1 Update API Base URL**

Create/update `frontend/secure-course-ui/.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://crypt-o-course-backend.onrender.com/api
```

**Update lib/api.ts** (should already be correct):
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
```

### **3.2 Create GitHub Repository**
```bash
cd frontend/secure-course-ui
git init
git add .
git commit -m "Initial frontend commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/crypt-o-course-frontend.git
git push -u origin main
```

### **3.3 Deploy to Vercel**

1. Go to https://vercel.com and sign up (free)
2. Click **"Add New..."** → **"Project"**
3. Import your frontend GitHub repository
4. Vercel auto-detects Next.js

**Configuration:**
- **Framework Preset:** Next.js
- **Root Directory:** `./` (or `frontend/secure-course-ui` if you pushed entire project)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### **3.4 Add Environment Variables**

In Vercel dashboard → **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_API_URL=https://crypt-o-course-backend.onrender.com/api
```

### **3.5 Deploy**
1. Click **"Deploy"**
2. Wait 2-5 minutes for build
3. Your frontend will be live at: `https://crypt-o-course-frontend.vercel.app`

---

## 🔧 STEP 4: Configure CORS (Backend)

Your backend needs to allow requests from your Vercel frontend.

**Update backend/src/server.js:**
```javascript
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", 
  "https://crypt-o-course-frontend.vercel.app",
  "https://your-custom-domain.com" // If you add custom domain
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

**Commit and push changes:**
```bash
git add .
git commit -m "Add production CORS config"
git push origin main
```

Render will auto-redeploy with new changes.

---

## ✅ STEP 5: Verify Deployment

### **5.1 Test Full Flow**

1. Visit your Vercel URL: `https://crypt-o-course-frontend.vercel.app`
2. Try to login with admin credentials
3. Check if OTP is sent
4. Verify OTP and complete login
5. Navigate through dashboards

### **5.2 Check Database in MongoDB Atlas**

1. Go to MongoDB Atlas → **Browse Collections**
2. Select your database → View collections
3. Check `users` collection for admin user
4. After testing login, check:
   - `otps` collection (should be empty after successful login)
   - `loginattempts` collection (tracks login attempts)
5. After creating courses, check `courses` collection
6. After enrollment, check `enrollments` collection

### **5.3 Monitor Logs**

**Backend Logs (Render):**
- Render Dashboard → Your service → **Logs** tab
- Watch for errors, requests, MongoDB connections

**Frontend Logs (Vercel):**
- Vercel Dashboard → Your project → **Functions** tab
- Check for runtime errors

---

## 📊 STEP 6: Verify Data Flow

### **6.1 Test Database Writes**

**Scenario 1: User Registration**
1. Admin generates invite token
2. New user registers
3. Check MongoDB Atlas → `users` collection
4. New user document should appear

**Scenario 2: Course Creation**
1. Faculty creates course
2. Check MongoDB Atlas → `courses` collection
3. Verify encrypted data is stored:
   ```json
   {
     "courseCode": "CS101",
     "courseName": "Intro to CS",
     "encryptedDescription": "a1b2c3:ciphertext",
     "digitalSignature": "base64signature"
   }
   ```

**Scenario 3: Enrollment Flow**
1. Student enrolls in course
2. Check MongoDB Atlas → `enrollments` collection
3. Verify enrollment document with status "pending"
4. Faculty approves enrollment
5. Refresh collection → status changes to "approved"

### **6.2 Test Email Delivery**

1. Try login → OTP should be sent to email
2. Check spam folder if not received
3. Monitor backend logs in Render for email errors

**If emails fail:**
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` in Render env variables
- Check Gmail settings (2FA enabled, app password correct)
- Review backend logs for Nodemailer errors

---

## 🔒 Security Checklist for Production

### **✅ Before Going Live:**

- [ ] Change all default secrets (JWT_SECRET, AES_SECRET, INVITE_SECRET)
- [ ] Use strong, random 32+ character strings for secrets
- [ ] Never commit `.env` file to GitHub
- [ ] Enable HTTPS (Vercel/Render provide this automatically)
- [ ] Review MongoDB Atlas network access (consider IP whitelisting)
- [ ] Create separate MongoDB users for different environments
- [ ] Enable MongoDB Atlas backup (if not free tier)
- [ ] Test password reset flow (if implemented)
- [ ] Verify OTP expiry works correctly
- [ ] Test account lockout after failed attempts
- [ ] Check all API endpoints require authentication
- [ ] Verify role-based access control works
- [ ] Test CORS configuration with your frontend domain

---

## 🐛 Troubleshooting

### **Problem: "Cannot connect to MongoDB"**
**Solution:**
- Check MongoDB Atlas → Network Access → Allow 0.0.0.0/0
- Verify connection string has correct password
- Check database user has correct permissions

### **Problem: "CORS error on login"**
**Solution:**
- Add your Vercel URL to `allowedOrigins` in backend
- Redeploy backend after changes
- Clear browser cache

### **Problem: "502 Bad Gateway on backend"**
**Solution:**
- Check Render logs for errors
- Verify `PORT` environment variable is set
- Check MongoDB connection string is correct
- Ensure backend is listening on `process.env.PORT`

### **Problem: "OTP emails not sending"**
**Solution:**
- Verify Gmail credentials in Render environment variables
- Check Gmail "Less secure app access" is OFF (use app passwords)
- Review backend logs for Nodemailer errors
- Test email locally first

### **Problem: "JWT token invalid after deployment"**
**Solution:**
- Verify `JWT_SECRET` is same in backend env variables
- Don't use different secrets between builds
- Clear localStorage in browser
- Re-login to get new token

### **Problem: "Frontend shows 'Network Error'"**
**Solution:**
- Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Verify backend URL is correct and accessible
- Check browser console for CORS errors
- Redeploy frontend after env variable changes

---

## 📝 Post-Deployment Checklist

### **✅ After Successful Deployment:**

- [ ] Update README.md with production URLs
- [ ] Document deployment process for team
- [ ] Set up monitoring (optional: Sentry, LogRocket)
- [ ] Create admin user in production database
- [ ] Test all user roles (student, faculty, admin)
- [ ] Verify email delivery in production
- [ ] Test course creation and encryption
- [ ] Test enrollment workflow end-to-end
- [ ] Share demo credentials with instructor (if needed)
- [ ] Add custom domain (optional)
- [ ] Set up CI/CD for auto-deployment (optional)

---

## 🌍 Your Production URLs

After deployment, your URLs will be:

```
Frontend: https://crypt-o-course-frontend.vercel.app
Backend:  https://crypt-o-course-backend.onrender.com
Database: cluster0.xxxxx.mongodb.net (via MongoDB Atlas)
```

**Update these in your project documentation!**

---

## 💡 Tips for Free Tier Limits

### **Render.com (Backend):**
- Free tier sleeps after 15 min of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free (enough for one service)
- Consider paid tier ($7/mo) for always-on service

### **Vercel (Frontend):**
- 100 GB bandwidth/month
- Unlimited personal projects
- Automatic HTTPS
- Edge network for fast loading

### **MongoDB Atlas (Database):**
- 512 MB storage on free tier
- Enough for hundreds of users and courses
- Automatic backups available on paid tiers
- Consider paid tier ($9/mo) for more storage

---

## 🎓 Demo Credentials (For Instructor)

After deployment, create these test accounts:

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`
- Role: Full system access

**Faculty:**
- Email: `faculty@example.com`
- Password: `faculty123`
- Role: Create courses, approve enrollments

**Student:**
- Email: `student@example.com`
- Password: `student123`
- Role: Enroll in courses

---

## 🔄 Updating Your Deployed Application

### **Backend Updates:**
```bash
cd backend
# Make your changes
git add .
git commit -m "Update feature X"
git push origin main
# Render auto-deploys on push
```

### **Frontend Updates:**
```bash
cd frontend/secure-course-ui
# Make your changes
git add .
git commit -m "Update UI"
git push origin main
# Vercel auto-deploys on push
```

### **Database Updates:**
Use MongoDB Atlas web interface or MongoDB Compass to:
- Add/update documents manually
- Create indexes for performance
- Monitor database metrics

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

## ✅ Summary

**To deploy your project:**

1. **MongoDB Atlas** - Cloud database (replaces localhost)
2. **Render.com** - Deploy backend (Node.js/Express)
3. **Vercel** - Deploy frontend (Next.js)
4. **Configure CORS** - Allow frontend to call backend
5. **Test everything** - Login, create courses, enrollments
6. **Monitor MongoDB Atlas** - Verify data is being stored

**No need to upload:**
- ❌ `node_modules` (installed automatically)
- ❌ `.env` file (set environment variables on platform)
- ❌ `.next` build folder (generated during deployment)

**Required in repository:**
- ✅ Source code (`.js`, `.ts`, `.tsx` files)
- ✅ `package.json` (dependencies list)
- ✅ `.gitignore` (to exclude sensitive files)

---

**Happy Deploying! 🚀**

*Last Updated: 28 January 2026*
