import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, {
      recursive: true,
    });
  }
  return dirPath;
}

export function ensureFile(filePath: string, value: string = '') {
  if (!existsSync(filePath)) {
    ensureDir(dirname(filePath));
    writeFileSync(filePath, value);
  } else if (readFileSync(filePath).toString().trim().length === 0) {
    writeFileSync(filePath, value);
  }
  return filePath;
}
