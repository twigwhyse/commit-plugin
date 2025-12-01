import { Git } from "../git/git";
import * as vscode from 'vscode';
import { getValue } from "../lib/get-value";

export async function cmSprintBranch(git: Git, defaultTargetBranch: string) {
    const postfix = '周版本分支';
    const branches = git.getBranchesByFixed('', postfix).sort((a, b) => b.localeCompare(a));
    const selectedBranch = await vscode.window.showQuickPick(branches, {
        placeHolder: '选择基于哪个周版本分支',
    });
    if (!selectedBranch) {return;}
    const targetBranch = await getValue(defaultTargetBranch, '目标分支');
    if (!targetBranch) {return;}
    git.checkoutBranchFrom(selectedBranch, targetBranch);
    vscode.window.showInformationMessage(`已切换到分支: ${targetBranch}`);
}