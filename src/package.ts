import { JSONConfig } from './jsonConfig';

export class PackageJSON extends JSONConfig {
  file = 'package.json';
  [key: string]: any;
  setup(packageJSON: object): PackageJSON {
    Object.keys(packageJSON).forEach((key: string) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        writable: true,
        value: (<any>packageJSON)[key]
      });
    });
    return this;
  }
}
export async function packageinstance() {
  const instance: PackageJSON = new PackageJSON();
  const content = await instance.load();
  return instance.setup(content);
}
