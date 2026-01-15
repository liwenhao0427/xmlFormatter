export interface XmlNode {
  name: string;
  attributes: Record<string, string>;
  children: XmlNode[];
  content?: string;
  id: string; // 唯一标识符，用于 React key
}

export interface ParsingResult {
  formattedXml: string;
  rootNode: XmlNode | null;
  error: string | null;
}

export type ViewMode = 'code' | 'tree' | 'smart';