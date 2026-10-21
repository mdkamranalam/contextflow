import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app.js";
import { initDatabase } from "./db/database.js";

const PORT = parseInt(process.env.PORT || "3001", 10);

// Initialize SQLite database
initDatabase();

const app = createApp();

app.listen(PORT, () => {
  console.log(`ContextFlow backend listening on http://localhost:${PORT}`);
});
