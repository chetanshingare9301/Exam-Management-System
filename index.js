require('dotenv').config(); // Load environment variables from .env file

let app = require("./src/app.js"); // Your main Express app instance
const db = require("./src/config/db.js"); // Your database connection pool

// Test database connection when the application starts
db.testDbConnection();

// Start the Express server
app.listen(4000, () => {
    console.log("Server is started on 4000");
});