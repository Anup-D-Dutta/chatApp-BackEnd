// // this is my own server

// import express from 'express'
// import { connectDB } from './utils/features.js';
// import dotenv from 'dotenv'
// import { errorMiddleware } from './middlewares/error.js';
// import cookiesParser from "cookie-parser";
// import {Server} from 'socket.io'
// import {createServer} from "http";
// import {v4 as uuid } from 'uuid'
// import cors from 'cors';
// import {v2 as cloudinary} from 'cloudinary'
// import { CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE, NEW_MESSAGE_ALERT, ONLINE_USERS } from './constants/event.js';
// import { create } from 'domain';
// import { Socket } from 'dgram';
// import { getSockets } from './lib/helper.js';
// import { Message } from './models/message.js';
// import { corsOptions } from './constants/config.js';
// import { socketAuthenticator } from './middlewares/auth.js';



// // Routes import
// import userRoute from './routes/user.js'
// import chatRoute from './routes/chat.js'
// import adminRoute from './routes/admin.js'


// dotenv.config({
//     path: './.env',
// })

// const app  = express();
// const server = createServer(app);
// const io = new Server(server, {
//     cors:corsOptions
// })


// const mongoURI = process.env.MONGO_URI;

// const port = process.env.PORT || 4000;

// const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";

// const userSocketIDs = new Map();
// const onlineUsers = new Set();

// // createUser(10);

// connectDB(mongoURI);

// cloudinary.config({
//     cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
//     api_key: process.env.CLOUDNARY_API_KEY,
//     api_secret: process.env.CLOUDNARY_API_SECRET,
// })

// app.set('io', io);

// //Using Middleware here
// app.use(express.json());
// app.use(cookiesParser());
// app.use(cors(corsOptions));


// // Routes declaration
// app.use('/api/v1/user', userRoute);
// app.use('/api/v1/chat', chatRoute);
// // app.use('/api/v1/admin', adminRoute);



// app.get("/", (req,res) => {
//     res.send("Hello")
// })



// io.use((socket,next) => {

//     cookiesParser()(socket.request, socket.request.res, async(error) =>{

//         try {
//             await socketAuthenticator(null, socket, next);
//         } catch (error) {
//             console.error("Socket Authentication Failed:", error);
//             next(error);
//         }
//         // await socketAuthenticator(error, socket, next)
//     })
// })


// io.on("connection", (socket) => {
//     const user = socket.user;
//     userSocketIDs.set(user._id.toString(), socket.id);

//     socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => { // Destructure the event data

//         const messageForRealTime = {
//             content: message, // Corrected from 'const' to 'content'
//             _id: uuid(),
//             sender: {
//                 _id: user._id,
//                 name: user.name,
//             },
//             chat: chatId,
//             createdAt: new Date().toISOString(), // Fixed typo: 'createAt' to 'createdAt'
//         };

//         const messageForDB = {
//             content: message,
//             sender: user._id,
//             chat: chatId
//         };

//         const membersSocket = getSockets(members);
//         io.to(membersSocket).emit(NEW_MESSAGE, { // Emit to members' sockets
//             chatId,
//             message: messageForRealTime
//         });

//         io.to(chatId).emit(NEW_MESSAGE_ALERT, { chatId }); // Corrected to use chatId as room

//         try {
//             await Message.create(messageForDB);
//         } catch (error) {
//             throw new Error(error)
//         }
//     });
    
//     // Show online(Green dot)  
//     socket.on(CHAT_JOINED, ({userId, members})=>{
//         onlineUsers.add(userId.toString());

//         const membersSocket = getSockets(members);
//         io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
//     });
  
//     socket.on(CHAT_LEAVED, ({userId, members})=> {
//         onlineUsers.delete(userId.toString());

//         const membersSocket = getSockets(members);
//         io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));

//     });

//     socket.on("disconnect", () => {
//         const userId = user._id.toString();
//         userSocketIDs.delete(userId);
//         onlineUsers.delete(userId);
    
//         // Notify members of all chats
//         const updatedOnlineUsers = Array.from(onlineUsers);
//         io.emit(ONLINE_USERS, updatedOnlineUsers);
//     });
// });


// app.use(errorMiddleware) 

// server.listen(port, () =>{
//     console.log(`Server started at ${port} in ${envMode} Mode`)
// })

// export {
//     envMode,
//     userSocketIDs,
// }



import express from "express";
import { connectDB } from "./utils/features.js";
import dotenv from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import { v4 as uuid } from "uuid";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  ONLINE_USERS,
} from "./constants/event.js";
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
import { corsOptions } from "./constants/config.js";
import { socketAuthenticator } from "./middlewares/auth.js";

import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
// import adminRoute from "./routes/admin.js";

dotenv.config({
  path: "./.env",
});

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 4000;
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
// const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsasdsdfsdfsdfd";
const userSocketIDs = new Map();
const onlineUsers = new Set();

connectDB(mongoURI);

cloudinary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_key: process.env.CLOUDNARY_API_KEY,
    api_secret: process.env.CLOUDNARY_API_SECRET,
})


const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

// Using Middlewares Here
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
// app.use("/api/v1/admin", adminRoute);

app.get("/", (req, res) => {
  res.send("Hello World");
});

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on("connection", (socket) => {
  const user = socket.user;
  userSocketIDs.set(user._id.toString(), socket.id);

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      throw new Error(error);
    }
  });

//   socket.on(START_TYPING, ({ members, chatId }) => {
//     const membersSockets = getSockets(members);
//     socket.to(membersSockets).emit(START_TYPING, { chatId });
//   });

//   socket.on(STOP_TYPING, ({ members, chatId }) => {
//     const membersSockets = getSockets(members);
//     socket.to(membersSockets).emit(STOP_TYPING, { chatId });
//   });

  socket.on(CHAT_JOINED, ({ userId, members }) => {
    onlineUsers.add(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    onlineUsers.delete(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on("disconnect", () => {
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
});

app.use(errorMiddleware);

server.listen(port, () => {
  console.log(`Server is running on port ${port} in ${envMode} Mode`);
});

export { envMode, userSocketIDs };