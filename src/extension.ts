// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { cmContent } from './commit/cm-content';
import { createBranch, getAvailableBranches, deleteCurrentBranch, isBranchName } from './commit/cm-branch';
import { Branches } from './git/branches';
import { Git } from './git/git';
import { CMD_ID, CMD_MAP, getMatchCMD } from './commit/cm-ids';
import { cmReset } from './commit/cm-reset';
import { cmSprintBranch } from './commit/cm-sprint-branch';
import { cmLog } from './commit/cm-log';
import { getValue } from './lib/get-value';

export function activate(context: vscode.ExtensionContext) {
	const commitCommand = vscode.commands.registerCommand('infofe-commit.commit', async () => {
		await showCommitInput();
	});
	context.subscriptions.push(commitCommand);
}

type CommitCommand = {
	id: string;
	label: string;
	value: string;
}

async function getCommitCommand(input: string): Promise<CommitCommand | undefined> {
	const str = input.trim();
	if (!str) {
		const selectedCommand = await vscode.window.showQuickPick<CommitCommand>(
			[	
				{ id: CMD_ID.reset, label: '撤销提交 (reset, rs)', value: '' },
				{ id: CMD_ID.create, label: '创建分支 (create, cr)', value: '' },
				{ id: CMD_ID.delete, label: '删除当前分支 (delete, dl)', value: '' }, 
				{ id: CMD_ID.sprintBranch, label: '创建功能迭代分支 (sprint, sp)', value: '' },
				{ id: CMD_ID.log, label: '查看提交 (log, lg)', value: '' },
			],
			{
				placeHolder: '请选择要执行的命令',
				ignoreFocusOut: true,
			}
		);
		return selectedCommand;
	}
	
	const [cmd, value] = getMatchCMD(str);
	return {
		id: cmd || CMD_ID.commit,
		label: cmd || '提交',
		value,
	};
}

/**
 * 显示 commit 输入框并提交
 */
async function showCommitInput(): Promise<void> {
	// 获取当前工作区路径
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('未找到工作区');
		return;
	}

	const workspacePath = workspaceFolder.uri.fsPath;
	const git = new Git();
	git.setCWD(workspacePath);
	const br = new Branches(git);

	// 显示输入框
	const commitMessage = await vscode.window.showInputBox({
		prompt: '请输入提交指令，直接回车进入命令选择模式',
		ignoreFocusOut: true,
	});

	if (commitMessage === undefined) {return;}
	const cmd = await getCommitCommand(commitMessage);
	if (!cmd) {return;}
	if (cmd.id === CMD_ID.commit) {
		if (isBranchName(cmd.value)) {
			createBranch(br, cmd.value);
		} else {
			const result = cmContent(br, cmd.value);
			if (result) {
				vscode.window.showInformationMessage(
					`✅ 提交成功！${result.hash} - ${result.commitMessage}`,
				);
			}
		}
	} else if (cmd.id === CMD_ID.create) {
		createBranch(br, await getValue(cmd.value, '请输入分支名称（例如：feature/AAA-bbb）'));
	} else if (cmd.id === CMD_ID.reset) {
		cmReset(git, parseInt(cmd.value) || 1);
	} else if (cmd.id === CMD_ID.delete) {
		const availableBranches = getAvailableBranches(git);
		if (availableBranches.length === 0) {
			vscode.window.showErrorMessage('无法删除：当前仓库只有一个分支，无法删除');
		} else {
			const currentBranch = br.currentBranch;
			git.gotoTarget(availableBranches[0]);
			git.deleteBranch(currentBranch);
			vscode.window.showInformationMessage(`已删除当前分支：${currentBranch}`);
		}
	} else if (cmd.id === CMD_ID.sprintBranch) {
		cmSprintBranch(git, cmd.value);
	} else if (cmd.id === CMD_ID.log) {
		const count = cmd.value ? parseInt(cmd.value) : undefined;
		cmLog(git, count);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
