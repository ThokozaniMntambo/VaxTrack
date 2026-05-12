# 🏥 Child Immunisation Tracking System

A React + Firebase web application built using Material Dashboard React to help parents track child vaccinations, receive reminders, and interact with a chatbot assistant.

---

## 🚀 Features

- 👶 Child vaccination tracking system
- 💉 WHO-based immunisation schedule
- 📊 Dashboard overview (health snapshot)
- 🔔 Vaccine reminders system
- 👨‍👩‍👧 Parent & child profiles
- 📅 Calendar view for vaccines
- 🤖 AI Chatbot (Configurator panel)
- ⚙️ Settings & user preferences
- 🔐 Firebase authentication & database

---

## 📦 Dependencies

npm install react react-dom react-scripts  
npm install firebase  
npm install react-router-dom  
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled  
npm install react-calendar  
npm install @fullcalendar/react @fullcalendar/daygrid  
npm install prettier  

---

## 🚀 Run Project

Install dependencies:  
npm install  

Start development server:  
npm start  

App runs at:  
http://localhost:3000  

---

## SMS Reminders With Twilio

The Reminder Center can send active vaccine reminders by SMS through the server-side
`/api/reminders` endpoint. Twilio credentials must stay in `.env`; do not expose them
with `REACT_APP_` variables.

Required SMS variables:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_SMS_FROM=+15551234567
```

You can use a Twilio Messaging Service instead of a fixed sender number:

```env
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Parent phone numbers should be saved in international E.164 format, for example
`+15551234567`. To accept local numbers, set `TWILIO_DEFAULT_COUNTRY_CODE`, for
example `+1` or `+27`.

For deployed frontends where the API is hosted elsewhere, set:

```env
REACT_APP_REMINDER_API_URL=https://your-api.example.com/api/reminders
```

---

## 🧭 App Pages Structure

🏠 Dashboard (My Overview) — src/layouts/dashboard/  
- Child summary card  
- Upcoming vaccinations  
- Missed alerts  
- Vaccine stats  
- Send reminder  

💉 Vaccine Reminder Page — src/layouts/vaccines/  
- Timeline view  
- Status: Done / Upcoming / Missed  
- Mark done / view details / reminder  

👶 Child Profile Page — src/layouts/child-profile/  
- Parent info  
- Child info  
- Medical history  
- Vaccine history  

🔔 Reminder Center — src/layouts/reminders/  
- Upcoming reminders (2 days before)  
- Missed vaccine alerts  
- Notification history  

📅 Calendar Page — src/layouts/calendar/  
- Vaccine schedule  
- Green = completed  
- Yellow = upcoming  
- Red = missed  

⚙️ Settings Page — src/layouts/settings/  
- Profile settings  
- Notification settings  
- Future language support  

🤖 Chatbot (Configurator Panel) — src/examples/Configurator/  
- Vaccine explanations  
- Missed vaccine guidance  
- System assistant  

---

## 🎨 Code Formatting

After changes in src/:  
npx prettier --write src  

---

## 💉 Firestore Database Structure

Collection: users/{uid}/vaccines  

Example document:  
{  
  name: "BCG",  
  dateOffsetWeeks: 0,  
  status: "Done",  
  note: "At birth"  
}  

---

## 🧭 Navigation Sidebar

- Dashboard  
- Vaccine Reminder  
- Child Profile  
- Reminders  
- Calendar  
- Settings  
- Chatbot  

---

## 📁 Project Structure

material-dashboard-react/  
├── public/  
├── src/  
│   ├── assets/  
│   ├── components/  
│   ├── context/  
│   ├── examples/Configurator/ (ChatBot) 
│   ├── layouts/dashboard/  
│   ├── layouts/vaccines/  
│   ├── layouts/child-profile/  
│   ├── layouts/reminders/  
│   ├── layouts/calendar/  
│   ├── layouts/settings/  
│   ├── firebase.js  
│   ├── routes.js  
│   ├── App.js  
│   └── index.js  
├── package.json  
└── README.md  

---

## 🧠 System Logic

- Vaccines auto-generated from birth date  
- Status system: Done / Upcoming / Missed  
- Dashboard shows health snapshot  
- Reminder system tracks notifications  
- Chatbot assists parents  

---

## 💙 Tech Stack

- React JS  
- Firebase (Auth + Firestore)  
- Material Dashboard React  
- Material UI  
- React Calendar / FullCalendar  
- Prettier
