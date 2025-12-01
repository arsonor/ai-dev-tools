import { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import './CodeEditor.css'

const LANGUAGE_MAP = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
}

function CodeEditor({
  code,
  language,
  onChange,
  onLanguageChange,
  readOnly = false
}) {
  const editorRef = useRef(null)
  const isLocalChangeRef = useRef(false)

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor
  }

  const handleEditorChange = (value) => {
    if (!isLocalChangeRef.current && onChange) {
      isLocalChangeRef.current = true
      onChange(value || '')
      // Reset flag after a short delay
      setTimeout(() => {
        isLocalChangeRef.current = false
      }, 100)
    }
  }

  // Update editor when code changes from WebSocket (but not from local edits)
  useEffect(() => {
    if (editorRef.current && !isLocalChangeRef.current) {
      const currentValue = editorRef.current.getValue()
      if (currentValue !== code) {
        const position = editorRef.current.getPosition()
        editorRef.current.setValue(code)
        // Restore cursor position if possible
        if (position) {
          editorRef.current.setPosition(position)
        }
      }
    }
  }, [code])

  return (
    <div className="code-editor">
      <div className="editor-header">
        <label>
          Language:
          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            disabled={readOnly}
          >
            {Object.keys(LANGUAGE_MAP).map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Editor
        height="100%"
        language={LANGUAGE_MAP[language] || 'python'}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly: readOnly,
          automaticLayout: true,
        }}
      />
    </div>
  )
}

export default CodeEditor
