# 🧪 TESTING GUIDE - Vantage Impact Auth Implementation

## 🎬 START THE SERVERS

### Terminal 1 - Backend (Port 5000)

```bash
cd vantage-backend
npm run dev
# Output: ✓ Server running on port 5000
```

### Terminal 2 - Frontend (Port 5174)

```bash
cd Frontend
npm run dev
# Output: VITE v8.0.1  ready in XXXms
#         ➜  Local: http://localhost:5174/
```

---

## 🧪 TEST SCENARIOS

### Test 1: Register New Account ✅

**Path**: Home → Join Now → Complete Subscribe Flow

1. Open `http://localhost:5174/`
2. Click **"JOIN NOW"** button (white button top-right)
3. Step 1: Select plan "Architect" (£89/month)
4. Step 2: Select charity "Clean Water Initiative" (10%)
5. Step 3: Enter account details:
   ```
   Name: John Doe
   Email: john@example.com
   Password: password123
   Confirm Password: password123
   ```
6. Click **"CREATE ACCOUNT & SUBSCRIBE"**
7. ✅ Should see success message: "Welcome to Vantage Impact!"
8. ✅ Can see user is now logged in (navbar shows name instead of "SIGN IN")
9. ✅ Redirect to dashboard

---

### Test 2: Login with Existing Account ✅

**Path**: Homepage → Sign In

1. Click **"SIGN IN"** button in navbar (cyan button)
2. Login modal opens
3. Enter credentials:
   ```
   Email: john@example.com
   Password: password123
   ```
4. Click **"SIGN IN"**
5. ✅ Modal closes
6. ✅ Dashboard loads with your data
7. ✅ Navbar shows "John Doe" instead of "SIGN IN"

---

### Test 3: Dashboard - Add Scores ✅

**Path**: Dashboard → Edit Scores

1. After login, look at left panel "Your Scores"
2. Click **"EDIT SCORES"** button (cyan)
3. ScoreModal opens
4. Click **"+ Add Score"** button
5. Enter:
   ```
   Score: 38
   Date: 2026-03-18 (today)
   ```
6. Click **"SAVE SCORES"**
7. ✅ Modal closes
8. ✅ Scores displayed in chart on dashboard
9. ✅ Shows average, best, rounds count
10. ❌ Refresh page → data still there (backend persistence)

---

### Test 4: Dashboard - Update Charity ✅

**Path**: Dashboard → Charity Widget

1. On dashboard, look at "Your Charity" widget
2. See charity name "Clean Water Initiative"
3. Try to move charity contribution slider (10% → 25%)
4. ✅ Shows new contribution amount
5. ✅ API call made to backend

---

### Test 5: Logout & Session Persistence ✅

**Path**: Dashboard → Toolbar

1. Click **"LOGOUT"** button (red, top-right navbar)
2. ✅ Returns to home page
3. ✅ Navbar now shows "SIGN IN" button again
4. Try to view dashboard:
   - Click navbar logo → goes to home
   - Can't access `/dashboard` directly
5. **Re-login**:
   - Click "SIGN IN"
   - Enter credentials again
   - ✅ Dashboard loads with same scores you entered earlier
   - ✅ Data persists in database!

---

### Test 6: Form Validation ✅

**Path**: Various forms

#### Registration Errors:

1. Try to create account with:
   - **Empty fields** → Error: "All fields are required"
   - **Short password** (5 chars) → Error: "Password must be at least 6 characters"
   - **Mismatched passwords** → Error: "Passwords do not match"
   - **Invalid email** → Error: "Please enter a valid email address"

#### Login Errors:

1. Try to login with:
   - **Wrong email** → Error: "Invalid credentials" (from backend)
   - **Wrong password** → Error: "Invalid credentials"
   - **Empty fields** → Error: "Email and password are required"

---

### Test 7: Protected Routes ✅

**Path**: Direct URL access

1. Logout first
2. Try to access `http://localhost:5174` (dashboard)
3. ❌ See "Access Denied" message instead of dashboard
4. ✅ Button to "GO HOME"

---

### Test 8: Error Handling ✅

**Backend temporarily offline**:

1. Stop backend server (Ctrl+C in Terminal 1)
2. Click "SIGN IN" on frontend
3. Try to login
4. ✅ See error: "Error: Failed to connect to server" (or similar)
5. Start backend again
6. Try login again
7. ✅ Now works

---

## 📊 EXPECTED RESULTS

### After Complete Test Flow:

```
✅ User registers with email john@example.com
✅ Password hashed in database
✅ JWT token generated and stored in localStorage
✅ User can access dashboard
✅ Scores saved to MongoDB database
✅ Charity selection persists across sessions
✅ User can logout and login again
✅ Dashboard data reloads from database
✅ All API calls go to http://localhost:5000/api/*
✅ Errors displayed gracefully
✅ Loading states shown for all API calls
```

---

## 🔍 DEBUGGING TIPS

### Check API Calls

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Perform an action (login, add score, etc.)
4. Should see POST/GET requests to `http://localhost:5000/api/...`
5. Response should show `{ data: {...}, message: "success" }`

### Check Console Errors

1. Open Developer Tools (F12)
2. Go to "Console" tab
3. Should NOT see red errors
4. May see console.log debug messages

### Check Local Storage

1. Open Developer Tools (F12)
2. Go to "Application" tab
3. Click "Local Storage" → `http://localhost:5174`
4. Should see `token` key with JWT value
5. After logout, token should be gone

### Check Backend Logs

1. Look at Terminal 1 (backend)
2. Should see logs like:
   ```
   POST /api/auth/login 200
   GET /api/scores 200
   PUT /api/scores 200
   ```
3. If you see errors (500, 400), check backend for issues

---

## 🆘 COMMON ISSUES & FIXES

### Issue: "Cannot POST /api/auth/register"

**Cause**: Backend not running
**Fix**: Run `npm run dev` in vantage-backend folder

### Issue: "Cannot reach localhost:5000"

**Cause**: Backend port not open
**Fix**: Check .env PORT=5000, restart backend

### Issue: "Access Denied" when trying to view dashboard

**Cause**: Not logged in (expected!)
**Fix**: Click "SIGN IN" and login first

### Issue: Scores don't save

**Cause**: Backend not persisting to database
**Fix**: Check MongoDB connection, check .env MONGO_URI

### Issue: Login says "Error: Invalid credentials"

**Cause**: Wrong email/password or typo
**Fix**: Double-check credentials, try registering new account

### Issue: Session lost after refresh

**Cause**: Token not in localStorage
**Fix**: Check localStorage in DevTools, check API /auth/me response

---

## 📱 RESPONSIVE TESTING

Test on different screen sizes:

- **Desktop** (1920px): All elements visible
- **Laptop** (1366px): Layout adjusts, sidebar responsive
- **Tablet** (768px): Grid becomes 1 column
- **Mobile** (375px): Navbar becomes hamburger (if implemented)

---

## ✨ SUCCESS CRITERIA

You know it's working when:

- ✅ Can register new account
- ✅ Can login with email/password
- ✅ Can navigate to dashboard
- ✅ Can add/edit scores
- ✅ Can select charity
- ✅ Can logout
- ✅ Session persists on refresh
- ✅ Error messages display properly
- ✅ Loading spinners show during API calls
- ✅ No red errors in console

---

**Happy Testing! 🚀**
