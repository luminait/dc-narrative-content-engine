#!/usr/bin/env node
/**
 * Updates the directory tree block inside .aiassistant/rules/ai_assistant_rules.md
 * - Regenerates the project file tree (dirs first, then files)
 * - Preserves any inline "# Comment" annotations from the existing tree by matching full paths
 *
 * Assumptions:
 * - The tree block starts with a single line "<repoName>/" (e.g., "dc-narrative-content-engine/"),
 *   followed by lines using the usual ASCII/Unicode tree characters (│ ├── └──).
 * - The block ends at the first blank line after the tree or the next section (e.g., "3. Always:")
 *
 * Safe defaults:
 * - Skips large/irrelevant folders (node_modules, .git, .next, etc.)
 * - Keeps comments aligned with at least one space before the '#'.
 */

const fs = require("fs");
const path = require("path");

const RULES_PATH = path.join(".aiassistant", "rules", "ai_assistant_rules.md");
const REPO_ROOT = process.cwd();
const ROOT_LABEL = path.basename(REPO_ROOT); // e.g., "dc-narrative-content-engine"

// Directories/files to ignore (top-level and nested). Add more as needed.
const IGNORE = new Set([
  ".git",
  "node_modules",
  ".next",
  ".turbo",
  ".DS_Store",
  "dist",
  "build",
  "out",
  "coverage",
  ".vercel",
  ".husky", // keep if you don’t want the hook listed
  "pnpm-lock.yaml", // optional
]);

/** Utilities */
const isIgnored = (name) => IGNORE.has(name);
const isDir = (p) => {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
};

function readRulesFile() {
  if (!fs.existsSync(RULES_PATH)) {
    console.error(`Could not find ${RULES_PATH}`);
    process.exit(1);
  }
  return fs.readFileSync(RULES_PATH, "utf8");
}

/**
 * Parse the current tree block to capture inline "# ..." comments
 * Returns a Map<fullPath, commentText>
 */
function parseExistingComments(treeBlock) {
  const commentMap = new Map();
  const lines = treeBlock.split("\n");

  // Stack of path segments; index by depth
  const stack = [ROOT_LABEL];

  for (const line of lines) {
    if (line.trim() === `${ROOT_LABEL}/`) {
      // root line
      continue;
    }

    // Match a tree line: prefixes of "│   " or "    " then "├── " or "└── " followed by the entry
    const m = line.match(/^([│\s]*)(?:├──|└──)\s+(.*)$/);
    if (!m) continue;

    const [, prefix, rest] = m;

    // Depth is the number of 4-char groups in prefix (either "│   " or "    ")
    const depth = Math.floor(prefix.length / 4) + 1; // +1 because root is depth 0

    // Split off comment (first '#' that is not inside filename)
    const hashIdx = rest.indexOf("#");
    const namePart = hashIdx >= 0 ? rest.slice(0, hashIdx).trim() : rest.trim();
    const comment = hashIdx >= 0 ? rest.slice(hashIdx + 1).trim() : null;

    // Adjust stack to depth
    stack.length = depth;
    stack[depth] = namePart.replace(/\s+$/, "");

    // Build full path
    const fullPath = stack.slice(0, depth + 1).join("/");

    if (comment) {
      commentMap.set(fullPath, comment);
    }
  }

  return commentMap;
}

/**
 * Generate a tree of the current repo, returning { lines, fullPaths }
 * lines: array of printable tree lines
 * fullPaths: array of full paths aligned with lines for comment merge
 */
function buildTree(rootDir = REPO_ROOT) {
  function list(dir) {
    const entries = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => !isIgnored(d.name))
      .map((d) => ({ name: d.name, dirent: d }))
      // dirs first, then files; alphabetical
      .sort((a, b) => {
        const aIsDir = a.dirent.isDirectory();
        const bIsDir = b.dirent.isDirectory();
        if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return entries;
  }

  const lines = [`${ROOT_LABEL}/`];
  const fullPaths = [`${ROOT_LABEL}/`];

  function walk(dir, prefixParts = []) {
    const items = list(dir);
    items.forEach((item, idx) => {
      const isLast = idx === items.length - 1;
      const connector = isLast ? "└──" : "├──";
      const linePrefix = prefixParts.join("") + connector + " ";
      const currFullPath = [ROOT_LABEL].concat(
        path
          .relative(REPO_ROOT, path.join(dir, item.name))
          .split(path.sep)
          .filter(Boolean)
      );
      const printable = linePrefix + item.name;

      lines.push(printable);
      fullPaths.push(currFullPath.join("/"));

      if (item.dirent.isDirectory()) {
        const nextPrefixParts = prefixParts.concat(isLast ? "    " : "│   ");
        walk(path.join(dir, item.name), nextPrefixParts);
      }
    });
  }

  walk(rootDir, []);
  return { lines, fullPaths };
}

/**
 * Find and replace the existing tree block inside the markdown file
 * We detect the block starting at a line exactly equal to "<repo>/" and
 * ending at the first blank line (or when a non-tree section begins).
 */
function replaceTreeBlock(md, newBlock, commentMap) {
  const lines = md.split("\n");
  const startIdx = lines.findIndex((l) => l.trim() === `${ROOT_LABEL}/`);
  if (startIdx === -1) {
    console.error(
      `Could not find a line "${ROOT_LABEL}/" in ${RULES_PATH}. Ensure your rules file contains the root label line.`
    );
    process.exit(1);
  }

  // Find end of tree: first blank line after start OR when indentation/tree chars stop
  let endIdx = startIdx + 1;
  for (; endIdx < lines.length; endIdx++) {
    const t = lines[endIdx];
    const isTreeLine =
      t.trim() === "" ? false : /^(?:[│\s]*(?:├──|└──)\s+)/.test(t);
    if (!isTreeLine) break;
  }

  // Merge comments: walk the newBlock and append any known comments
  const newLines = newBlock.split("\n");
  const merged = [];
  // Build full paths in lockstep with new tree lines
  // We’ll reconstruct full paths similarly to buildTree
  const stack = [ROOT_LABEL];
  merged.push(newLines[0]); // root line

  for (let i = 1; i < newLines.length; i++) {
    const ln = newLines[i];
    const m = ln.match(/^([│\s]*)(?:├──|└──)\s+(.*)$/);
    if (!m) {
      merged.push(ln);
      continue;
    }
    const [, prefix, name] = m;
    const depth = Math.floor(prefix.length / 4) + 1;
    stack.length = depth;
    stack[depth] = name.trim();
    const fullPath = stack.slice(0, depth + 1).join("/");

    const comment = commentMap.get(fullPath);
    if (comment) {
      merged.push(`${ln}  # ${comment}`);
    } else {
      merged.push(ln);
    }
  }

  // Replace in file
  const updated = [
    ...lines.slice(0, startIdx),
    ...merged,
    ...lines.slice(endIdx),
  ].join("\n");

  return updated;
}

function main() {
  const md = readRulesFile();

  // Extract the existing block to learn comments
  const startIdx = md.split("\n").findIndex((l) => l.trim() === `${ROOT_LABEL}/`);
  if (startIdx === -1) {
    console.error(
      `Could not find a line "${ROOT_LABEL}/" in ${RULES_PATH}. Ensure your rules file contains the root label line.`
    );
    process.exit(1);
  }
  // Find end (same logic as replace)
  const mdLines = md.split("\n");
  let endIdx = startIdx + 1;
  for (; endIdx < mdLines.length; endIdx++) {
    const t = mdLines[endIdx];
    const isTreeLine =
      t.trim() === "" ? false : /^(?:[│\s]*(?:├──|└──)\s+)/.test(t);
    if (!isTreeLine) break;
  }
  const existingTreeBlock = mdLines.slice(startIdx, endIdx).join("\n");
  const commentMap = parseExistingComments(existingTreeBlock);

  // Build fresh tree (from current working directory)
  const { lines: treeLines } = buildTree(REPO_ROOT);
  const newBlock = treeLines.join("\n");

  const updatedMd = replaceTreeBlock(md, newBlock, commentMap);
  fs.writeFileSync(RULES_PATH, updatedMd, "utf8");

  // Stage the file so the commit includes the refresh
  try {
    require("child_process").execSync(
      `git add ${JSON.stringify(RULES_PATH)}`,
      { stdio: "ignore" }
    );
  } catch {
    // non-fatal
  }

  console.log(
    `Updated file tree in ${RULES_PATH} (preserved ${commentMap.size} comment(s)).`
  );
}

main();
