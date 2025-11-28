// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "infofe-commit" is now active!');

	// 注册提交 Commit 命令
	const commitCommand = vscode.commands.registerCommand('infofe-commit.commit', async () => {
		await showCommitInput();
	});

	context.subscriptions.push(commitCommand);
}

/**
 * 显示 commit 输入框并提交
 */
async function showCommitInput(): Promise<void> {
	// 显示输入框
	const commitMessage = await vscode.window.showInputBox({
		prompt: '请输入 Commit 消息',
		placeHolder: '例如: feat: 添加新功能',
		ignoreFocusOut: true,
		validateInput: (value) => {
			if (!value || value.trim() === '') {
				return 'Commit 消息不能为空';
			}
			return null;
		}
	});

	// 如果用户取消输入，直接返回
	if (!commitMessage) {
		return;
	}

	// 执行 git commit
	await executeCommit(commitMessage.trim());
}

/**
 * 执行 git commit 命令
 */
async function executeCommit(commitMessage: string): Promise<void> {
	try {
		// 获取当前工作区路径
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('未找到工作区');
			return;
		}

		const workspacePath = workspaceFolder.uri.fsPath;

		// 执行 git commit 命令
		const { stdout, stderr } = await execAsync(
			`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`,
			{ cwd: workspacePath }
		);

		if (stderr && !stderr.includes('nothing to commit')) {
			vscode.window.showErrorMessage(`提交失败: ${stderr}`);
			return;
		}

		vscode.window.showInformationMessage('Commit 提交成功！');
	} catch (error: any) {
		const errorMessage = error.message || String(error);
		vscode.window.showErrorMessage(`提交失败: ${errorMessage}`);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
