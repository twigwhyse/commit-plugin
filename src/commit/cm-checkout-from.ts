import { Git } from "../git/git";
import * as vscode from 'vscode';
import { getValue } from "../lib/get-value";
import { smartPickBranch } from "./smart-pick-branch";

export async function cmCheckoutFrom(git: Git, defaultTargetBranch: string) {
    const selected = await smartPickBranch(git, '选择基座分支');
    if (!selected) {return;}
    const targetBranch = await getValue(defaultTargetBranch, '目标分支');
    if (!targetBranch) {return;}
    try {
        git.checkoutBranchFrom(selected.branch, targetBranch);
        vscode.window.showInformationMessage(`已切换到分支: ${targetBranch}`);
    } catch (error: any) {
        vscode.window.showErrorMessage(`❌ 切换失败: ${error.message || error}`);
    }
}