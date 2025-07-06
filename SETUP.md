# Student-Teacher System Setup Guide

## Quick Start

1. **Run the setup script to see Firebase setup instructions:**
   \`\`\`bash
   node scripts/setup-firebase.js
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## Firebase Setup Checklist

- [ ] Enable Email/Password Authentication
- [ ] Create Firestore Database
- [ ] Enable Storage
- [ ] Create Admin User
- [ ] Apply Security Rules

## Default Admin Credentials

After setup, you can login with:
- **Email:** admin@portalbaba.com
- **Password:** admin123456

## Project Structure

- `/app` - Next.js app router pages
- `/components` - Reusable UI components
- `/lib` - Firebase configuration and utilities
- `/scripts` - Setup and utility scripts

## Features

### Admin Dashboard
- Manage teachers and students
- Approve student registrations
- View all appointments
- System analytics

### Teacher Portal
- Set availability schedules
- Manage appointment requests
- Communicate with students
- Toggle leave status

### Student Portal
- Search and book teachers
- View appointment status
- Send messages to teachers
- Track learning progress

## Deployment

This app is ready to deploy on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

## Support

If you encounter any issues, check:
1. Firebase console for proper service enablement
2. Environment variables are correctly set
3. Security rules are applied
4. Admin user is created in Firestore
