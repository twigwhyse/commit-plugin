import { Git } from "../git/git";
import * as vscode from "vscode";

export interface BranchItem {
  label: string;
  branch: string;
  isRemote: boolean;
}

export async function smartPickBranch(
  git: Git,
  placeholder?: string
): Promise<BranchItem | undefined> {
  // 显示进度提示
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "正在获取远程分支信息...",
      cancellable: false,
    },
    async () => {
      // 执行 git fetch
      git.fetch();
    }
  );

  const currentBranch = git.currentBranch();
  const localBranches = git.getLocalBranches();
  const remoteBranches = git.getRemoteBranches();
  const postfix = "周版本分支";

  // 1. 当前分支的 origin 分支
  const currentOriginBranch: BranchItem[] = [];
  if (remoteBranches.includes(currentBranch)) {
    currentOriginBranch.push({
      label: `$(git-branch) origin/${currentBranch}`,
      branch: currentBranch,
      isRemote: true,
    });
  }

  // 2. origin 中的周版本分支（最近的5个）
  const weekBranches = remoteBranches
    .filter((branch) => branch.includes(postfix))
    .map((b) => b.trim())
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 5)
    .map((branch) => ({
      label: `$(calendar) origin/${branch}`,
      branch: branch,
      isRemote: true,
    }));

  // 3. 其他本地分支按时间倒序排列（排除当前分支）
  const otherLocalBranches = localBranches
    .filter((branch) => branch !== currentBranch)
    .map((b) => b.trim())
    .sort((a, b) => b.localeCompare(a))
    .map((branch) => ({
      label: `$(git-branch) ${branch}`,
      branch: branch,
      isRemote: false,
    }));

  // 4. 其他 origin 中的分支（排除已包含的分支）
  const includedBranches = new Set([
    currentBranch,
    ...weekBranches.map((w) => w.branch),
  ]);
  const otherRemoteBranches = remoteBranches
    .filter((branch) => !includedBranches.has(branch))
    .map((branch) => ({
      label: `$(cloud) origin/${branch}`,
      branch: branch,
      isRemote: true,
    }));

  // 合并所有分支，按优先级排序
  const allBranches: BranchItem[] = [
    ...currentOriginBranch,
    ...weekBranches,
    ...otherLocalBranches,
    ...otherRemoteBranches,
  ];

  if (allBranches.length === 0) {
    vscode.window.showInformationMessage("没有可用的分支进行 rebase");
    return;
  }

  // 显示分支选择列表
  const selected = await vscode.window.showQuickPick(allBranches, {
    placeHolder: placeholder ?? '选择分支',
    ignoreFocusOut: true,
  });

  return selected;
}
