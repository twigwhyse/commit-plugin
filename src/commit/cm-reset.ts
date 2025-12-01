import { Git } from "../git/git";

export function cmReset(git: Git, count?: number) {
  git.reset(count);
}