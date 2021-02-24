import slugify from 'slugify';
import fs from 'fs';
import path from 'path';
/**
 * @returns {String} the current branch name as slug
 */
export function getCurrentBranchName(folder?: string): string {
  const cwd: string = process.cwd();
  const gitHeadPath = `${process.cwd()}/.git/HEAD`;
  const startBranchName: string = fs.existsSync(gitHeadPath)
    ? fs.readFileSync(gitHeadPath, 'utf-8').trim().split('/').splice(2).join('-')
    : getCurrentBranchName(path.resolve(cwd, '..'));
  return slugify(startBranchName, {
    lower: true,
    remove: /[*+~.()'"!:@\/]/g,
    strict: true
  });
}
