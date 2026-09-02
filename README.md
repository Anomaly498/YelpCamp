# YelpCamp 🏕️

A full-stack, server-side rendered web platform for discovering, listing, and reviewing outdoor campgrounds worldwide. Built with Node.js, Express, MongoDB Atlas, and Bootstrap.

🔗 **Live Demo:** [yelpcamp-teal-mu.vercel.app](https://yelpcamp-teal-mu.vercel.app/)  
📂 **Repository:** [github.com/Anomaly498/YelpCamp](https://github.com/Anomaly498)

---

## 🌟 Features

- **Campground Management (CRUD):** Users can create, browse, edit, and delete campground listings with locations, descriptions, and dynamic pricing.
- **Interactive Geospatial Mapping:** Integrates MapTiler forward geocoding to plot campgrounds on interactive cluster maps and single-location pins.
- **Image Pipeline:** Multi-image uploads streamed directly to Cloudinary CDN with automatic deletion handling upon update.
- **User Authentication & Authorization:** Session-based authentication with Passport.js; custom middleware route guards restrict edit/delete privileges to the original listing or review author.
- **Community Reviews & Ratings:** Authenticated users can leave 1–5 star reviews with text feedback.
- **Cascading Data Deletion:** Pre/post Mongoose hooks automatically clean up all associated review documents when a campground is removed.
- **Security & Data Sanitization:** Hardened against NoSQL injection using `express-mongo-sanitize`, XSS filtering via custom Joi validators, and Content Security Policy (CSP) headers enforced via Helmet.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime & Backend** | Node.js, Express.js |
| **Database & ODM** | MongoDB Atlas, Mongoose |
| **Templating & UI** | EJS (Embedded JavaScript), Bootstrap 5 |
| **Authentication** | Passport.js, Passport-Local-Mongoose, Express-Session, Connect-Mongo |
| **Cloud Storage** | Cloudinary API, Multer, Multer-Storage-Cloudinary |
| **Maps & Geocoding** | MapTiler SDK / API |
| **Validation & Security** | Joi, Helmet (CSP), Mongo-Sanitize, Method-Override |

---

## 🏗️ Architecture & Data Modeling

```text
 [ User ]
    │ (1 to Many)
    ├──► Creates ──► [ Campground ] ── (Has Many) ──► [ Review ]
    │                       │                             │
    └───────────── (1 to Many) ───────────────────────────┘
