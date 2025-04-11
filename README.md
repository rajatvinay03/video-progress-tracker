# 🎥 Smart Video Progress Tracker

A fully-functional, vanilla JavaScript project to track and visualize video-watching progress. It includes a live progress bar, visual timeline of watched segments, gamification badges, persistent progress via REST API, and a reset option — all mobile responsive and seek-safe.

---

## 🚀 Features

- ✅ **Accurate Progress Tracking** – Only meaningful watch time is recorded (no false seeks).
- 📊 **Visual Progress Bar & Timeline** – See real-time percentage and timeline of watched segments.
- 🏅 **Badges for Watch Milestones** – Reward system based on percentage watched.
- 🔄 **Persistent Progress** – Save progress via API and resume from where you left off.
- ⏱️ **Time Display** – Watch time vs total duration clearly shown.
- ♻️ **Reset Option** – Clears watch history and resets all visuals.
- 📱 **Mobile-Responsive UI**

---

## 🧰 Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend (optional):** Node.js + Express
- **Storage:** In-memory (can be replaced with MongoDB/PostgreSQL)

---

## 🧠 How It Works
- **Merge Intervals:** Avoids duplicate watch time.

- **Time-Based Watch Recording:** Records only actual playback, not seeks.

- **Live Progress % Animation:** Smooth 0% → 100% transitions.

- **Badges:**

< 25% → 🚀 Getting Started

25–49% → 🔥 Rising Star

50–89% → 📘 Halfway Hero

90%+ → 🎯 Master Learner

---

## 🧪 Manual Testing Checklist
 Video starts from 0% on fresh load

 Seek doesn't add fake watch time

 Reset sets everything back to 0%

 Badge changes based on actual watched %

 Time display is correct

 Watched segments show up visually

---
 
## 📌 Future Improvements
 Authentication & multi-user support

 MongoDB/SQL persistent storage

 Dashboard to track multiple videos

 Browser storage fallback if API fails

