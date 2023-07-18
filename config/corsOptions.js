const allowedOrigins = [
    'https://gig-link.onrender.com',
    // 'http://localhost:5173',
]

const corsOptions = {
    origin: (origin, callback) => {
        // Leave in !origin if you want Postman to access it
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions 