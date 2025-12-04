import { splitType } from "../lib/split-type";
import * as vscode from 'vscode';

export const CMD_ID = {
  commit: 'commit',
  create: 'create',
  checkout: 'checkout',
  checkoutFrom: 'checkoutFrom',
  delete: 'delete',
  reset: 'reset',
  log: 'log',
  up: 'up',
  rebase: 'rebase',
  option: 'option',
  merge: 'merge',
  mergeMaster: 'mergeMaster',
  mergeWeek: 'mergeWeek',
  mergeDev: 'mergeDev',
  pull: 'pull',
};

export const CMD_MAP = {
  [CMD_ID.create]: ['create ', 'cr '],
  [CMD_ID.checkout]: ['checkout ', 'cko '],
  [CMD_ID.checkoutFrom]: ['checkoutFrom ', 'ck '],
  [CMD_ID.delete]: ['delete ', 'dl '],
  [CMD_ID.reset]: ['reset ', 'rs '],
  [CMD_ID.log]: ['log ', 'lg '],
  [CMD_ID.up]: ['up '],
  [CMD_ID.rebase]: ['rebase ', 'rb '],
  [CMD_ID.merge]: ['merge ', 'mg '],
  [CMD_ID.mergeMaster]: ['mergeMaster ', 'mgm ', 'merge-master '],
  [CMD_ID.mergeWeek]: ['mergeWeek ', 'mgw ', 'merge-week '],
  [CMD_ID.mergeDev]: ['mergeDev ', 'mgd ', 'merge-dev '],
  [CMD_ID.pull]: ['pull ', 'pl '],
};

export function getMatchCMD(input: string) {
  return splitType(input, CMD_MAP);
}

export type CommitCommand = {
	id: string;
	label: string;
	value?: string;
	kind?: vscode.QuickPickItemKind;
}

export function generateCommitCommand(str: string): CommitCommand {
	const [cmd, value] = getMatchCMD(str);
	return {
		id: cmd || CMD_ID.commit,
		label: cmd || '提交',
		value,
	};
}