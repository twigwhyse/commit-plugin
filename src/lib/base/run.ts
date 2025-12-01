import { exec, execSync } from 'child_process';
import { join } from 'path';
export const run = (cmd: string, cwd?: string) => {
  try {
    return execSync(cmd, { cwd }).toString('utf8');
  } catch (err: any) {
    console.log(`run "${cmd}" fail`);
    if ('stdout' in err) {
      throw new Error(err.stdout.toString('utf-8'));
    } else {
      throw err;
    }
  }
};
export const logRun = (cmd: string, logStr = '', cwd?: string) => {
  console.log(logStr || cmd);
  run(cmd, cwd);
};

function joinShellArgs(args: string[]) {
  return args
    .map(v => {
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        return v;
      } else if (v.includes(' ')) {
        return '"' + v + '"';
      }
      return v;
    })
    .join(' ');
}

export function shellFile(shellFile: string, args: string[], cwd?: string) {
  const argsStr = joinShellArgs(args);
  const task = exec(`bash "${shellFile}" ${argsStr}`, { cwd: cwd });
  task.stdout?.on('data', chunk => {
    process.stdout.write(chunk.toString('utf8'));
  });
  task.stderr?.on('data', chunk => {
    process.stderr.write(chunk.toString('utf8'));
  });
  return task;
}

export function shellRun(cmd: string, args: string[], cwd?: string) {
  return shellFile(join(__dirname, '../../../../shell', cmd), args, cwd);
}

export function asyncRun(cmd: string, cwd?: string) {
  console.log(cwd, cmd);
  exec(cmd, { cwd }).stdout?.on('data', chunk => {
    process.stdout.write(chunk.toString('utf8'));
  });
}
