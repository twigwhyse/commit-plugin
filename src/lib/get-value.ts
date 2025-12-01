import * as vscode from 'vscode';

export async function getValue(defaultValue: string, prompt: string): Promise<string> {
	if (defaultValue) {
		return defaultValue;
	}
	return await vscode.window.showInputBox({
		prompt: prompt,
		ignoreFocusOut: true,
	}) ?? '';
}