import * as fs from "fs";
import * as path from "path";

const targetDir = path.join(__dirname, "../.git");

function searchFile(filePath: string) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > 10 * 1024 * 1024) return; // Skip large pack files to avoid memory crash
    const content = fs.readFileSync(filePath, "utf-8");
    if (content.includes("tfswokhkuxwvpcpxekso") || content.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")) {
      console.log(`Found match in: ${filePath}`);
      // Print the matching lines
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (line.includes("tfswokhkuxwvpcpxekso") || line.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")) {
          console.log(`  Line ${idx + 1}: ${line.trim().substring(0, 200)}`);
        }
      });
    }
  } catch (e) {
    // Ignore binary decoding issues or read errors
  }
}

function traverse(dir: string) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        traverse(fullPath);
      } else {
        searchFile(fullPath);
      }
    }
  } catch (e) {
    // Ignore dir read errors
  }
}

console.log("Searching .git directory for Supabase secrets...");
traverse(targetDir);
console.log("Search complete.");
