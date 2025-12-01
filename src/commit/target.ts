export const target = {
    dev: () => 'dev',
    master: () => 'master',
    week: (currentBranch: string) => {
        const dir = currentBranch.split('/')[0];
        return dir + '/周版本分支';
    },
};