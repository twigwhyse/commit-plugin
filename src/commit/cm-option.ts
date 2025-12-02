import { Git } from "../git/git";
import * as vscode from 'vscode';

function optionParse(options: string) {
  const optionMap = {
    push: false,
    rebase: false,
    build: false,
  };
  if (options.includes('push') || options.includes('p')) {
    optionMap.push = true;
  }
  if (options.includes('rebase') || options.includes('r')) {
    optionMap.rebase = true;
  }
  if (options.includes('build') || options.includes('b')) {
    optionMap.build = true;
  }
  return optionMap;
}

export function cmOption(git: Git, option: string) {
  const options = optionParse(option);
  if (options.push) {
    git.push();
  }
  if (options.rebase) {
    git.fetch();
    git.rebaseOrigin();
  }
  if (options.build) {
    const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Git Commit');
    terminal.show();
    terminal.sendText('npm run build');
  }
}