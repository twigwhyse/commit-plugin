import { Git } from "../git/git";


function optionParse(options: string) {
  const optionMap = {
    push: false,
    rebase: false,
  };
  if (options.includes('push') || options.includes('p')) {
    optionMap.push = true;
  }
  if (options.includes('rebase') || options.includes('r')) {
    optionMap.rebase = true;
  }
  return optionMap;
}

export function cmOption(git: Git, option: string) {
  const options = optionParse(option);
  if (options.push) {
    git.push();
  }
  if (options.rebase) {
    git.fetch();
    git.rebaseOrigin();
  }
}