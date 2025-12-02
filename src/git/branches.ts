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
    // 使用正则表达式匹配 refs#数字 格式
    const match = currentBranch.match(/refs#(\d+)/);
    if(match && match[1]) {
      this._redmineId = match[1];
    }
    
    return this._redmineId;
  }

  get prefix() {
    if(this._prefix) {
      return this._prefix;
    }
    if(this.redmineId) {
      this._prefix = `refs #${this.redmineId} `;
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

  autoCommitAtCurrentBranch(msg: string): { commitMessage: string; hash: string } | null {
    if (!this.git.hasStaged()) {
      this.git.addAll();
    }
    // 如果存在前缀且消息不以该前缀开头，则自动添加前缀
    const prefix = this.prefix;
    if(prefix && msg && !msg.startsWith(prefix)) {
      msg = prefix + ' ' + msg;
    }
    this.git.commit(msg);
    const hash = this.git.headCommitHash();
    return { commitMessage: msg, hash };
  }
}
