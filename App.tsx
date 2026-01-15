import React, { useState, useEffect, useRef } from 'react';
import { parseXml } from './utils/xmlUtils';
import { ParsingResult, ViewMode } from './types';
import { Button } from './components/Button';
import { CodeViewer } from './components/CodeViewer';
import { TreeViewer } from './components/TreeViewer';
import { EXAMPLE_XML } from './constants';

const App: React.FC = () => {
  const [inputXml, setInputXml] = useState<string>("");
  const [result, setResult] = useState<ParsingResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('smart');
  const [isLoading, setIsLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  // 新增：全屏模式状态
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleParse = () => {
    if (!inputXml.trim()) return;
    setIsLoading(true);
    // 使用 setTimeout 让出主线程，以便 UI 显示 loading 状态
    setTimeout(() => {
      const parseResult = parseXml(inputXml);
      setResult(parseResult);
      setIsLoading(false);
      // 解析成功后，如果是移动端或为了更好体验，可以自动切到结果全屏（可选，这里暂不自动切，由用户控制）
    }, 100);
  };

  const handleClear = () => {
    setInputXml("");
    setResult(null);
    setIsFullscreen(false);
  };

  const handleLoadExample = () => {
    setInputXml(EXAMPLE_XML);
    // 自动触发解析
    setTimeout(() => {
       const parseResult = parseXml(EXAMPLE_XML);
       setResult(parseResult);
    }, 50);
  };

  const handleCopy = () => {
    if (result?.formattedXml) {
      navigator.clipboard.writeText(result.formattedXml).then(() => {
        setCopyFeedback("复制成功!");
        setTimeout(() => setCopyFeedback(""), 2000);
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setInputXml(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 头部导航 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm h-14">
        <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">X</div>
             <h1 className="text-lg font-bold text-slate-800 tracking-tight">XML 智能格式化大师</h1>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" className="!py-1 !text-xs" onClick={handleLoadExample}>加载示例</Button>
             <Button variant="ghost" className="!py-1 !text-xs text-red-500 hover:text-red-600" onClick={handleClear}>清空</Button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 w-full mx-auto p-4 overflow-hidden h-[calc(100vh-3.5rem)]">
        <div className={`grid gap-4 h-full transition-all duration-300 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          
          {/* 左侧：输入区域 (全屏模式下隐藏) */}
          <div className={`flex flex-col gap-2 h-full ${isFullscreen ? 'hidden' : 'flex'}`}>
            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
               <div className="flex gap-2 items-center">
                 <input
                   type="file"
                   id="file-upload"
                   className="hidden"
                   accept=".xml,.txt"
                   onChange={handleFileUpload}
                 />
                 <label 
                   htmlFor="file-upload"
                   className="cursor-pointer px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors flex items-center gap-1"
                 >
                   <span>📂</span> 上传
                 </label>
                 <span className="text-xs text-slate-400 ml-2">支持粘贴或上传</span>
               </div>
            </div>

            <div className="relative flex-1 group">
              <textarea
                className="w-full h-full resize-none p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-mono text-sm leading-6 outline-none shadow-sm text-slate-700 bg-white"
                placeholder="在此粘贴 XML 内容..."
                value={inputXml}
                onChange={(e) => setInputXml(e.target.value)}
                spellCheck={false}
              />
              <div className="absolute bottom-4 right-4 z-10">
                 <Button onClick={handleParse} disabled={isLoading || !inputXml} className="shadow-lg">
                   {isLoading ? '处理中...' : '格式化并查看 ->'}
                 </Button>
              </div>
            </div>
          </div>

          {/* 右侧：结果展示区域 */}
          <div className={`flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden transition-all duration-300 ${isFullscreen ? 'col-span-1' : ''}`}>
            
            {/* 结果工具栏 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1 bg-slate-200 p-0.5 rounded-lg">
                  <button
                    onClick={() => setViewMode('smart')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewMode === 'smart' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌲 智能视图
                  </button>
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewMode === 'tree' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📄 纯树形
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewMode === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💻 源码
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <span className="text-green-600 text-xs font-medium transition-opacity duration-300 opacity-100">
                    {copyFeedback}
                 </span>
                 <button
                   onClick={handleCopy}
                   disabled={!result}
                   className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-30"
                   title="复制"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                   </svg>
                 </button>
                 
                 {/* 全屏切换按钮 */}
                 <button
                   onClick={() => setIsFullscreen(!isFullscreen)}
                   className={`p-1.5 rounded transition-colors ${isFullscreen ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                   title={isFullscreen ? "退出全屏" : "全屏查看"}
                 >
                   {isFullscreen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10L4 15M4 15V11M4 15H8M15 14L20 9M20 9V13M20 9H16" />
                      </svg>
                   ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                   )}
                 </button>
              </div>
            </div>

            {/* 内容显示区 */}
            <div className="flex-1 overflow-auto bg-white relative">
              {!result && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <p className="text-sm">在左侧输入 XML 并格式化</p>
                </div>
              )}

              {result?.error && (
                <div className="p-6">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-sm text-red-700 font-bold">解析失败</p>
                    <p className="text-sm text-red-600 mt-1">{result.error}</p>
                  </div>
                </div>
              )}

              {result && !result.error && (
                <div className="h-full">
                  {viewMode === 'code' ? (
                     <CodeViewer code={result.formattedXml} />
                  ) : (
                    <div className="p-2 md:p-4 h-full overflow-auto custom-scrollbar pb-12">
                      {result.rootNode && (
                         <TreeViewer 
                           node={result.rootNode} 
                           forceSmart={viewMode === 'smart'}
                         />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;