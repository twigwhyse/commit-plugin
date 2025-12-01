import { splitType } from "../lib/split-type";

export const CMD_ID = {
  commit: 'commit',
  create: 'create',
  delete: 'delete',
  reset: 'reset',
};

export const CMD_MAP = {
  [CMD_ID.create]: ['create ', 'cr '],
  [CMD_ID.delete]: ['delete ', 'dl '],
  [CMD_ID.reset]: ['reset ', 'rs '],
};

export function getMatchCMD(input: string) {
  return splitType(input, CMD_MAP);
}