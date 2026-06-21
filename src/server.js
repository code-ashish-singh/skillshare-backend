import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect DB then start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 SkillShare API running in ${process.env.NODE_ENV} mode`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🔍 Health: http://localhost:${PORT}/health\n`);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! Shutting down...");
    console.error(err.name, err.message);
    server.close(() => process.exit(1));
  });

  // Graceful shutdown on SIGTERM
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Graceful shutdown...");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  });
});
