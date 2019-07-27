

interface sfccwebdav {
  fileDelete(file: string, relativepath: string): void;

  fileUpload(file: string, relativepath: string): void;
}

export = sfccwebdav;