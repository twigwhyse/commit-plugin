import { Branches } from "../git/branches";
import { Git } from "../git/git";
import { getAvailableBranches, getLatestWeekBranch } from "./cm-branch";
import * as vscode from 'vscode';

export function cmDelete(git: Git, br: Branches) {
    const currentBranch = br.currentBranch;
    const availableBranches = getAvailableBranches(git);
    if (availableBranches.length === 0) {
        vscode.window.showErrorMessage('无法删除：当前仓库只有一个分支，无法删除');
    } else {
        // 优先尝试切换到最近的周版本分支
        const latestWeekBranch = getLatestWeekBranch(git, currentBranch);
        const targetBranch = latestWeekBranch || availableBranches[0];
        
        git.gotoTarget(targetBranch);
        git.deleteBranch(currentBranch);
        
        const message = latestWeekBranch 
            ? `已切换到周版本分支 ${targetBranch} 并删除当前分支：${currentBranch}`
            : `已切换到分支 ${targetBranch} 并删除当前分支：${currentBranch}`;
        vscode.window.showInformationMessage(message);
    }
}