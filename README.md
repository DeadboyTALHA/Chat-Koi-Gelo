# 🤔 Chat Koi Gelo

A real-time temporary messaging web application where chat history vanishes when you close the tab.

## 🌐 Live Demo

Check out the live project: *[Chat Koi Gelo](https://chat-koi-gelo.vercel.app)*

## ✨ Features

- **Ephemeral Messages** - Messages disappear when you close the browser tab
- **Real-time Chat** - Instant messaging with Socket.IO
- **Group Chats** - Create groups and chat with multiple friends
- **Dark/Light Mode** - Toggle between themes
- **Screenshot Protection** - Blocks right-click and print shortcuts
- **User Search** - Find and add friends by username
- **Real-time Notifications** - Friend request alerts

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO Server
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT with httpOnly cookies

## 🚀 Running the Project

### Prerequisites
- Node.js 20+
- MongoDB Atlas account

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`

### Environment Variables

**server/.env**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🎮 How It Works

- Messages are stored only in server RAM, never in database
- Closing the tab triggers message deletion
- User accounts, friends list, and groups persist in MongoDB

## 📁 Project Structure

```
chat-koi-gelo/
├── client/          # React frontend
├── server/          # Node.js backend
└── .gitignore
└── README.md
```
