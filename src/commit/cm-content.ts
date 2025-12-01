import { Branches } from "../git/branches";
import { splitType, TypeMap } from "../lib/split-type";

const CONTENT_ID = {
  add: 'add',
  delete: 'delete',
  refactor: 'refactor',
  fix: 'fix',
  modify: 'modify',
};

const CONTENT_TYPE_MAP: TypeMap = {
  [CONTENT_ID.add]  : ['[add]', '添加', 'add '],
  [CONTENT_ID.delete]: ['[delete]', '删除', 'delete '],
  [CONTENT_ID.refactor]: ['[refactor]', '重构', 'refactor '],
  [CONTENT_ID.fix]: ['[fix]', '修复', 'fix '],
  [CONTENT_ID.modify]: ['[modify]', '修改', 'modify '],
};

export function cmContent(br: Branches, content: string) {
  if (content.startsWith('[version]')) {
    br.autoCommitAtCurrentBranch(content);
    return;
  }

  const [cmd, value] = splitType(content, CONTENT_TYPE_MAP);
  if (cmd) {
    br.autoCommitAtCurrentBranch(`[${cmd}] ${value}`);
  } else {
    br.autoCommitAtCurrentBranch(content);
  }
}
