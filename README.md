# 🏡 StayV

StayV is a full-stack vacation rental web application inspired by Airbnb. Users can explore listings, create their own listings, upload images, leave reviews, and securely authenticate using Passport.js.

## 🌐 Live Demo

**Website:** https://stayv.onrender.com

---

## ✨ Features

* 🔐 User Authentication (Signup, Login & Logout)
* 🏠 Create, Edit and Delete Listings
* ☁️ Image Upload using Cloudinary
* ⭐ Add and Delete Reviews
* 💬 Flash Messages for User Feedback
* 🔒 Authorization & Authentication
* 📱 Responsive User Interface
* 🗂️ MongoDB Atlas Database
* 🍪 Session Management with Connect-Mongo

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* Bootstrap 5
* EJS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* Passport.js
* Passport Local
* Passport Local Mongoose

### Cloud & Deployment

* Cloudinary
* Render

### Other Packages

* Express Session
* Connect Mongo
* Connect Flash
* Multer
* Multer Storage Cloudinary
* Joi
* Method Override
* Dotenv

---

## 📂 Project Structure

```
StayV/
│
├── controllers/
├── models/
├── routes/
├── views/
├── public/
│   ├── css/
│   └── js/
├── utils/
├── init/
├── app.js
├── middleware.js
├── schema.js
├── cloudconfig.js
└── package.json
```

---

## 🚀 Installation

### Clone the repository

```bash
git clone https://github.com/VinitArgulwar/StayV.git
cd StayV
```

### Install dependencies

```bash
npm install
```

### Create a `.env` file

```env
ATLASDB_URL=your_mongodb_connection_string
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
SECRET=your_session_secret
```

### Start the application

```bash
node app.js
```

or

```bash
nodemon app.js
```

Visit:

```
http://localhost:8080
```

---

## 📸 Screenshots

You can add screenshots of:

* Home Page
* Listing Details
* Login Page
* Signup Page
* Create Listing
* Edit Listing

---

## 🎯 Future Improvements

* Wishlist / Favorites
* Booking System
* Maps Integration
* Payment Gateway
* Search & Filters
* User Profiles
* Admin Dashboard

---

## 👨‍💻 Author

**Vinit Argulwar**

* GitHub: https://github.com/VinitArgulwar

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.
