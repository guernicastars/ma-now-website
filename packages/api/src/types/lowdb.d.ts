declare module 'lowdb' {
  interface LowdbSync<T> {
    get(key: string): any;
    set(key: string, value: any): any;
    write(): void;
    value(): any;
    push(value: any): any;
    find(obj: any): any;
    assign(obj: any): any;
    defaults(obj: T): LowdbSync<T>;
  }

  function lowdb<T>(adapter: any): LowdbSync<T>;
  export default lowdb;
}

declare module 'lowdb/adapters/FileSync' {
  class FileSync<T> {
    constructor(filename: string);
  }
  export default FileSync;
}
