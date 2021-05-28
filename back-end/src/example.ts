type GenericArg = "Selector" | "XPath";
export function genericFollow(type: "Selector", selector: string): void;
export function genericFollow(type: "XPath", XPath: string): string;
export function genericFollow(
  type: GenericArg,
  selector?: string,
  XPath?: string
) {
  switch (type) {
    case "Selector":
      return selector;
    case "XPath":
      return XPath;
    default:
      break;
  }
}
