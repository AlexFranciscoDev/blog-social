# 🛠 Blog Social Backend

REST API for a social blog platform built with Node.js, Express and MongoDB.

This backend handles authentication, user profiles, posts, comments and image uploads, providing the core functionality for a full-stack social blog application.

---

## 🚀 Technologies

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Cloudinary
- Multer
- CORS
- dotenv

---

## ✨ Features

- User registration and login
- JWT-based authentication
- Profile management
- Password update
- Avatar upload
- Create, edit and delete posts
- Paginated post listing
- Get single post and posts by user
- Add, edit, delete and reply to comments
- Image upload with Cloudinary
- Global JSON error handling

---

## 🧩 API Structure

The project is organized into a modular backend architecture:

- `routes/` → route definitions
- `controllers/` → request handling logic
- `models/` → MongoDB schemas
- `middlewares/` → authentication and request validation helpers
- `services/` → reusable services such as JWT
- `config/` → external service configuration (e.g. Cloudinary)

This separation makes the project easier to maintain and scale.

---

## 🔐 Authentication

Authentication is handled using JWT tokens.

Protected routes use an auth middleware to validate the logged-in user before allowing access to private resources such as profile editing, post creation or comment actions.

---

## 🖼 Image Uploads

Images are uploaded using Multer and stored in Cloudinary.

This solves the common issue of storing images only on the local server, making uploaded assets accessible across environments and deployments.

The backend also includes file size validation and error handling for upload failures.

---

## 📚 What I Learned

- Building a REST API with Express and MongoDB
- Structuring backend code with routes, controllers and models
- Implementing authentication with JWT
- Hashing passwords securely with bcrypt
- Handling image uploads in a production-friendly way using Cloudinary
- Returning consistent JSON errors instead of HTML responses
- Validating uploads on both client and server sides

---

## ⚡ Performance / Architecture Considerations

- The backend already separates concerns into routes, controllers and services, which improves maintainability.
- Uploading images to Cloudinary is more scalable than storing them locally.
- Some areas could be improved further with more centralized validation and cleaner async patterns.

---

## 🔮 Improvements

- Add automated tests for routes and controllers
- Add request validation middleware for cleaner input validation
- Improve token invalidation strategy with persistent storage
- Add rate limiting and security middleware
- Add API documentation with Swagger or Postman collection
- Refactor some controller logic to improve consistency and readability

---

## ▶️ Running the Project

Clone the repository:

```
git clone https://github.com/AlexFranciscoDev/blog-social.git
```

Install dependencies:
```
npm install
```

Create a .env file with the required environment variables:

```
PORT=3800
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run in development mode:
```
npm run dev
```

Run in production mode:
```
npm start
```

---
## Main Endpoints
User
* POST /api/user/signup
* POST /api/user/login
* POST /api/user/logout
* GET /api/user/profile/:id?
* PUT /api/user/editProfile
* PUT /api/user/changePassword
* DELETE /api/user/deleteUser
* POST /api/user/upload

Posts
* GET /api/post/:page?
* GET /api/post/singlePost/:id
* GET /api/post/user/:id/:page?
* POST /api/post/save
* PUT /api/post/edit/:id
* DELETE /api/post/delete/:id
* POST /api/post/upload/:id

Comments
* POST /api/comment/save/:postId
* PUT /api/comment/edit/:id
* DELETE /api/comment/delete/:id
* POST /api/comment/reply/:id

## Related Repository
Frontend:
[Blog Social Frontend](https://github.com/AlexFranciscoDev/Blog-social-frontend) 

