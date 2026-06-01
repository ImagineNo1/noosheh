import { rmSync } from 'node:fs';
import { join } from 'node:path';

const nextDir = join(process.cwd(), '.next');

try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log('Removed stale .next build output before compiling CSS.');
} catch (error) {
  console.error('Failed to remove stale .next build output.');
  console.error(error);
  process.exit(1);
}
