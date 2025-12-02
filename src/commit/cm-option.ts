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

export async function cmOption(git: Git, option: string) {
  const options = optionParse(option);
  
  if (options.push) {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Git Push',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0, message: '正在推送代码...' });
        git.push();
        progress.report({ increment: 100, message: '推送完成' });
      }
    );
  }
  
  if (options.rebase) {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Git Rebase',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0, message: '正在获取远程更新...' });
        git.fetch();
        progress.report({ increment: 50, message: '正在 rebase...' });
        git.rebaseOrigin();
        progress.report({ increment: 100, message: 'Rebase 完成' });
      }
    );
  }
  
  if (options.build) {
    const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Git Commit');
    terminal.show();
    terminal.sendText('npm run build');
  }
}