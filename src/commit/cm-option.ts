import { Git } from "../git/git";
import * as vscode from "vscode";

export const OPTIONS_DEFINED = {
  push: "push",
  rebase: "rebase",
  build: "build",
  week: "week",
  dev: "dev",
  turnBack: "turnBack",
  merge: "merge",
};

export const OPTIONS_LIST = [
  OPTIONS_DEFINED.push,
  OPTIONS_DEFINED.rebase,
  OPTIONS_DEFINED.build,
  OPTIONS_DEFINED.week,
  OPTIONS_DEFINED.dev,
  OPTIONS_DEFINED.turnBack,
  OPTIONS_DEFINED.merge,
] as (keyof typeof OPTIONS_DEFINED)[];

export type OPTIONS_KEYS = keyof typeof OPTIONS_DEFINED;

export type OPTIONS_MAP = {
  [key in keyof typeof OPTIONS_DEFINED]?: boolean;
}

export function optionParse(opt: string): [options: null | OPTIONS_MAP, value: string] {
  const valueList: string[] = [];
  let options = opt
    .split(" ")
    .filter((v) => {
      if (v.startsWith("-")) {
        return true;
      }
      valueList.push(v);
      return false;
    })
    .map((v) => v.slice(1).trim())
    .filter((v) => v !== "")
    .join(" ");

  let optionMap: null | OPTIONS_MAP = null;

  function handleOption(key: OPTIONS_KEYS) {
    if (options.includes(key)) {
      if (!optionMap) {
        optionMap = {};
      }
      optionMap[key] = true;
      options = options.replace(key, "").trim();
    }
  }

  function handleOptionPartialMatch(key: OPTIONS_KEYS) {
    const prefix = key.slice(0, 1);
    if (prefix && options.includes(prefix)) {
      if (!optionMap) {
        optionMap = {};
      }
      optionMap[key] = true;
      options = options.replace(prefix, "").trim();
    }
  }

  // 全匹配
  OPTIONS_LIST.forEach((option) => {
    handleOption(option);
  });

  // 简写匹配
  OPTIONS_LIST.forEach((option) => {
    handleOptionPartialMatch(option);
  });

  return [optionMap, valueList.join(" ")];
}

export async function doPush(git: Git) {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Git Push",
      cancellable: false,
    },
    async (progress) => {
      progress.report({ increment: 0, message: "正在推送代码..." });
      git.push();
      progress.report({ increment: 100, message: "推送完成" });
    }
  );
}

export async function doRebase(git: Git) {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Git Rebase",
      cancellable: false,
    },
    async (progress) => {
      progress.report({ increment: 0, message: "正在获取远程更新..." });
      git.fetch();
      progress.report({ increment: 50, message: "正在 rebase..." });
      git.rebaseOrigin();
      progress.report({ increment: 100, message: "Rebase 完成" });
    }
  );
}

export async function doBuild(git: Git) {
  const terminal =
    vscode.window.activeTerminal || vscode.window.createTerminal("Git Commit");
  terminal.show();

  // 延迟执行构建命令, 保证终端准备好了，避免吞掉了部分字符
  setTimeout(() => {
    terminal.sendText("npm run build");
  }, 500);
}

export async function cmOption(git: Git, options: OPTIONS_MAP) {
  if (options?.push) {
    await doPush(git);
  }

  if (options.rebase) {
    await doRebase(git);
  }

  if (options.build) {
    await doBuild(git);
  }
}
