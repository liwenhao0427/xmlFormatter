import React, { useState } from 'react';
import { XmlNode } from '../types';

interface TreeViewerProps {
  node: XmlNode;
  level?: number;
  forceSmart?: boolean; // 新增：控制是否强制启用智能表格模式
}

// 智能判断是否为 Field 集合 (例如 <Record> 下全是 <Field>)
const isFieldRecord = (node: XmlNode): boolean => {
  if (node.children.length === 0) return false;
  // 检查是否绝大多数子节点都是 Field 且具有 name/value 属性
  const fieldChildren = node.children.filter(
    child => child.name === 'Field' && child.attributes.name
  );
  return fieldChildren.length > 0 && fieldChildren.length === node.children.length;
};

// 字段详情表格组件 - 样式优化更紧凑
const FieldTable: React.FC<{ fields: XmlNode[] }> = ({ fields }) => {
  return (
    <div className="overflow-x-auto mt-1 border border-slate-200 rounded-md shadow-sm bg-white max-w-4xl">
      <table className="min-w-full divide-y divide-slate-200 text-xs">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-2 py-1.5 text-left font-medium text-slate-500 uppercase tracking-wider w-1/4">Name</th>
            <th className="px-2 py-1.5 text-left font-medium text-slate-500 uppercase tracking-wider">Value</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {fields.map((field) => (
            <tr key={field.id} className="hover:bg-slate-50">
              <td className="px-2 py-1.5 whitespace-nowrap text-blue-700 font-mono">
                {field.attributes.name || '-'}
              </td>
              <td className="px-2 py-1.5 text-slate-800 break-all font-mono">
                {field.attributes.value || <span className="text-slate-300 italic">null</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TreeViewer: React.FC<TreeViewerProps> = ({ node, level = 0, forceSmart = true }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const hasChildren = node.children && node.children.length > 0;
  // 仅在 forceSmart 为 true 时启用智能表格检测
  const isFields = forceSmart && isFieldRecord(node);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // 缩进距离：从 1.5rem (24px) 调整为 12px，大幅节省空间
  const indentSize = level === 0 ? 0 : 12;

  return (
    <div className="font-mono text-sm leading-5 select-text" style={{ marginLeft: `${indentSize}px` }}>
      <div 
        className={`flex items-start group cursor-pointer hover:bg-slate-50/50 rounded -ml-1 pl-1 py-0.5`}
        onClick={toggleExpand}
      >
        {/* 折叠图标 - 稍微调小并垂直居中对齐 */}
        <div className="mr-1 mt-0.5 text-slate-400 hover:text-blue-500 w-3 h-3 flex-shrink-0 flex items-center justify-center">
          {hasChildren && (
            <span className="transform transition-transform text-[10px]">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
        </div>

        {/* 节点内容 */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex flex-wrap items-center gap-x-1.5 align-top">
            <span className="font-bold text-blue-700 break-all">&lt;{node.name}</span>
            
            {/* 属性 - 颜色微调，更紧凑 */}
            {Object.entries(node.attributes).map(([key, val]) => (
              <span key={key} className="text-slate-600 inline-block max-w-full truncate align-bottom">
                <span className="text-sky-600">{key}</span>
                <span className="text-slate-400">=</span>
                <span className="text-amber-600">"{val}"</span>
              </span>
            ))}
            
            {/* 闭合标签部分（如果折叠了） */}
            {!isExpanded && hasChildren && (
               <span className="text-slate-400 bg-slate-100 px-1 rounded text-[10px] mx-1 border border-slate-200">... {node.children.length} 子项</span>
            )}
            
            {/* 自闭合或结束标签前半部分 */}
            <span className="font-bold text-blue-700">
              {(!hasChildren && !node.content) ? ' />' : '>'}
            </span>

            {/* 文本内容 */}
            {node.content && (
              <span className="text-slate-900 font-sans mx-1 bg-yellow-50/80 px-1 rounded border border-yellow-100">
                {node.content}
              </span>
            )}
            
            {/* 如果没有子节点且有文本，直接显示结束标签 */}
            {!hasChildren && node.content && (
               <span className="font-bold text-blue-700">&lt;/{node.name}&gt;</span>
            )}
          </div>

          {/* 子节点渲染区域 */}
          {isExpanded && hasChildren && (
            <div className="relative border-l border-slate-200 ml-[5px] pl-[5px] my-0.5">
              {isFields ? (
                // 智能模式：如果是 Field 列表，显示为表格
                <div className="pl-2 mb-1">
                   <FieldTable fields={node.children} />
                </div>
              ) : (
                // 普通模式：递归渲染
                node.children.map((child) => (
                  <TreeViewer 
                    key={child.id} 
                    node={child} 
                    level={level + 1} 
                    forceSmart={forceSmart}
                  />
                ))
              )}
            </div>
          )}

          {/* 展开状态下的结束标签 (如果有子节点) */}
          {isExpanded && hasChildren && (
            <div className="font-bold text-blue-700">&lt;/{node.name}&gt;</div>
          )}
        </div>
      </div>
    </div>
  );
};