import "dotenv/config"; // <--- MUST BE FIRST

import { app } from "./app";

const port = process.env.PORT || 4000;

console.log("DATABASE_URL runtime:", process.env.DATABASE_URL);

app.listen(port, () => {
  
  console.log(`API running on http://localhost:${port}`);
});