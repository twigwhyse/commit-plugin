import { Git } from "../git/git";
import * as vscode from 'vscode';

export async function cmLog(git: Git, count?: number) {
  try {
    // 调用 GitLens 的 history 命令来查看日志
    await vscode.commands.executeCommand('gitlens.gitCommands.history', git.currentBranch());
  } catch (error) {
    // 如果 GitLens 未安装或命令不可用，回退到原来的实现
    const logCount = count || 10;
    const logOutput = git.getLog(logCount);
    
    if (!logOutput) {
      vscode.window.showInformationMessage('暂无提交记录');
      return;
    }
    
    // 在输出面板中显示提交日志
    const outputChannel = vscode.window.createOutputChannel('Git Commit Log');
    outputChannel.clear();
    outputChannel.appendLine('=== Git 提交日志 ===');
    outputChannel.appendLine('');
    outputChannel.append(logOutput);
    outputChannel.show(true);
  }
}

