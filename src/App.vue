<template>
  <div class="container">
    <h1>XML 格式化工具</h1>
    <div class="editor">
      <textarea v-model="inputXml" placeholder="在此粘贴 XML 内容..."></textarea>
      <button @click="formatXml">格式化</button>
    </div>
    <pre v-if="outputXml" class="output">{{ outputXml }}</pre>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputXml = ref('')
const outputXml = ref('')
const error = ref('')

function formatXml() {
  error.value = ''
  outputXml.value = ''
  
  if (!inputXml.value.trim()) {
    error.value = '请输入 XML 内容'
    return
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(inputXml.value, 'text/xml')
    const errorNode = doc.querySelector('parsererror')
    
    if (errorNode) {
      error.value = '无效的 XML 格式'
      return
    }

    const serializer = new XMLSerializer()
    const xmlStr = serializer.serializeToString(doc)
    outputXml.value = formatXmlString(xmlStr)
  } catch (e) {
    error.value = '解析失败'
  }
}

function formatXmlString(xml: string): string {
  let formatted = ''
  let indent = ''
  const tab = '  '
  
  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) {
      indent = indent.substring(tab.length)
    }
    formatted += indent + '<' + node + '>\n'
    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) {
      indent += tab
    }
  })
  
  return formatted.substring(1, formatted.length - 2)
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

textarea {
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background: #2563eb;
}

.output {
  margin-top: 20px;
  padding: 16px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
}

.error {
  margin-top: 10px;
  color: #dc2626;
}
</style>
