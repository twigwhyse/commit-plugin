import * as vscode from 'vscode';
import { Branches } from "../git/branches";
import { Git } from "../git/git";
import { splitType, TypeMap } from "../lib/split-type";

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

export function cmContent(git: Git, br: Branches, content: string) {
  if (!git.hasStaged()) {
    git.addAll();
  }
  const msg = wrapPrefix(br.prefix, generateCommitMessage(content));
  
  // 在 terminal 中执行 git commit 命令，以便显示 git hooks 的输出
  const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Git Commit');

  terminal.show();
  // 转义消息中的/双引号和反斜杠，使用双引号包裹消息
  const escapedMsg = msg.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  terminal.sendText(`git commit -m "${escapedMsg}"`);
  terminal.sendText('git log -1 --format=%h');
}
