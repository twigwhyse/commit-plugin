import { splitType } from "../lib/split-type";

export const CMD_ID = {
  commit: 'commit',
  create: 'create',
  delete: 'delete',
  reset: 'reset',
  sprintBranch: 'sprintBranch',
  log: 'log',
};

export const CMD_MAP = {
  [CMD_ID.create]: ['create ', 'cr '],
  [CMD_ID.delete]: ['delete ', 'dl '],
  [CMD_ID.reset]: ['reset ', 'rs '],
  [CMD_ID.sprintBranch]: ['sprint ', 'sp '],
  [CMD_ID.log]: ['log ', 'lg '],
};

export function getMatchCMD(input: string) {
  return splitType(input, CMD_MAP);
}