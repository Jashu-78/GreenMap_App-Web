// scripts/sync-firestore.js
//
// Runs automatically in GitHub Actions on every push to this repo (see
// .github/workflows/sync-firestore.yml). It reads the built-in PRODUCTS array
// straight out of Smart_Energy_Search.html and the built-in SCHEMES array out
// of Govt_Schemes.html, then writes them into Firestore (SEScollection /
// govtSchemes collections).
//
// This is what makes "edit the HTML, push to GitHub" the ONLY step needed —
// no one has to open the live app or sign in as admin for the new data to
// reach Firestore (and from there, every user's EMBER) anymore.

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Repo root — adjust here if these HTML files live in a subfolder instead of
// the repo root (e.g. path.join(repoRoot, "public", "Smart_Energy_Search.html")).
const repoRoot = path.resolve(__dirname, "..");

// Pulls a JS array literal like `var PRODUCTS = [ ... ];` straight out of an
// HTML file's inline <script> and evaluates it, without needing a bundler or
// a separate JSON file.
function extractArray(filePath, varName) {
  const html = fs.readFileSync(filePath, "utf8");
  const marker = "var " + varName + " = [";
  const markerStart = html.indexOf(marker);
  if (markerStart === -1) {
    throw new Error("Could not find `var " + varName + " = [` in " + filePath);
  }
  const arrStart = html.indexOf("[", markerStart);
  const closeMarker = html.indexOf("\n];", arrStart);
  if (closeMarker === -1) {
    throw new Error("Could not find the closing `];` for " + varName + " in " + filePath);
  }
  const arrEnd = closeMarker + 2; // include the closing bracket
  const snippet = html.slice(arrStart, arrEnd + 1);
  var fn = new Function("return " + snippet + ";");
  var result = fn();
  if (!Array.isArray(result)) {
    throw new Error(varName + " in " + filePath + " did not evaluate to an array");
  }
  return result;
}

// Firestore does not allow arrays inside arrays, so each spec row
// ["Label", "Value"] is stored as {label, value}. The pages convert it back.
function toFirestoreShape(item) {
  const data = Object.assign({}, item);
  delete data.id;
  if (Array.isArray(data.specs)) {
    data.specs = data.specs.map(function (row) {
      return Array.isArray(row) ? { label: row[0], value: row[1] } : row;
    });
  }
  return data;
}

// Items deliberately removed from the HTML lists: delete them from Firestore too.
const REMOVED = {
  govtSchemes: ["test-expired-demo"],
  SEScollection: ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"]   // the removed demo products
};

async function syncCollection(items, collectionName) {
  const batchSize = 400; // stay under Firestore's 500-write batch limit
  let written = 0;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = db.batch();
    const chunk = items.slice(i, i + batchSize);
    chunk.forEach(function (item) {
      if (!item.id) throw new Error("An item in " + collectionName + " is missing an id: " + JSON.stringify(item));
      const data = toFirestoreShape(item);
      const ref = db.collection(collectionName).doc(item.id);
      batch.set(ref, data);
    });
    await batch.commit();
    written += chunk.length;
  }
  console.log("Synced " + written + " doc(s) to \"" + collectionName + "\"");
  for (const id of (REMOVED[collectionName] || [])) {
    await db.collection(collectionName).doc(id).delete();
  }
}

async function main() {
  const products = extractArray(path.join(repoRoot, "Smart_Energy_Search.html"), "PRODUCTS");
  await syncCollection(products, "SEScollection");

  const schemes = extractArray(path.join(repoRoot, "Govt_Schemes.html"), "SCHEMES");
  await syncCollection(schemes, "govtSchemes");

  console.log("Firestore sync complete: " + products.length + " products, " + schemes.length + " schemes.");
}

main().catch(function (err) {
  console.error("Sync failed:", err);
  process.exit(1);
});
