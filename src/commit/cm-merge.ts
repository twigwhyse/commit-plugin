import { Git } from "../git/git";
import * as vscode from 'vscode';
import { smartPickBranch } from "./smart-pick-branch";
import { OPTIONS_MAP } from "./cm-option";

export async function cmMerge(git: Git, options: OPTIONS_MAP | null, defaultTargetBranch: string) {
    let targetBranch = defaultTargetBranch;
    let isRemoteBranch = false;
    const currentBranch = git.currentBranch();
    
    if (!targetBranch) {
        const selected = await smartPickBranch(git, '选择目标分支（把当前分支合并到目标分支）');
        if (!selected) {return;}
        targetBranch = selected.branch;
        isRemoteBranch = selected.isRemote;
    } else {
        // 检查是否是远端分支格式 (origin/xxx)
        if (targetBranch.startsWith('origin/')) {
            isRemoteBranch = true;
            targetBranch = targetBranch.replace(/^origin\//, '');
        }
    }
    
    try {
        const localBranches = git.getLocalBranches();
        const localBranchName = targetBranch;
        
        // 如果是远端分支，需要检查本地是否存在
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
                // 本地不存在，创建新分支
                git.checkoutBranch(localBranchName);
            } else {
                // 本地存在，切换到该分支
                git.gotoTarget(localBranchName);
            }

            if (options?.rebase) {
                git.pullRebase();
            }
        }
        
        vscode.window.showInformationMessage(`已切换到分支: ${localBranchName}`);
    } catch (error: any) {
        vscode.window.showErrorMessage(`❌ 切换失败: ${error.message || error}`);
    }

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Merge: ${currentBranch}`,
        cancellable: false,
    }, async () => {
        git.merge(currentBranch);
    });
}