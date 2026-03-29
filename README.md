# CS2 Nade Lineups (Nade Guide)

A web application for browsing, saving and uploading grenade lineups for Counter-Strike 2.

The platform provides an interactive map-based experience: users can explore grenade throws by map, grenade type and difficulty, preview lineup media, and contribute their own lineups with screenshots or video.

**Live Demo:** https://nade-guide-cs2-pro.lovable.app/

---

## Features

### Maps & Lineups
- Map selection with preview
- Lineups displayed on the map with **throw point** and **landing point**
- Trajectory lines connecting throw and landing points
- Hover preview with lineup details

### Clustering & Navigation
- Nearby points are grouped into clusters
- Horizontal scrolling through lineups inside a cluster

### Filtering
- Grenade type: smoke / flash / HE / molotov / decoy
- Difficulty level
- Side: CT / T
- Throw type (standing, jump throw, etc.)

### Media Support
- Video preview modal
- Quick timeline controls (jump to setup/aim moments)
- Screenshot support (setup / aim / result)

### Accounts & User Features
- Authentication via email/password
- Google OAuth login
- Favorites system
- Upload your own lineups through a structured form
- Profile settings (username and avatar)

---

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

**Backend / Database**
- Supabase (Auth + Database + Storage)

---

## Project Highlights

- Built an interactive UI with map-based visualization and clustering for dense data points.
- Implemented user authentication and account-based data storage.
- Designed a structured data model for lineups with filtering by multiple dimensions.
- Integrated media workflow with videos and multi-step screenshot support.
- Focused on usability for both beginner and experienced CS2 players.

---

## Local Setup

### Requirements
- Node.js 18+
- npm / yarn / pnpm

### Install & Run
```bash
npm install
npm run dev
````

### Build

```bash
npm run build
npm run preview
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Roadmap Ideas

* Admin/moderation panel for community uploads
* Rating system for lineups
* Comments and discussions per lineup
* Improved search by location / keyword
* Import/export lineup collections

---

## Author

Evgenii Kondratenko
GitHub: [https://github.com/TruePacifism](https://github.com/TruePacifism)
