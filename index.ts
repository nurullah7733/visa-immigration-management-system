import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env BEFORE importing app
dotenv.config({ path: path.resolve(__dirname, "./.env") });

import app from "./app.js";

const PORT: number = parseInt(process.env.PORT || "4000", 10);

app.listen(PORT, (e?: Error) => {
  if (e) {
    console.log(e);
  } else {
    console.log(`app running at http://localhost:${PORT}`);
  }
});
