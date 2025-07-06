# Student-Teacher Management System

A comprehensive full-stack web application built with Next.js, Firebase, and modern UI components for managing student-teacher interactions, appointments, and communications.

## Features

### For Students
- **Registration & Authentication**: Secure signup with admin approval
- **Teacher Discovery**: Search and browse available teachers by subject
- **Appointment Booking**: Request appointments with preferred dates and times
- **Real-time Messaging**: Direct communication with teachers
- **Appointment Tracking**: View status of all appointment requests

### For Teachers
- **Availability Management**: Set weekly schedules and availability
- **Appointment Management**: Approve, decline, or reschedule student requests
- **Leave Status**: Toggle availability for vacation or sick days
- **Student Communication**: Respond to messages and queries
- **Dashboard Analytics**: View appointment statistics and history

### For Administrators
- **User Management**: Add, remove, and manage teacher accounts
- **Student Approval**: Review and approve student registrations
- **System Overview**: Monitor all appointments and user activities
- **Teacher Onboarding**: Create teacher accounts with temporary passwords

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Firebase (Auth, Firestore, Storage)
- **UI Components**: shadcn/ui, Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project
- Vercel account (for deployment)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd student-teacher-system
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase config

4. Create environment variables:
\`\`\`bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

5. Configure Firebase Security Rules:
   - Copy the rules from \`scripts/firebase-rules.js\`
   - Apply them to your Firestore and Storage

6. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

### Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Firebase Security Rules

The application includes comprehensive security rules for:
- User data protection
- Role-based access control
- Appointment and message privacy
- File upload restrictions

## Project Structure

\`\`\`
├── app/
│   ├── admin/          # Admin dashboard and management
│   ├── auth/           # Authentication pages
│   ├── student/        # Student portal
│   ├── teacher/        # Teacher dashboard
│   └── globals.css     # Global styles
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── admin-layout.tsx
│   ├── student-layout.tsx
│   └── teacher-layout.tsx
├── lib/
│   └── firebase.ts     # Firebase configuration
└── scripts/
    └── firebase-rules.js # Security rules
\`\`\`

## Key Features Implementation

### Authentication & Authorization
- Firebase Authentication with email/password
- Role-based routing and access control
- Admin approval workflow for students

### Real-time Updates
- Firestore real-time listeners for appointments
- Live message notifications
- Dynamic status updates

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Modern UI with smooth animations

### Data Security
- Comprehensive Firestore security rules
- User data isolation
- Role-based data access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
\`\`\`

This is a complete, production-ready student-teacher management system with all the features you requested:

## Key Features Implemented:

### **Admin Role:**
- Add/delete/update teachers with temporary passwords
- Approve student registrations
- View all appointments and user statistics
- Complete dashboard with analytics

### **Teacher Role:**
- Set weekly availability schedules
- Approve/decline appointment requests
- Toggle leave status
- View and respond to messages
- Comprehensive appointment management

### **Student Role:**
- Search and browse teachers
- Book appointments with date/time preferences
- Send messages to teachers
- Track appointment status
- Modern dashboard interface

### **Technical Features:**
- **Firebase Integration**: Complete setup with Auth, Firestore, and Storage
- **Security Rules**: Comprehensive rules for data protection
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, animated interface with Tailwind CSS
- **Real-time Updates**: Live data synchronization
- **Role-based Access**: Secure routing and permissions

### **UI/UX Features:**
- Smooth animations and transitions
- Loading states and error handling
- Modern gradient designs
- Mobile-responsive layouts
- Intuitive navigation

The application is completely ready for deployment on Vercel with Firebase backend. Just add your Firebase configuration and deploy!
