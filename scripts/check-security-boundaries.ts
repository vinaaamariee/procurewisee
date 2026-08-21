import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const requiredChecks: Array<[string, RegExp[]]> = [
  ["src/app/actions/catalog.ts", [/createCatalogProduct[\s\S]*?requireRole\("Procurement Officer"\)/, /deleteCatalogProduct[\s\S]*?requireRole\("Procurement Officer"\)/]],
  ["src/app/actions/rfq.ts", [/createRfq[\s\S]*?requireRole\("Procurement Officer"\)/, /publishRfq[\s\S]*?requireRole\("Procurement Officer"\)/]],
  ["src/app/actions/quotes.ts", [/submitQuoteAction[\s\S]*?requireRole\('Procurement Officer'\)/]],
  ["src/app/actions/receipt.ts", [/createReceiptAction[\s\S]*?requireRole\("Procurement Officer"\)/]],
  ["src/app/actions/workflow.ts", [/saveWorkflowConfigAction[\s\S]*?requireRole\("Administrative Approver"\)/]],
  ["src/app/actions/notifications.ts", [/getNotificationsAction\(\)[\s\S]*?getAuthenticatedUser\(\)/, /markNotificationAsReadAction[\s\S]*?getAuthenticatedUser\(\)/]],
  ["src/app/actions/ppmp.ts", [/oldPpmp\.preparedById !== profile\.id/, /documentUrl\.startsWith\(`\$\{profile\.id\}\//]],
];

const failures: string[] = [];
for (const [file, patterns] of requiredChecks) {
  const source = readFileSync(resolve(root, file), "utf8");
  for (const pattern of patterns) {
    if (!pattern.test(source)) failures.push(`${file}: missing ${pattern}`);
  }
}

const storageSetup = readFileSync(resolve(root, "scripts/setup-storage-bucket.ts"), "utf8");
if (/public:\s*true/.test(storageSetup)) failures.push("PPMP bucket must not be public");

const uploader = readFileSync(resolve(root, "src/components/ppmp/PpmpDocumentUpload.tsx"), "utf8");
if (/getPublicUrl\(/.test(uploader)) failures.push("PPMP documents must not use public URLs");
if (!/createSignedUrl\(/.test(uploader)) failures.push("PPMP documents must use signed URLs");

if (failures.length > 0) {
  console.error("Security boundary check failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Security boundary check passed.");
