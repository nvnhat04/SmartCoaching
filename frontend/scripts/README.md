# Database Seeder Scripts

This directory contains scripts to populate the database with initial data for the Smart Coaching application.

## 📁 Files

### 1. `seed-admin.js` (Quick Seed)
Creates only the admin user account. Use this for quick setup.

**Created Data:**
- ✅ 1 Admin user

**Usage:**
```bash
npm run seed:admin
```

**Admin Credentials:**
- Email: `admin@smartcoaching.com`
- Password: `admin123`

---

### 2. `seed.ts` (Full Seed)
Creates comprehensive sample data including admin, users, and exercises.

**Created Data:**
- ✅ 1 Admin user
- ✅ 2 Sample users
- ✅ 6 Sample exercises (Squat, Push-up, Plank, Mountain Climbers, Yoga, Stretching)

**Usage:**
```bash
npm run seed:full
# or
npm run seed
```

**Created Accounts:**
1. **Admin User**
   - Email: `admin@smartcoaching.com`
   - Password: `admin123`

2. **Sample User 1**
   - Email: `user1@example.com`
   - Password: `password123`
   - Profile: Male, 25yo, Beginner

3. **Sample User 2**
   - Email: `user2@example.com`
   - Password: `password123`
   - Profile: Female, 28yo, Intermediate

## 🚀 Getting Started

### Prerequisites
1. MongoDB must be running
2. Environment variables configured (`.env.local`)
3. Dependencies installed (`npm install`)

### Step-by-Step

1. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env.local
   ```

2. **Configure Environment**
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   
   # Edit .env.local with your MongoDB URI
   MONGODB_URI=mongodb://localhost:27017/smart-coaching
   ```

3. **Run Seeder**
   ```bash
   # Quick seed (admin only)
   npm run seed:admin
   
   # Full seed (admin + samples)
   npm run seed:full
   ```

4. **Verify**
   - Check console output for success messages
   - Login to the app with admin credentials
   - Check MongoDB for created data

## 📊 Sample Exercises Created

The full seed creates these exercises:

| Exercise | Category | Difficulty | Duration | Calories/min |
|----------|----------|------------|----------|--------------|
| Squat | squat | Medium | 3 min | 8 |
| Push-up | pushup | Medium | 2 min | 7 |
| Plank | plank | Easy | 1 min | 5 |
| Mountain Climbers | other | Hard | 1.5 min | 10 |
| Yoga - Sun Salutation | yoga | Easy | 5 min | 4 |
| Stretching Routine | stretching | Easy | 10 min | 3 |

## 🔄 Re-running Seeds

The scripts are **idempotent** - they check for existing data and skip creation if already present.

**Safe to run multiple times!** ✅

```bash
# Will skip if admin exists
npm run seed:admin

# Will skip existing users/exercises
npm run seed:full
```

## 🛠️ Customization

### Create Your Own Admin

Edit `scripts/seed-admin.js`:

```javascript
const adminEmail = "your-admin@company.com";
const adminPassword = "your-secure-password";
```

### Add More Sample Data

Edit `scripts/seed.ts` and add to the arrays:

```typescript
const sampleUsers = [
  // Add your users here
];

const exercises = [
  // Add your exercises here
];
```

## 🐛 Troubleshooting

### Error: Cannot connect to MongoDB
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB or check connection string in `.env.local`

### Error: User already exists
```
⚠️ Admin user already exists
```
**Solution:** This is normal! The script detects existing data and skips creation.

### Error: Module not found
```
❌ Cannot find module 'tsx'
```
**Solution:** Run `npm install` to install all dependencies

## 📝 Notes

- All passwords are hashed with bcrypt (12 rounds)
- BMI is calculated automatically for users with height/weight
- Exercises include detailed instructions and muscle targets
- Scripts automatically close DB connection after completion

## 🔐 Security

⚠️ **Important:** 
- Change the admin password immediately after first login in production!
- Never commit real credentials to version control
- Use strong passwords in production environments

## 🎯 Next Steps After Seeding

1. ✅ Run frontend: `npm run dev`
2. ✅ Run AI service: `cd ai-service && uvicorn main:app --reload`
3. ✅ Login with admin credentials
4. ✅ Test the application features
5. ✅ Create your own users and exercises

## 💡 Tips

- Use `seed:admin` for quick development setup
- Use `seed:full` for demo/testing with sample data
- Modify scripts to match your specific data needs
- Keep seed scripts in version control for team setup

---

**Happy Coding! 🚀**
