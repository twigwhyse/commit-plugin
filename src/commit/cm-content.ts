import * as vscode from 'vscode';
import { Branches } from "../git/branches";
import { Git } from "../git/git";
import { splitType, TypeMap } from "../lib/split-type";
import { OPTIONS_MAP } from './cm-option';

const CONTENT_ID = {
  add: 'add',
  delete: 'delete',
  refactor: 'refactor',
  fix: 'fix',
  modify: 'modify',
  version: 'version',
  style: 'style',
  test: 'test',
  docs: 'docs',
  chore: 'chore',
  perf: 'perf',
  build: 'build',
  ci: 'ci',
  revert: 'revert',
  feat: 'feat',
  optimize: 'optimize',
};

const CONTENT_TYPE_MAP: TypeMap = {
  [CONTENT_ID.add]  : ['[add]', '添加', '支持', 'add '],
  [CONTENT_ID.delete]: ['[delete]', '删除', 'delete '],
  [CONTENT_ID.refactor]: ['[refactor]', '重构', 'refactor '],
  [CONTENT_ID.fix]: ['[fix]', '修复', 'fix '],
  [CONTENT_ID.modify]: ['[modify]', '修改', 'modify '],
  [CONTENT_ID.style]: ['[style]', '样式', 'style '],
  [CONTENT_ID.test]: ['[test]', '测试', 'test '],
  [CONTENT_ID.docs]: ['[docs]', '文档', 'docs '],
  [CONTENT_ID.chore]: ['[chore]', '杂项', 'chore '],
  [CONTENT_ID.perf]: ['[perf]', '性能', 'perf '],
  [CONTENT_ID.build]: ['[build]', '构建', 'build '],
  [CONTENT_ID.ci]: ['[ci]', '持续集成', 'ci '],
  [CONTENT_ID.revert]: ['[revert]', '回滚', 'revert '],
  [CONTENT_ID.version]: ['[version]', '版本', 'version '],
  [CONTENT_ID.feat]: ['[feat]', '功能', 'feat '],
  [CONTENT_ID.optimize]: ['[optimize]', '优化', 'optimize '],
};

function wrapPrefix(prefix: string, content: string): string {
  if (prefix && content && !content.startsWith(prefix)) {
    return prefix + ' ' + content;
  }
  return content;
}

function generateCommitMessage(content: string): string {
  if (content.startsWith('[version]')) {
    return content;
  }
  const [cmd, value] = splitType(content, CONTENT_TYPE_MAP);
  if (cmd) {
    return `[${cmd.trim()}] ${value.trim()}`;
  }
  return content;
}

export function cmContent(git: Git, br: Branches, content: string, options: OPTIONS_MAP) {
  if (!git.hasStaged()) {
    git.addAll();
  }
  const msg = wrapPrefix(br.prefix, generateCommitMessage(content));
  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: `提交：${msg}`,
    cancellable: false,
  }, async () => {
    try {
      git.commit(msg);
      if (options?.push) {
        git.push();
      }
    } catch (error) {
      vscode.window.showErrorMessage(`❌ 提交失败: ${error}`);
    }
  });
}

