import { listFolders } from './files';
export function projectCartridges() {
  const cartridgesFolder: string = `${process.cwd()}/cartridges`;
  return listFolders(cartridgesFolder);
}
