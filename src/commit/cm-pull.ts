import { Git } from "../git/git";
import * as vscode from 'vscode';
import { OPTIONS_MAP, cmOption } from "./cm-option";

/**
 * Git Pull 功能
 * 支持 rebase 和 merge 参数
 * 使用方法:
 *   pull rebase 或 pull -r  - 使用 rebase 方式拉取
 *   pull merge 或 pull -m   - 使用 merge 方式拉取
 *   pull                    - 默认使用 rebase 方式拉取
 * 支持 options:
 *   -p, -push: 拉取后推送到远端
 *   -b, -build: 拉取后执行构建
 *   -n, -name: 复制当前分支的名字到剪贴板
 */
export async function cmPull(git: Git, options: OPTIONS_MAP | null, strategy?: string): Promise<void> {
  let pullStrategy: 'rebase' | 'merge' = 'rebase';
  
  // 解析策略参数
  if (strategy) {
    const strategyLower = strategy.toLowerCase().trim();
    if (strategyLower === 'merge' || strategyLower === 'm' || options?.merge) {
      pullStrategy = 'merge';
    } else if (strategyLower === 'rebase' || strategyLower === 'r' || options?.rebase) {
      pullStrategy = 'rebase';
    }
  }

  // 如果没有指定策略，让用户选择
  if (!strategy) {
    const selected = await vscode.window.showQuickPick(
      [
        { label: 'Rebase', description: '使用 rebase 方式拉取代码', value: 'rebase' },
        { label: 'Merge', description: '使用 merge 方式拉取代码', value: 'merge' },
      ],
      {
        placeHolder: '请选择拉取方式',
        ignoreFocusOut: true,
      }
    );

    if (!selected) {
      return;
    }

    pullStrategy = selected.value as 'rebase' | 'merge';
  }

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Git Pull (${pullStrategy})`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0, message: '正在拉取代码...' });
        git.pull(pullStrategy);
        progress.report({ increment: 100, message: '拉取完成' });
      }
    );
    
    vscode.window.showInformationMessage(`✅ Pull 完成 (${pullStrategy})`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`❌ Pull 失败: ${error.message || error}`);
    return;
  }
}

