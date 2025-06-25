# ♟️ Chess Game – Full Stack (Node.js + Vanilla JS)

This is a full-stack browser-based chess application. It includes a backend API built with **Node.js + Express**, and a frontend UI using **HTML, CSS, and JavaScript**. The application allows users to register, manage friends, and play chess games with saved progress.

---

## 🌐 How It Works

### 1. User Registration & Login
- **Frontend**: Pages like `login.html` and `createAccount.html` handle user input.
- **JavaScript**: Scripts in `scripts/registerPaths/` send login/registration requests.
- **Backend**: Express routes (`routes/users.js`) call logic in controllers and DB modules (`controllers/users.js`, `connect/usersDB.js`) to authenticate or register users.

### 2. Dashboard
- **Page**: `main.html` shows options after login.
- **Scripts**: `main-page.js`, `main-navbar.js` display friend list, start games.
- **Backend**: User data and friend info are fetched from the backend via `routes/friends.js` and `routes/games.js`.

### 3. Game Panel
- **Page**: `game-panel.html` displays the chessboard.
- **Scripts**: `chess_script.js`, `main-page-GAME-READY.js` manage game state and UI.
- **Backend**: Server stores and retrieves game state using `/games` endpoints.

### 4. Friends System
- Users can send and accept friend requests.
- Routes like `/friends/add` and `/friends/accept` manage relationships.
- Logic in `controllers/friends.js`, `connect/friendsDB.js`.

---

## 🧠 Backend Architecture

```
connect/         # Database connection and logic (MySQL)
controllers/     # Application logic for users, games, friends
middlewares/     # Validation middleware
routes/          # Express route definitions
server.js        # Entry point
chess_users.sql  # Sample SQL schema for users
```

### 🧪 Endpoints Overview

- `POST /users/register` – Register user
- `POST /users/login` – Authenticate user
- `GET /friends` – List friends
- `POST /friends/add` – Send friend request
- `POST /friends/accept` – Accept friend request
- `POST /games/create` – Start a new game
- `POST /games/move` – Make a move
- `GET /games/:id` – Get game state

---

## 🎨 Frontend Structure

```
pages/              # All HTML views
├── mainPaths/      # Main screens (game, profile, login)
├── registerPaths/  # Account setup flow
├── partials/       # Navbar, modals, footers

scripts/            # All JS logic
├── utils/          # Helper functions and validation
├── registerPaths/  # Registration JS
├── main-page.js    # Main UI logic
├── chess_script.js # Game logic

styles/             # All CSS styles
├── partials/       # Navbar & modal styles
├── registerPaths/  # Auth styles
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v14+
- MySQL Server

### Backend Setup
1. Clone the project
2. Run `npm install`
3. Set up `.env` for DB connection
4. Import `chess_users.sql` to MySQL
5. Run `node server.js`

### Frontend Use
Open `pages/mainPaths/login.html` in your browser after backend is running.

---

## ✅ Features Summary

- ✅ User login and account creation
- ✅ Chess game with move tracking
- ✅ Friend invite and management
- ✅ Persisted board state via database
- ✅ Modular frontend & backend code
