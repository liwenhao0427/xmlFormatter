import React from 'react';

interface CodeViewerProps {
  code: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  if (!code) return <div className="text-slate-400 p-4 text-center">暂无内容</div>;

  // 简单的 XML 语法着色渲染
  const renderColoredXml = (xml: string) => {
    const lines = xml.split('\n');
    return lines.map((line, index) => {
      // 匹配标签结构 <tagName attr="val"> 或 </tagName>
      // 这是一个非常简化的正则，用于基本的高亮
      const formattedLine = line.replace(
        /(&lt;[\/]?)([^&>\s]+)(.*?)(\/?&gt;)|(&lt;!--.*?--&gt;)/g,
        (match) => {
          // 这里实际上在 dangerouslySetInnerHTML 之前我们已经有字符串了，
          // 但为了安全和简单，我们直接在 map 里处理 react node 比较复杂。
          // 所以我们采用更简单的方法：直接输出 pre，并依赖 CSS 或简单的 span 包装。
          // 既然不使用外部库，我们通过简单的正则替换生成 HTML 字符串比较冒险。
          // 让我们采用行的处理方式。
          return match;
        }
      );
      
      return (
        <div key={index} className="table-row">
           <span className="table-cell text-right select-none text-slate-300 pr-4 text-xs w-8 border-r border-slate-700/50 mr-2 bg-slate-800/50 h-full align-top pt-0.5">
             {index + 1}
           </span>
           <span className="table-cell whitespace-pre-wrap break-all pl-4 text-slate-300 font-mono text-sm leading-6">
             {/* 这里使用极其简单的 Tokenizer 进行着色 */}
             <TokenizedLine content={line} />
           </span>
        </div>
      );
    });
  };

  return (
    <div className="bg-[#1e293b] rounded-lg overflow-hidden border border-slate-700 shadow-inner h-full flex flex-col">
       <div className="flex-1 overflow-auto p-4 custom-scrollbar">
         <div className="table w-full">
            {renderColoredXml(code)}
         </div>
       </div>
    </div>
  );
};

// 简单的行内语法高亮组件
const TokenizedLine: React.FC<{ content: string }> = ({ content }) => {
  // 识别标签、属性名、属性值
  const regex = /(<\/?)([\w:.-]+)|(\s+[\w:.-]+=)|("[^"]*")|(\/?>)|([^<]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex}>{content.slice(lastIndex, match.index)}</span>);
    }
    
    const [full, tagStart, tagName, attrName, attrValue, tagEnd, text] = match;

    if (tagStart) {
      parts.push(<span key={match.index} className="text-gray-400">{tagStart}</span>);
    }
    if (tagName) {
       parts.push(<span key={match.index + 1} className="text-blue-400 font-semibold">{tagName}</span>);
    }
    if (attrName) {
       parts.push(<span key={match.index + 2} className="text-sky-300">{attrName}</span>);
    }
    if (attrValue) {
       parts.push(<span key={match.index + 3} className="text-orange-300">{attrValue}</span>);
    }
    if (tagEnd) {
       parts.push(<span key={match.index + 4} className="text-gray-400">{tagEnd}</span>);
    }
    if (text) {
       parts.push(<span key={match.index + 5} className="text-slate-200">{text}</span>);
    }

    lastIndex = regex.lastIndex;
  }

  return <>{parts}</>;
}