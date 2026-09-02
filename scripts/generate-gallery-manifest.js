const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const imageDirectory = path.join(projectRoot, "assets", "images");
const manifestPath = path.join(imageDirectory, "gallery-manifest.json");
const supportedExtensions = new Set([".webp", ".jpg", ".jpeg", ".png"]);
const reservedUiAssets = new Set(["krin-logo.webp", "tab-logo.webp"]);

const humanize = (filename) => {
  const corrections = { chilren: "children", writting: "writing" };
  return path
    .parse(filename)
    .name
    .split(/[-_]+/)
    .map((word) => corrections[word.toLowerCase()] || word)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const categoryFor = (filename) => {
  const name = filename.toLowerCase();
  if (name.includes("prophetic")) return "Prophetic Kids";
  if (name.includes("robotic")) return "Learning & Robotics";
  if (
    name.includes("aunt") ||
    name.includes("tope") ||
    name.includes("founder")
  )
    return "Our Team";
  return "After School Haven";
};

const items = fs
  .readdirSync(imageDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((filename) =>
    supportedExtensions.has(path.extname(filename).toLowerCase()),
  )
  .filter((filename) => !reservedUiAssets.has(filename))
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
  .map((filename) => {
    const title = humanize(filename);
    return {
      id: path.parse(filename).name,
      title,
      alt: title,
      category: categoryFor(filename),
      image: { url: `assets/images/${filename}` },
    };
  });

fs.writeFileSync(
  manifestPath,
  `${JSON.stringify({ items }, null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${path.relative(projectRoot, manifestPath)} with ${items.length} images.`);
