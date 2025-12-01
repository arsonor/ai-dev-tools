import { useState } from 'react'
import './CodeExecutor.css'

function CodeExecutor({ code, language, onExecute, output, isExecuting, setIsExecuting }) {
  const [error, setError] = useState('')

  const executeCode = async () => {
    setIsExecuting(true)
    setError('')

    try {
      let result = ''

      if (language === 'javascript') {
        result = executeJavaScript(code)
      } else if (language === 'python') {
        result = 'Python execution in browser requires Pyodide library.\nFor now, showing code analysis:\n\n' + analyzeCode(code)
      } else {
        result = `Execution for ${language} is not yet implemented in the browser.\n\nCode to execute:\n${code}`
      }

      onExecute(result)
    } catch (err) {
      setError(err.message)
      onExecute('')
    } finally {
      setIsExecuting(false)
    }
  }

  const executeJavaScript = (code) => {
    const logs = []
    const originalLog = console.log
    const originalError = console.error

    // Capture console output
    console.log = (...args) => {
      logs.push(args.map(arg => String(arg)).join(' '))
    }
    console.error = (...args) => {
      logs.push('Error: ' + args.map(arg => String(arg)).join(' '))
    }

    try {
      // Execute the code
      const result = eval(code)

      // Restore console
      console.log = originalLog
      console.error = originalError

      let output = logs.join('\n')
      if (result !== undefined) {
        output += (output ? '\n' : '') + `Return value: ${result}`
      }

      return output || 'Code executed successfully (no output)'
    } catch (error) {
      // Restore console
      console.log = originalLog
      console.error = originalError

      return `Error: ${error.message}\n\n${logs.join('\n')}`
    }
  }

  const analyzeCode = (code) => {
    const lines = code.split('\n').filter(line => line.trim())
    const analysis = []

    analysis.push(`Total lines: ${lines.length}`)

    const functions = lines.filter(line => line.trim().startsWith('def '))
    if (functions.length > 0) {
      analysis.push(`\nFunctions defined: ${functions.length}`)
      functions.forEach(fn => {
        const match = fn.match(/def\s+(\w+)/)
        if (match) analysis.push(`  - ${match[1]}()`)
      })
    }

    const classes = lines.filter(line => line.trim().startsWith('class '))
    if (classes.length > 0) {
      analysis.push(`\nClasses defined: ${classes.length}`)
      classes.forEach(cls => {
        const match = cls.match(/class\s+(\w+)/)
        if (match) analysis.push(`  - ${match[1]}`)
      })
    }

    const imports = lines.filter(line =>
      line.trim().startsWith('import ') || line.trim().startsWith('from ')
    )
    if (imports.length > 0) {
      analysis.push(`\nImports: ${imports.length}`)
    }

    return analysis.join('\n')
  }

  const clearOutput = () => {
    onExecute('')
    setError('')
  }

  return (
    <div className="code-executor">
      <div className="executor-header">
        <h3>Output</h3>
        <div className="executor-actions">
          <button
            onClick={executeCode}
            disabled={isExecuting}
            className="run-btn"
          >
            {isExecuting ? 'Running...' : '▶ Run Code'}
          </button>
          <button
            onClick={clearOutput}
            disabled={isExecuting}
            className="clear-btn"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="output-area">
        {isExecuting && <div className="loading">Executing code...</div>}
        {error && (
          <div className="error-message">
            <strong>Error:</strong>
            <pre>{error}</pre>
          </div>
        )}
        {output && !error && (
          <pre className="output-text">{output}</pre>
        )}
        {!isExecuting && !output && !error && (
          <div className="empty-state">
            Click "Run Code" to execute your code
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeExecutor
