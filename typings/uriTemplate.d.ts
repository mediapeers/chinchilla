// declaration file for uri-templates

declare class UriTemplate {
  fillFromObject(vars: Object): string;
  fill(callback: (varName: string) => string): string;
  fromUri(uri: string): Object;

  constructor(url: string);
}
