import { logRun, run } from '../lib/base/run';

export class Git {
  cwd?: string;
  setCWD(cwd: string) {
    console.log('setCWD', cwd);
    this.cwd = cwd;
  }
  private logRun(cmd: string, log?: string) {
    logRun(cmd, log, this.cwd);
  }
  private run(cmd: string) {
    return run(cmd, this.cwd);
  }
  hasStaged() {
    return this.shortStatus().split('\n').some(line => line.startsWith('M') || line.startsWith('A') || line.startsWith('D'));
  }
  do = (v: string) => {
    this.logRun('git ' + v);
  };
  headCommit = (count = 1) => this.run(`git log -${count} --format=%s`);
  headCommitHash = () => this.run(`git log -1 --format=%h`).trim();
  getLog = (count = 10) => this.run(`git log -${count} --oneline --decorate`);
  shortStatus = () => this.run('git status -s');

  // currentBranch = () => this.run('git rev-parse --abbrev-ref HEAD').trim()
  currentBranch = () => this.run('git branch --show-current').trim();
  
  // 获取所有分支
  getAllBranches = () => {
    return this.run('git branch -a')
      .split('\n')
      .map(branch => branch.replace(/^\*?\s*/, '').replace(/^remotes\/origin\//, '').trim())
      .filter(branch => branch && !branch.startsWith('HEAD'));
  };

  getBranchesByFixed = (prefix: string, postfix?: string) => {
    return this.run(`git branch --list ${prefix}${postfix ? `*${postfix}` : '*'}`)
      .split('\n')
      .map(branch => branch.replace(/^\*?\s*/, '').replace(/^remotes\/origin\//, '').trim())
      .filter(branch => branch && !branch.startsWith('HEAD'));
  };
  
  // 获取本地分支
  getLocalBranches = () => {
    return this.run('git branch').split('\n').map(branch => 
      branch.replace(/^\*?\s*/, '').trim()
    ).filter(branch => branch);
  };
  
  diff = (file: string) => this.run(`git diff ${file}`);
  cherryPick = (hash: string) => this.run(`git cherry-pick ${hash}`);
  gotoTarget = (v: string) => {
    this.logRun(`git checkout ${v}`);
  };

  checkoutBranch = (v: string, isForce = false) => {
    this.logRun(`git checkout -${isForce ? 'B' : 'b'} ${v}`);
  };

  checkoutBranchFrom = (from: string, to: string) => {
    this.logRun(`git checkout -b ${to} ${from}`);
  };

  deleteBranch = (v: string) => {
    this.logRun(`git branch -D ${v}`);
  };

  addAll = () => {
    this.logRun('git add .');
  };

  stashPush = () => {
    this.logRun('git stash push');
  };

  stashPop = () => {
    this.logRun('git stash pop');
  };

  addFile = (file: string) => {
    this.logRun(`git add ${file}`);
  };

  commit = (str: string) => {
    this.run(`git commit -m "${str}"`);
    console.log(`${this.headCommitHash()} ${str}`);
  };

  reset = (count = 1) => {
    console.log(this.headCommit(count));
    if (count === 1) {
      this.run(`git reset HEAD^^1`);
    } else {
      this.logRun(`git reset HEAD~${count}`);
    }
  };

  resetHard = (target: string) => {
    this.logRun(`git reset --hard ${target}`);
  };

  resetFile = (file = '') => {
    this.logRun(`git reset ${file}`);
  };

  resetFiles = (files: string[] = []) => {
    files.forEach(file => {
      this.logRun(`git reset ${file}`);
    });
  };

  resetOrigin = () => {
    this.logRun(`git reset origin/${this.currentBranch()}`);
  };

  rebaseOrigin = () => {
    this.logRun(`git rebase origin/${this.currentBranch()}`);
  };

  rebase = (targetBranch: string) => {
    this.logRun(`git rebase ${targetBranch}`);
  };

  pushForce = () => {
    this.logRun(`git push -f`);
  };
  push = () => {
    this.logRun(`git push`);
  };
}
