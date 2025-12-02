import { Git } from "../git/git";
import * as vscode from 'vscode';

interface BranchItem {
  label: string;
  description?: string;
  branch: string;
  isRemote: boolean;
}

/**
 * 分支 rebase 功能
 * 会先触发 git fetch，然后显示分支选择列表
 * 分支推荐顺序：
 * 1. 当前分支的 origin 中的分支
 * 2. origin 中的周版本分支，最近的5个周版本分支
 * 3. 其他本地分支按时间倒序排列
 * 4. 其他origin中的分支
 */
export async function cmRebase(git: Git): Promise<void> {
  try {
    // 显示进度提示
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "正在获取远程分支信息...",
      cancellable: false
    }, async () => {
      // 执行 git fetch
      git.fetch();
    });

    const currentBranch = git.currentBranch();
    const localBranches = git.getLocalBranches();
    const remoteBranches = git.getRemoteBranches();
    const postfix = '周版本分支';

    // 1. 当前分支的 origin 分支
    const currentOriginBranch: BranchItem[] = [];
    if (remoteBranches.includes(currentBranch)) {
      currentOriginBranch.push({
        label: `$(git-branch) ${currentBranch} (origin)`,
        description: '当前分支的远程分支',
        branch: currentBranch,
        isRemote: true
      });
    }

    // 2. origin 中的周版本分支（最近的5个）
    const weekBranches = remoteBranches
      .filter(branch => branch.includes(postfix))
      .map(branch => ({
        branch,
        time: git.getBranchCommitTime(branch, true)
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5)
      .map(item => ({
        label: `$(calendar) ${item.branch}`,
        description: '周版本分支',
        branch: item.branch,
        isRemote: true
      }));

    // 3. 其他本地分支按时间倒序排列（排除当前分支）
    const otherLocalBranches = localBranches
      .filter(branch => branch !== currentBranch)
      .map(branch => ({
        branch,
        time: git.getBranchCommitTime(branch, false)
      }))
      .sort((a, b) => b.time - a.time)
      .map(item => ({
        label: `$(git-branch) ${item.branch}`,
        description: '本地分支',
        branch: item.branch,
        isRemote: false
      }));

    // 4. 其他 origin 中的分支（排除已包含的分支）
    const includedBranches = new Set([
      currentBranch,
      ...weekBranches.map(w => w.branch)
    ]);
    const otherRemoteBranches = remoteBranches
      .filter(branch => !includedBranches.has(branch))
      .map(branch => ({
        label: `$(cloud) ${branch} (origin)`,
        description: '远程分支',
        branch: branch,
        isRemote: true
      }));

    // 合并所有分支，按优先级排序
    const allBranches: BranchItem[] = [
      ...currentOriginBranch,
      ...weekBranches,
      ...otherLocalBranches,
      ...otherRemoteBranches
    ];

    if (allBranches.length === 0) {
      vscode.window.showInformationMessage('没有可用的分支进行 rebase');
      return;
    }

    // 显示分支选择列表
    const selected = await vscode.window.showQuickPick(allBranches, {
      placeHolder: `选择要 rebase 到当前分支 ${currentBranch} 的目标分支`,
      ignoreFocusOut: true
    });

    if (!selected) {
      return;
    }

    // 执行 rebase
    const targetBranch = selected.isRemote ? `origin/${selected.branch}` : selected.branch;
    
    try {
      git.rebase(targetBranch);
      vscode.window.showInformationMessage(`✅ 已成功 rebase 到 ${selected.branch}`);
    } catch (error: any) {
      vscode.window.showErrorMessage(`❌ Rebase 失败: ${error.message || error}`);
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`❌ 操作失败: ${error.message || error}`);
  }
}

