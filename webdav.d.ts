
/**
 * Upload a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
export function fileUpload(file: string, relativepath: string): void;

/**
 * Deletes a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
export function fileDelete(file: string, relativepath: string): void;