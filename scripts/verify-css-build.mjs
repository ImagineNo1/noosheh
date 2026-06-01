import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const cssDir = join(process.cwd(), '.next', 'static', 'css');
let files;
try {
  files = (await readdir(cssDir)).filter((file) => file.endsWith('.css'));
} catch (error) {
  console.error('CSS verification failed: .next/static/css was not generated.');
  process.exit(1);
}

if (files.length === 0) {
  console.error('CSS verification failed: no CSS chunks were generated.');
  process.exit(1);
}

const contents = await Promise.all(files.map(async (file) => readFile(join(cssDir, file), 'utf8')));
const combined = contents.join('\n');

const unprocessedDirective = combined.match(/@(tailwind|apply)\b/);
if (unprocessedDirective) {
  console.error(`CSS verification failed: found unprocessed ${unprocessedDirective[0]} directive in built CSS.`);
  process.exit(1);
}

const requiredSelectors = ['.min-h-screen', '.bg-primary', '.text-muted-foreground'];
const missing = requiredSelectors.filter((selector) => !combined.includes(selector.replaceAll(':', '\\:')) && !combined.includes(selector));
if (missing.length > 0) {
  console.error(`CSS verification failed: Tailwind utilities missing from built CSS (${missing.join(', ')}).`);
  process.exit(1);
}

console.log(`CSS verification passed: ${files.length} CSS chunk(s) generated and Tailwind directives were compiled.`);
