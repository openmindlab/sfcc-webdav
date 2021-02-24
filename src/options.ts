enum OptionType {
  STRING = 'String',
  BOOLEAN = 'Boolean'
}

interface option {
  alias?: string;
  option: string;
  type: OptionType;
  description: string;
  enum?: Array<string>;
  dependsOn?: string;
}

interface options {
  options: Array<option>;
  mutuallyExclusive?: Array<string>;
}

const optionList: options = {
  options: [
    {
      option: 'compileCode',
      alias: 'b',
      type: OptionType.STRING,
      description: 'Compile and bundle the frontend files',
      enum: ['scss', 'js', 'fonts']
    },
    {
      option: 'mode',
      type: OptionType.STRING,
      alias: 'm',
      description: 'Webpack compile mode',
      enum: ['production', 'development']
    },
    {
      option: 'createPackage',
      alias: 'c',
      type: OptionType.STRING,
      description: 'Create the zip files to deploy/import to the sandbox',
      enum: ['meta', 'demo', 'code', 'template']
    },
    {
      option: 'deploy',
      alias: 'd',
      dependsOn: 'createPackage',
      type: OptionType.BOOLEAN,
      description: 'Deploy the selected configuration or code version to the sandbox'
    },
    {
      option: 'watch',
      alias: 'w',
      type: OptionType.BOOLEAN,
      description: 'Watch files and upload via webdav'
    },
    {
      option: 'updateversion',
      type: OptionType.BOOLEAN,
      description: `Update 'dw.json' code version based on branch name`
    },
    {
      option: 'usepackagejsonversion',
      type: OptionType.BOOLEAN,
      description: `Use 'package.json' version instead of 'dw.json' one`
    },
    {
      option: 'help',
      alias: 'h',
      type: OptionType.BOOLEAN,
      description: 'Display help guide'
    },
    {
      option: 'images',
      alias: 'i',
      type: OptionType.BOOLEAN,
      description: 'Upload catalog images'
    }
  ],
  mutuallyExclusive: [
    'integration',
    'test',
    'upload',
    'uploadCartridge',
    'compile',
    'lint',
    'createCartridge',
    'watch',
    'onlycompile'
  ]
};

export default optionList;
