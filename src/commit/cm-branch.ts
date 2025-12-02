import { Branches } from '../git/branches';
import { Git } from '../git/git';
import * as vscode from 'vscode';

export function isBranchName(content: string): boolean {
    if (content.includes('/')) {
        return true;
    }
    return false;
}

/**
 * 创建分支
 * @param br Branches 实例
 * @param branchName 分支名称
 * @param forceCreate 是否强制创建（即使不符合分支格式也创建），默认为 false
 */
export function createBranch(br: Branches, branchName: string): void {
  if (!branchName || !branchName.trim()) {
    throw new Error('分支名称不能为空');
  }
  const trimmedBranchName = branchName.trim();
  br.checkoutBranch(trimmedBranchName);
  vscode.window.showInformationMessage(`已切换到分支: ${trimmedBranchName}`); 
}

/**
 * 获取可切换的分支列表（排除当前分支）
 * @param git Git 实例
 * @returns 可切换的分支列表
 */
export function getAvailableBranches(git: Git): string[] {
  const currentBranch = git.currentBranch();
  const allBranches = git.getLocalBranches();
  
  // 排除当前分支
  return allBranches.filter(branch => branch !== currentBranch);
}

/**
 * 获取最近的周版本分支（排除当前分支）
 * @param git Git 实例
 * @param currentBranch 当前分支名称
 * @returns 最近的周版本分支，如果没有则返回 null
 */
export function getLatestWeekBranch(git: Git, currentBranch: string): string | null {
  const postfix = '周版本分支';
  
  // 如果当前分支包含 '/'，尝试获取相同前缀的周版本分支
  if (currentBranch.includes('/')) {
    const prefix = currentBranch.split('/')[0];
    const weekBranches = git.getBranchesByFixed(prefix + '/', postfix)
      .filter(branch => branch !== currentBranch); // 排除当前分支
    if (weekBranches.length > 0) {
      // 按字典序倒序排序，获取最新的
      return weekBranches.sort((a, b) => b.localeCompare(a))[0];
    }
  }
  
  // 如果没有找到同前缀的，尝试获取所有周版本分支（排除当前分支）
  const allWeekBranches = git.getBranchesByFixed('', postfix)
    .filter(branch => branch !== currentBranch); // 排除当前分支
  if (allWeekBranches.length > 0) {
    // 按字典序倒序排序，获取最新的
    return allWeekBranches.sort((a, b) => b.localeCompare(a))[0];
  }
  
  return null;
}

/**
 * 删除当前分支
 * @param git Git 实例
 * @param targetBranch 要切换到的目标分支
 * @param currentBranch 当前分支名称
 */
export function deleteCurrentBranch(git: Git, targetBranch: string, currentBranch: string): void {
  if (!targetBranch || !targetBranch.trim()) {
    throw new Error('目标分支不能为空');
  }
  
  if (targetBranch === currentBranch) {
    throw new Error('不能切换到当前分支');
  }
  
  // 先切换到目标分支
  git.gotoTarget(targetBranch.trim());
  
  // 然后删除当前分支
  git.deleteBranch(currentBranch);
}
