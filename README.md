# 🚀 EduConnect – Student-Teacher Management System
<p align="center">
  <b>The Ultimate Platform for Modern Education</b><br/>
  <i>Empowering students, teachers, and administrators with seamless scheduling, communication, and analytics.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-blue?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Firebase-Cloud-orange?logo=firebase" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel" />
  <img src="https://img.shields.io/badge/UI-Premium-green?logo=tailwindcss" />
</p>

---

<p align="center">
Live Demo : https://eduportal-system.vercel.app/
</p>

---

## ✨ Why EduConnect?

- **Premium Experience:** Modern, animated UI with smooth transitions and mobile-first design.
- **All-in-One Solution:** Scheduling, messaging, analytics, and role-based access in one place.
- **Enterprise-Grade Security:** Robust Firebase security rules and real-time data protection.
- **Effortless Deployment:** Ready for Vercel, with simple environment setup.

---

## 🌟 Features At a Glance

### 👩‍🎓 For Students
- Secure registration & admin approval
- Discover and search teachers by subject
- Book appointments with real-time status
- Direct messaging with teachers
- Track all appointments in a modern dashboard

### 👨‍🏫 For Teachers
- Set and manage weekly availability
- Approve/decline appointment requests
- Toggle leave status instantly
- Respond to student messages
- Analytics dashboard for appointments

### 🛡️ For Admins
- Manage all users and teachers
- Approve student registrations
- System-wide analytics and monitoring
- Onboard teachers with temporary passwords

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Backend:** Firebase (Auth, Firestore, Storage)
- **UI:** shadcn/ui, Tailwind CSS, Lucide React
- **Deployment:** Vercel

---

## 🚦 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd student-teacher-system
npm install
```

### 2. Firebase Setup
- Create a Firebase project
- Enable Auth, Firestore, Storage
- Copy your config to `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Security Rules
- Use `scripts/firebase-rules.js` for Firestore & Storage rules

### 4. Run Locally
```bash
npm run dev
```

### 5. Deploy
- Connect to Vercel, add env vars, and deploy!

---

## 🏗️ Project Structure

```text
├── app/
│   ├── admin/          # Admin dashboard
│   ├── auth/           # Auth pages
│   ├── student/        # Student portal
│   ├── teacher/        # Teacher dashboard
│   └── globals.css     # Global styles
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── admin-layout.tsx
│   ├── student-layout.tsx
│   └── teacher-layout.tsx
├── lib/
│   └── firebase.ts     # Firebase config

```

---

## 🔒 Security & Data Protection
- Role-based access control
- User data isolation
- Real-time listeners for appointments/messages
- Comprehensive Firestore security rules

---

## 💎 Premium UI/UX
- Animated gradients & transitions
- Responsive, mobile-first layouts
- Modern cards, badges, and icons
- Intuitive navigation and feedback
- Testimonial & social proof sections

---

## 🚧 Upcoming Updates

Stay tuned for even more premium features coming soon:

- 📧 **Email Notifications:** Get instant updates on appointments, approvals, and messages directly in your inbox.
- 🔔 **In-App Notifications:** Real-time alerts for new messages, appointment status changes, and admin actions.
- 🗓️ **Calendar Sync:** Integrate your appointments with Google Calendar and Outlook.
- 📱 **Mobile App:** Native iOS and Android apps for on-the-go access.
- 🏆 **Gamification:** Badges, achievements, and leaderboards for active users.
- 🌐 **Multi-language Support:** Use EduConnect in your preferred language.
- 🧑‍💻 **Advanced Analytics:** Deeper insights for teachers and admins.

> Have a feature request? [Open an issue](https://github.com/) or contact us!

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License

---

## 😎Code-Game-Ninja (Chirag Mishra)

## ✉️chiragmishra2511@gmail.com

## 🌐 Connect With Us

<p align="center">
  <a href="https://www.linkedin.com/in/chirag-mishra-14b128337/" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-0077B5?logo=linkedin&logoColor=white" /></a>
</p>

---

> **EduConnect** – Where students and teachers connect, learn, and grow. Experience the future of education today!
