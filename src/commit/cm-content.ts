import { Branches } from "../git/branches";
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

export function cmContent(br: Branches, content: string): { commitMessage: string; hash: string } | null {
  if (content.startsWith('[version]')) {
    return br.autoCommitAtCurrentBranch(content);
  }

  const [cmd, value] = splitType(content, CONTENT_TYPE_MAP);
  if (cmd) {
    return br.autoCommitAtCurrentBranch(`[${cmd}] ${value}`);
  } else {
    return br.autoCommitAtCurrentBranch(content);
  }
}
