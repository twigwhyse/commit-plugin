// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { cmContent } from './commit/cm-content';
import { createBranch, isBranchName } from './commit/cm-branch';
import { Branches } from './git/branches';
import { Git } from './git/git';
import { CMD_ID, CommitCommand, generateCommitCommand } from './commit/cm-ids';
import { cmReset } from './commit/cm-reset';
import { cmLog } from './commit/cm-log';
import { cmCheckout } from './commit/cm-checkout';
import { cmCheckoutFrom } from './commit/cm-checkout-from';
import { cmUp } from './commit/cm-up';
import { cmRebase } from './commit/cm-rebase';
import { getValue } from './lib/get-value';
import { cmOption, optionParse, OPTIONS_DEFINED } from './commit/cm-option';
import { cmDelete } from './commit/cm-delete';
import { cmMerge } from './commit/cm-merge';
import { cmPull } from './commit/cm-pull';

export function activate(context: vscode.ExtensionContext) {
	const commitCommand = vscode.commands.registerCommand('infofe-commit.commit', async () => {
		await showCommitInput();
	});
	context.subscriptions.push(commitCommand);
}

async function selectCommitCommand(): Promise<CommitCommand | undefined> {
		const selectedCommand = await vscode.window.showQuickPick<CommitCommand>(
		[	
			{ id: '', label: 'Git 操作', value: '', kind: vscode.QuickPickItemKind.Separator },
			{ id: CMD_ID.pull, label: 'git:拉取代码 (pull, pl) [rebase/merge]', value: '' },
			{ id: CMD_ID.merge, label: 'git:合并分支 (merge, mg) [option: -rtp]', value: '' },
			{ id: CMD_ID.checkoutFrom, label: 'git:从指定分支创建新分支 (checkoutFrom, ck)', value: '' },
			{ id: CMD_ID.create, label: 'git:创建新分支 (create, cr)', value: '' },
			{ id: CMD_ID.checkout, label: 'git:切换分支 (checkout, cko)', value: '' },
			{ id: CMD_ID.rebase, label: 'git:分支变基 (rebase, rb)', value: '' },
			{ id: CMD_ID.delete, label: 'git:删除当前分支 (delete, dl)', value: '' },
			{ id: CMD_ID.log, label: 'git:查看提交 (log, lg)', value: '' },
			{ id: CMD_ID.reset, label: 'git:撤销提交 (reset, rs)', value: '' },
			{ id: '', label: '版本管理', value: '', kind: vscode.QuickPickItemKind.Separator },
			{ id: CMD_ID.up, label: '版本:升级版本号d (up, version) [option: -rpb]', value: '' },
			{ id: '', label: '快捷参数', value: '', kind: vscode.QuickPickItemKind.Separator },
			{ id: CMD_ID.option, label: 'Push 到远端分支 (push, -p)', value: OPTIONS_DEFINED.push },
			{ id: CMD_ID.option, label: '提交完成之后执行构建命令 (build, -b)', value: OPTIONS_DEFINED.build },
			{ id: CMD_ID.option, label: 'Rebase 的方式同步一次远端分支 (rebase, -r)', value: OPTIONS_DEFINED.rebase },
			{ id: CMD_ID.option, label: '合并完成之后切换回原分支 (turnBack, -t)', value: OPTIONS_DEFINED.turnBack },
			{ id: CMD_ID.option, label: '复制当前分支的名字到剪贴板 (name, -n)', value: OPTIONS_DEFINED.name },
		],
		{
			placeHolder: '请选择要执行的命令',
			ignoreFocusOut: true,
		}
	);
	// 过滤掉分隔符，确保只返回有效的命令
	if (selectedCommand && selectedCommand.kind === vscode.QuickPickItemKind.Separator) {
		return undefined;
	}
	return selectedCommand;
}

async function getCommitCommand(input: string): Promise<CommitCommand | undefined> {
	const str = input.trim();
	if (!str) {
		return await selectCommitCommand();
	}
	return generateCommitCommand(str);
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
	const [options, value] = optionParse(commitMessage);
	if (!value && options) {
		await cmOption(git, options);
		return;
	}
	
	const cmd = await getCommitCommand(value);
	if (!cmd) {return;}
	if (cmd.id === CMD_ID.commit && cmd.value) {
		const cmdValue = cmd.value || '';
		if (isBranchName(cmdValue)) {
			createBranch(br, cmdValue);
		} else {
			cmContent(git, br, cmdValue, options);
		}
	} else if (cmd.id === CMD_ID.create) {
		createBranch(br, await getValue(cmd.value || '', '请输入分支名称(例如: feature/AAA-bbb)'));
	} else if (cmd.id === CMD_ID.checkout) {
		await cmCheckout(git, cmd.value || '');
	} else if (cmd.id === CMD_ID.reset) {
		cmReset(git, parseInt(cmd.value || '') || 1);
	} else if (cmd.id === CMD_ID.delete) {
		cmDelete(git, br);
	} else if (cmd.id === CMD_ID.checkoutFrom) {
		await cmCheckoutFrom(git, cmd.value || '');
	} else if (cmd.id === CMD_ID.log) {
		const count = cmd.value ? parseInt(cmd.value) : undefined;
		cmLog(git, count);
	} else if (cmd.id === CMD_ID.rebase) {
		await cmRebase(git);
	} else if (cmd.id === CMD_ID.up) {
		await cmUp(br, workspacePath);
		if (options) {
			await cmOption(git, options);
		}
	} else if(cmd.id === CMD_ID.merge) {
		await cmMerge(git, options, cmd.value || '');
	} else if (cmd.id === CMD_ID.pull) {
		await cmPull(git, options, cmd.value);
	} else if (cmd.id === CMD_ID.option) {
		if (cmd.value) {
			await cmOption(git, { [cmd.value]: true });
		}
	} else if (options) {
		await cmOption(git, options);
	} 
}

// This method is called when your extension is deactivated
export function deactivate() {}
