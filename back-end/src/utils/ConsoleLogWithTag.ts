class ConsoleLogWithTag {
  constructor(tag: string) {
    this.tag = tag;
  }
  private tag: string;
  log = (msg: string) => console.log(this.tag + msg);
}
export default ConsoleLogWithTag;
