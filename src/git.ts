import slugify from 'slugify';
import childProcess from 'child_process';
/**
 * @returns {String} the current branch name as slug
 */
export function getCurrentBranchName(): string {
  const ret = childProcess.spawnSync('git', [
    'symbolic-ref',
    'HEAD',
    '--short'
  ]);
  if (ret.status > 0) throw ret.error;
  const branchName: string = ret.stdout.toString().trim().replace('/', '-');
  return slugify(branchName, {
    lower: true,
    remove: /[*+~.()'"!:@\/]/g,
    strict: true
  });
}
