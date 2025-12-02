import { Git } from "../git/git";
import * as vscode from 'vscode';

function optionParse(options: string) {
  let str = options.trim();
  const optionMap = {
    push: false,
    rebase: false,
    build: false,
  };
  function handleOption(key: keyof typeof optionMap) {
    if (str.includes(key)) {
      optionMap[key] = true;
      str = str.replace(key, '').trim();
    }
  }
  function handleOptionPartialMatch(key: keyof typeof optionMap) {
    const prefix = key.slice(0, 1);
    if (prefix && str.includes(prefix)) {
      optionMap[key] = true;
      str = str.replace(prefix, '').trim();
    }
  }

  // 全匹配
  handleOption('push');
  handleOption('rebase');
  handleOption('build');

  // 简写匹配
  handleOptionPartialMatch('push');
  handleOptionPartialMatch('rebase');
  handleOptionPartialMatch('build');

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