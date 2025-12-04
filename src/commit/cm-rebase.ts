import { Git } from "../git/git";
import * as vscode from 'vscode';
import { smartPickBranch } from "./smart-pick-branch";



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
  const selected = await smartPickBranch(git);
  if (!selected) {return;}
  try {
    // 执行 rebase
    const targetBranch = selected.isRemote ? `origin/${selected.branch}` : selected.branch;
    try {
      git.rebase(targetBranch);
      vscode.window.showInformationMessage(`✅ Rebase: ${selected.branch}`);
    } catch (error: any) {
      vscode.window.showErrorMessage(`❌ Rebase 失败: ${error.message || error}`);
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`❌ 操作失败: ${error.message || error}`);
  }
}

