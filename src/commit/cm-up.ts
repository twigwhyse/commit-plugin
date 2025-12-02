import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as vscode from 'vscode';
import { Branches } from '../git/branches';

/**
 * 升级版本号的最后一位
 * @param version 版本号字符串，例如 "1.2.3"
 * @returns 升级后的版本号，例如 "1.2.4"
 */
function upgradeVersion(version: string): string {
  const parts = version.split('.');
  if (parts.length === 0) {
    throw new Error('版本号格式不正确');
  }
  
  // 将最后一位转换为数字并加1
  const lastIndex = parts.length - 1;
  const lastPart = parseInt(parts[lastIndex], 10);
  
  if (isNaN(lastPart)) {
    throw new Error(`版本号的最后一位 "${parts[lastIndex]}" 不是有效的数字`);
  }
  
  parts[lastIndex] = (lastPart + 1).toString();
  return parts.join('.');
}

/**
 * 读取并升级 package.json 的版本号
 * @param workspacePath 工作区路径
 * @returns 升级后的版本号
 */
function upgradePackageVersion(workspacePath: string): string {
  const packageJsonPath = join(workspacePath, 'package.json');
  
  try {
    // 读取 package.json
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // 检查是否存在 version 字段
    if (!packageJson.version || typeof packageJson.version !== 'string') {
      throw new Error('package.json 中未找到有效的 version 字段');
    }
    
    const oldVersion = packageJson.version;
    const newVersion = upgradeVersion(oldVersion);
    
    // 更新版本号
    packageJson.version = newVersion;
    
    // 写回文件，保持格式（使用 2 个空格缩进）
    const updatedContent = JSON.stringify(packageJson, null, 2) + '\n';
    writeFileSync(packageJsonPath, updatedContent, 'utf-8');
    
    return newVersion;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`无法解析 package.json: ${error.message}`);
    }
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`未找到 package.json 文件: ${packageJsonPath}`);
    }
    throw error;
  }
}

/**
 * 版本升级命令
 * @param br Branches 实例
 * @param workspacePath 工作区路径
 */
export async function cmUp(br: Branches, workspacePath: string): Promise<void> {
  try {
    // 显示进度提示
    vscode.window.showInformationMessage('正在升级版本号...');
    
    // 升级版本号
    const newVersion = upgradePackageVersion(workspacePath);
    
    // 提交更改
    const commitMessage = `[version] ${newVersion}`;
    const result = br.autoCommitAtCurrentBranch(commitMessage);
    
    if (result) {
      vscode.window.showInformationMessage(
        `✅ 版本升级成功！版本号: ${newVersion}\n提交信息: ${result.hash} - ${result.commitMessage}`
      );
    } else {
      vscode.window.showWarningMessage('版本号已升级，但提交可能失败');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`❌ 版本升级失败: ${errorMessage}`);
    console.error('版本升级错误:', error);
  }
}

