import * as vscode from 'vscode';
import { Git } from '../git/git';

/**
 * 切换分支
 * @param git Git 实例
 * @param branchName 分支名称（可选，如果未提供则调用 git.checkout 显示 VS Code 的分支选择面板）
 */
export async function cmCheckout(git: Git, branchName?: string): Promise<void> {
  if (branchName && branchName.trim()) {
    // 如果提供了分支名称，使用自己的 Git 实例来切换分支
    const trimmedBranchName = branchName.trim();
    git.gotoTarget(trimmedBranchName);
    vscode.window.showInformationMessage(`已切换到分支: ${trimmedBranchName}`);
  } else {
    // 如果没有提供分支名称，直接调用 git.checkout，VS Code 会自动显示分支选择面板
    await vscode.commands.executeCommand('git.checkout');
  }
}

