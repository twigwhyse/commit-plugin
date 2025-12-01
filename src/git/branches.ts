import { Git } from './git';

export class Branches {
  private _currentBranch: string = '';
  private _redmineId: string = '';
  private _prefix: string = '';
  
  get redmineId() {
    if(this._redmineId) {
      return this._redmineId;
    }

    const currentBranch = this.currentBranch;
    if(currentBranch.indexOf('refs#') !== -1) {
      this._redmineId = currentBranch.substring(currentBranch.indexOf('refs#') + 5, currentBranch.indexOf('-'));
    }
    
    return this._redmineId;
  }

  get prefix() {
    if(this._prefix) {
      return this._prefix;
    }
    if(this._redmineId) {
      this._prefix = `refs #${this._redmineId}`;
    }
    return this._prefix;
  }

  get currentBranch() {
    if (!this._currentBranch) {
      this._currentBranch = this.git.currentBranch();
    }
    return this._currentBranch;
  }

  private git: Git;
  constructor(git: Git) {
    this.git = git;
    // 自动设置提交前缀
    
  }

  checkoutBranch(target?: string, force?: boolean) {
    if (!target) {
      console.error("Can't find target branch");
      return;
    }
    this.git.checkoutBranch(target, force);
  }

  mergeToBranch(target: string, options: { rebase?: boolean, message?: string }) {
    const currentBranch = this.currentBranch;
    this.git.do(`checkout ${target}`);
    if (options.rebase) {
      this.git.do(`fetch`);
      this.git.do(`rebase origin/${target}`);
    }
    if (options.message) {
      this.git.do(`merge ${currentBranch} -m "${options.message}"`);
    } else {
      this.git.do(`merge ${currentBranch}`);
    }
  }

  autoCommitAtCurrentBranch(msg: string) {
    if (!this.git.hasStaged()) {
      this.git.addAll();
    }
    while (this.prefix) {
      if(msg && msg.startsWith(this.prefix)) {
        break;
      }
      msg = this.prefix + ' ' + msg;
      break;
    }
    this.git.commit(msg);
  }
}
