// server/index.js - Main file for the authentication server

// --- Require Statements ---
// Express.js: Fast, unopinionated, minimalist web framework for Node.js.
const express = require('express');
// body-parser: Node.js body parsing middleware. Parses incoming request bodies in a middleware before your handlers, available under the req.body property.
const bodyParser = require('body-parser');
// cors: Node.js CORS middleware. Enables Cross-Origin Resource Sharing.
const cors = require('cors');
// bcryptjs: Optimized bcrypt library for Node.js. Used for hashing passwords.
const bcrypt = require('bcryptjs');
// jsonwebtoken: An implementation of JSON Web Tokens. Used for creating and verifying JWTs for authentication.
const jwt = require('jsonwebtoken');

// --- App Initialization and Port Configuration ---
// Initialize the Express application.
const app = express();
// Define the port the server will listen on. Uses environment variable PORT if set, otherwise defaults to 3001.
const PORT = process.env.PORT || 3001;

// --- In-memory User Store ---
// NOTE: This is an in-memory array for demonstration purposes only.
// In a production environment, a database (e.g., PostgreSQL, MongoDB) should be used for persistent user storage.
let users = [];

// --- Core Middleware ---
// Enable CORS for all routes, allowing requests from different origins.
app.use(cors());
// Parse incoming requests with JSON payloads (Content-Type: application/json).
app.use(bodyParser.json());
// Parse incoming requests with URL-encoded payloads (Content-Type: application/x-www-form-urlencoded).
// The `extended: true` option allows for rich objects and arrays to be encoded into the URL-encoded format.
app.use(bodyParser.urlencoded({ extended: true }));

// --- Routes ---

/**
 * @route GET /
 * @description Welcome route for the server.
 * @access Public
 * @returns {JSON} A welcome message.
 */
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the authentication server.' });
});

/**
 * @route POST /auth/register
 * @description User registration route.
 * @access Public
 * @param {Object} req.body - Expected: { email: "user@example.com", password: "userpassword" }
 * @returns {JSON} Success: { message: "User registered successfully.", user: { id: 1, email: "user@example.com" } } (201)
 * @returns {JSON} Error: { message: "Email and password are required." } (400)
 * @returns {JSON} Error: { message: "User already exists." } (400)
 * @returns {JSON} Error: { message: "Server error during registration." } (500)
 */
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input: Check if email and password are provided.
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check if user already exists in the 'users' array.
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password using bcrypt with a salt round of 10.
    // A higher salt round increases security but also processing time.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and store the new user object.
    // NOTE: In a real application, this would involve saving to a database.
    const newUser = { id: users.length + 1, email, password: hashedPassword };
    users.push(newUser);

    // Respond with success message and user data (excluding password).
    res.status(201).json({
      message: 'User registered successfully.',
      // Return only non-sensitive user information.
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    // Log and respond to any server errors during the registration process.
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

/**
 * @route POST /auth/login
 * @description User login route.
 * @access Public
 * @param {Object} req.body - Expected: { email: "user@example.com", password: "userpassword" }
 * @returns {JSON} Success: { accessToken: "jwt_token_string" } (200)
 * @returns {JSON} Error: { message: "Email and password are required." } (400)
 * @returns {JSON} Error: { message: "User not found." } (400)
 * @returns {JSON} Error: { message: "Invalid credentials." } (401)
 * @returns {JSON} Error: { message: "Server error during login." } (500)
 */
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input: Check if email and password are provided.
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email in the 'users' array.
    const user = users.find(user => user.email === email);
    if (!user) {
      // User not found.
      return res.status(400).json({ message: 'User not found.' });
    }

    // Compare the provided password with the stored hashed password.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Passwords do not match.
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT if credentials are valid.
    // The payload contains user identifiers.
    // 'yourSuperSecretKey' is the secret key for signing the token.
    // IMPORTANT: In production, this secret key MUST be stored securely, typically as an environment variable,
    // and should be a long, complex, random string. It should NOT be hardcoded.
    const accessToken = jwt.sign(
      { email: user.email, id: user.id }, // Payload for the JWT
      'yourSuperSecretKey', // TODO: Replace with environment variable in production (e.g., process.env.JWT_SECRET)
      { expiresIn: '1h' } // Token expiration time (e.g., 1 hour)
    );

    // Respond with the access token.
    res.status(200).json({ accessToken });
  } catch (error) {
    // Log and respond to any server errors during the login process.
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- Authentication Middleware ---
/**
 * @middleware authenticateToken
 * @description Middleware to authenticate users based on JWT.
 *              It checks for the 'Authorization' header, expects a 'Bearer TOKEN' format,
 *              and verifies the token using `jsonwebtoken.verify`.
 *              If the token is valid, it attaches the decoded user payload to `req.user`.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticateToken = (req, res, next) => {
  // Get the 'authorization' header, which should contain the JWT.
  const authHeader = req.headers['authorization'];
  // Extract the token part (format: "Bearer TOKEN").
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is provided, return 401 (Unauthorized).
  if (token == null) {
    return res.status(401).json({ message: 'Access token is required.' });
  }

  // Verify the token.
  // 'yourSuperSecretKey' is the secret key used for verification.
  // IMPORTANT: This MUST match the secret key used for signing the token and should be an environment variable in production.
  jwt.verify(token, 'yourSuperSecretKey', (err, user) => { // TODO: Replace with environment variable
    if (err) {
      // If token is invalid or expired, return 403 (Forbidden).
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    // If token is valid, attach the decoded user payload to the request object.
    req.user = user;
    // Proceed to the next middleware or route handler.
    next();
  });
};

// --- Protected Route ---
/**
 * @route GET /api/profile
 * @description A protected route to get user profile information. Requires JWT authentication.
 * @access Private (Requires valid JWT)
 * @uses authenticateToken middleware
 * @returns {JSON} Success: { message: "This is a protected profile page.", user: { email: "user@example.com", id: 1, iat: timestamp, exp: timestamp } } (200)
 * @returns {JSON} Error: (Handled by authenticateToken middleware - 401 or 403)
 */
app.get('/api/profile', authenticateToken, (req, res) => {
  // If authenticateToken middleware calls next(), the user is authenticated.
  // req.user contains the payload from the JWT.
  res.status(200).json({
    message: 'This is a protected profile page.',
    user: req.user, // Send back the user data extracted from the token.
  });
});

// --- Generic Error Handling Middleware ---
// This middleware is designed to catch any errors that occur in the route handlers or other middleware.
// It must be the last middleware added to the app stack to function as a catch-all.
// It takes four arguments: err, req, res, next.
app.use((err, req, res, next) => {
  // Log the error stack to the console for debugging purposes.
  // In production, consider using a more robust logging solution.
  console.error(err.stack);
  // Send a generic 500 (Internal Server Error) response to the client.
  // Avoid sending detailed error information to the client in production for security reasons.
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

// --- Server Listening Logic ---
// Start the server and listen for incoming connections on the specified PORT.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
