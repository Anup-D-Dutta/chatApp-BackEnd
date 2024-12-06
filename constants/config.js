// const corsOptions ={
//     origin: [
//         // "http://localhost:5173",
//         "https://chat-app-front-end-bice.vercel.app"
//         // process.env.CLIENT_URL //Optional, for dynamic environment setup
//     ],
//     methods: ['GET','POST','PUT','DELETE'],
//     credentials: true, // Allow cookies
// }

// const MESSAGE_TOKRN = "message-Token"

// export{corsOptions, MESSAGE_TOKRN}


const allowedOrigins = [
    "http://localhost:5173",
    "https://chat-app-front-end-bice.vercel.app",
    process.env.CLIENT_URL // Optional, for dynamic environment setup
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow cookies
};

const MESSAGE_TOKRN = "message-Token";

export { corsOptions, MESSAGE_TOKRN };
