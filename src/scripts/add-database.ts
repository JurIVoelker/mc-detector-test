import * as fs from "fs";
import * as path from "path";

const dbFolderPath = path.join(__dirname, "../../prisma/db");
const dbFilePath = path.join(dbFolderPath, "database.db");

// Ensure the folder exists
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
  console.log(`Created folder: ${dbFolderPath}`);
}

// Ensure the database file exists
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, "");
  console.log(`Created database file: ${dbFilePath}`);
} else {
  console.log(`Database file already exists: ${dbFilePath}`);
}
