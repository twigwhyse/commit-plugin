import { Git } from "../git/git";
import * as vscode from 'vscode';
import { OPTIONS_MAP, doName } from "./cm-option";
import { getWeekBranch } from "./infer-week-branch";

/**
 * 快速合并到 master 分支
 * @param git Git 实例
 * @param options 选项参数
 */
export async function cmMergeMaster(git: Git, options: OPTIONS_MAP | null): Promise<void> {
  await quickMergeToBranch(git, 'master', options);
}

/**
 * 快速合并到 dev 分支
 * @param git Git 实例
 * @param options 选项参数
 */
export async function cmMergeDev(git: Git, options: OPTIONS_MAP | null): Promise<void> {
  await quickMergeToBranch(git, 'dev', options);
}

/**
 * 快速合并到周版本分支（智能推断）
 * @param git Git 实例
 * @param options 选项参数
 */
export async function cmMergeWeek(git: Git, options: OPTIONS_MAP | null): Promise<void> {
  const currentBranch = git.currentBranch();
  
  // 获取周版本分支（智能推断或用户选择）
  const weekBranchInfo = await getWeekBranch(git);
  
  if (!weekBranchInfo) {
    vscode.window.showInformationMessage('已取消合并操作');
    return;
  }

  await quickMergeToBranch(git, weekBranchInfo.branch, options, weekBranchInfo.isRemote);
}

/**
 * 快速合并到指定分支的通用函数
 * @param git Git 实例
 * @param targetBranch 目标分支名称
 * @param options 选项参数
 * @param isRemoteBranch 是否是远程分支
 */
async function quickMergeToBranch(
  git: Git,
  targetBranch: string,
  options: OPTIONS_MAP | null,
  isRemoteBranch: boolean = false
): Promise<void> {
  const currentBranch = git.currentBranch();
  
  if (currentBranch === targetBranch) {
    vscode.window.showWarningMessage(`当前已在 ${targetBranch} 分支，无需合并`);
    return;
  }

  try {
    const localBranches = git.getLocalBranches();
    const localBranchName = targetBranch;

    // 如果是远程分支，需要检查本地是否存在
    if (isRemoteBranch) {
      const remoteBranchRef = `origin/${targetBranch}`;
      
      if (!localBranches.includes(localBranchName)) {
        // 本地不存在，创建跟踪远端分支的本地分支
        git.checkoutTrackBranch(remoteBranchRef, localBranchName);
      } else {
        // 本地存在，切换到该分支
        git.gotoTarget(localBranchName);
        // 目标是远端的分支，所以同步一次
        git.pullRebase();
      }
    } else {
      // 本地分支，直接切换
      if (!localBranches.includes(localBranchName)) {
        // 检查是否是远程分支（但用户没有指定 isRemoteBranch）
        const remoteBranches = git.getRemoteBranches();
        if (remoteBranches.includes(localBranchName)) {
          // 是远程分支，创建跟踪分支
          git.checkoutTrackBranch(`origin/${localBranchName}`, localBranchName);
        } else {
          vscode.window.showErrorMessage(`分支 ${localBranchName} 不存在`);
          return;
        }
      } else {
        // 本地存在，切换到该分支
        git.gotoTarget(localBranchName);
      }

      // 如果指定了 rebase 选项，先同步一次
      if (options?.rebase) {
        git.pullRebase();
      }
    }
    
    vscode.window.showInformationMessage(`已切换到分支: ${localBranchName}`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`❌ 切换失败: ${error.message || error}`);
    return;
  }

  // 执行合并
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `合并 ${currentBranch} 到 ${targetBranch}`,
      cancellable: false,
    },
    async () => {
      try {
        git.merge(currentBranch);
        vscode.window.showInformationMessage(`✅ 合并完成: ${currentBranch} -> ${targetBranch}`);
      } catch (error: any) {
        vscode.window.showErrorMessage(`❌ 合并失败: ${error.message || error}`);
        throw error;
      }
    }
  );

  // 执行后续操作
  if (options?.push) {
    git.push();
  }

  if (options?.turnBack) {
    git.gotoTarget(currentBranch);
    vscode.window.showInformationMessage(`已切换回分支: ${currentBranch}`);
  }

  if (options?.name) {
    await doName(git);
  }
}

