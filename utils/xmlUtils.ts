import { XmlNode, ParsingResult } from '../types';

/**
 * 将 XML 字符串解析为树状对象结构
 */
export const parseXml = (xmlString: string): ParsingResult => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      return {
        formattedXml: '',
        rootNode: null,
        error: "XML 解析错误，请检查语法是否正确。",
      };
    }

    // 格式化 XML 字符串
    const formattedXml = formatXmlNode(xmlDoc.documentElement, 0);
    
    // 构建树对象
    const rootNode = domToNode(xmlDoc.documentElement);

    return {
      formattedXml,
      rootNode,
      error: null,
    };
  } catch (e) {
    return {
      formattedXml: '',
      rootNode: null,
      error: e instanceof Error ? e.message : "未知解析错误",
    };
  }
};

/**
 * 递归格式化 XML 节点为字符串（带缩进）
 */
const formatXmlNode = (node: Node, indentLevel: number): string => {
  const indent = "  ".repeat(indentLevel);
  
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    return text ? text : "";
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName;
    
    // 处理属性
    let attributes = "";
    if (element.attributes.length > 0) {
      attributes = Array.from(element.attributes)
        .map(attr => ` ${attr.name}="${attr.value}"`)
        .join("");
    }

    // 检查是否有子节点
    const children = Array.from(node.childNodes);
    const hasElementChildren = children.some(c => c.nodeType === Node.ELEMENT_NODE);
    const hasTextContent = children.some(c => c.nodeType === Node.TEXT_NODE && c.textContent?.trim());

    if (children.length === 0) {
      return `${indent}<${tagName}${attributes} />`;
    }

    if (!hasElementChildren && hasTextContent) {
       // 只有文本内容，不换行显示
       const text = element.textContent?.trim() || "";
       return `${indent}<${tagName}${attributes}>${text}</${tagName}>`;
    }

    // 有子元素，需要递归处理
    const childrenStr = children
      .map(child => formatXmlNode(child, indentLevel + 1))
      .filter(str => str.length > 0) // 过滤掉空文本节点
      .join("\n");

    return `${indent}<${tagName}${attributes}>\n${childrenStr}\n${indent}</${tagName}>`;
  }

  return "";
};

/**
 * 将 DOM 节点转换为自定义的 XmlNode 对象
 */
const domToNode = (node: Element, keyPrefix = "root"): XmlNode => {
  const attributes: Record<string, string> = {};
  Array.from(node.attributes).forEach(attr => {
    attributes[attr.name] = attr.value;
  });

  const children: XmlNode[] = [];
  let content = "";
  
  let childIndex = 0;
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      children.push(domToNode(child as Element, `${keyPrefix}-${childIndex}`));
      childIndex++;
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim();
      if (text) content += text;
    }
  });

  return {
    name: node.tagName,
    attributes,
    children,
    content: content || undefined,
    id: keyPrefix,
  };
};