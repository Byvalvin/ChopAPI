import app from './app';
import http from 'http'; // Import the HTTP module

// Create and export the server instance
export const server = http.createServer(app);

if (process.env.IS_DEV === "True") {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the app and server to use in tests
export default app;
