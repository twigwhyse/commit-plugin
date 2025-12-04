import { Git } from "../git/git";
import * as vscode from 'vscode';
import { smartPickBranch } from './smart-pick-branch';

const WEEK_BRANCH_POSTFIX = "周版本分支";

/**
 * 从分支名中提取迭代名
 * 例如：2511d1/refs#123-bugfix -> 2511d1
 * @param branchName 分支名称
 * @returns 迭代名，如果无法提取则返回 null
 */
export function extractIterationName(branchName: string): string | null {
  // 匹配格式：迭代名/其他内容
  // 例如：2511d1/refs#123-bugfix
  const match = branchName.match(/^([^/]+)\//);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

/**
 * 智能推断周版本分支
 * 根据当前分支名提取迭代名，然后查找对应的周版本分支
 * @param git Git 实例
 * @returns 周版本分支名称，如果无法推断则返回 null
 */
export function inferWeekBranch(git: Git): string | null {
  const currentBranch = git.currentBranch();
  
  // 提取迭代名
  const iterationName = extractIterationName(currentBranch);
  if (!iterationName) {
    return null;
  }

  // 构建周版本分支名称：迭代名 + 周版本分支
  const expectedWeekBranch = `${iterationName}${WEEK_BRANCH_POSTFIX}`;
  
  // 检查本地分支
  const localBranches = git.getLocalBranches();
  if (localBranches.includes(expectedWeekBranch)) {
    return expectedWeekBranch;
  }

  // 检查远程分支
  const remoteBranches = git.getRemoteBranches();
  if (remoteBranches.includes(expectedWeekBranch)) {
    return expectedWeekBranch;
  }

  // 保守策略：只返回精确匹配的分支
  // 如果找不到精确匹配，返回 null，让用户手动选择
  // 这样可以避免误匹配到其他分支
  return null;
}

/**
 * 获取周版本分支（智能推断或用户选择）
 * @param git Git 实例
 * @returns 周版本分支信息，如果用户取消则返回 undefined
 */
export async function getWeekBranch(git: Git): Promise<{ branch: string; isRemote: boolean } | undefined> {
  // 先尝试智能推断
  const inferredBranch = inferWeekBranch(git);
  
  if (inferredBranch) {
    // 检查是本地还是远程分支
    const localBranches = git.getLocalBranches();
    const remoteBranches = git.getRemoteBranches();
    
    const isRemote = remoteBranches.includes(inferredBranch) && !localBranches.includes(inferredBranch);
    
    // 确认是否使用推断的分支
    const confirmed = await vscode.window.showQuickPick(
      [
        { label: `使用推断的分支: ${inferredBranch}`, value: true },
        { label: '手动选择分支', value: false }
      ],
      {
        placeHolder: `已推断出周版本分支: ${inferredBranch}`,
        ignoreFocusOut: true,
      }
    );

    if (confirmed?.value === true) {
      return { branch: inferredBranch, isRemote };
    }
  }

  // 如果无法推断或用户选择手动选择，回退到用户选择
  const selected = await smartPickBranch(git, {
    placeholder: '选择周版本分支（无法自动推断，请手动选择）',
    remoteFirst: true,
  });

  if (!selected) {
    return undefined;
  }

  return {
    branch: selected.branch,
    isRemote: selected.isRemote,
  };
}

