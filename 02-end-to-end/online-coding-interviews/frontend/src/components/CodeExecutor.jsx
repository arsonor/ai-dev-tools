import { useState, useEffect, useRef } from 'react'
import './CodeExecutor.css'

function CodeExecutor({ code, language, onExecute, output, isExecuting, setIsExecuting }) {
  const [error, setError] = useState('')
  const [pyodideLoading, setPyodideLoading] = useState(false)
  const pyodideInstance = useRef(null)

  // Initialize Pyodide on component mount
  useEffect(() => {
    const initPyodide = async () => {
      if (pyodideInstance.current) return

      setPyodideLoading(true)
      try {
        // Load Pyodide from CDN
        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        })
        pyodideInstance.current = pyodide
      } catch (err) {
        console.error('Failed to load Pyodide:', err)
      } finally {
        setPyodideLoading(false)
      }
    }

    initPyodide()
  }, [])

  const executePython = async (code) => {
    if (!pyodideInstance.current) {
      return 'Pyodide is still loading. Please wait a moment and try again.'
    }

    const pyodide = pyodideInstance.current
    const output = []

    try {
      // Redirect stdout to capture print statements
      await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`)

      // Execute the user's code
      await pyodide.runPythonAsync(code)

      // Get the captured output
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()')
      const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()')

      if (stdout) output.push(stdout)
      if (stderr) output.push('Errors:\n' + stderr)

      return output.length > 0 ? output.join('\n') : 'Code executed successfully (no output)'
    } catch (err) {
      return `Error: ${err.message}`
    }
  }

  const executeCode = async () => {
    setIsExecuting(true)
    setError('')

    try {
      let result = ''

      if (language === 'javascript') {
        result = executeJavaScript(code)
      } else if (language === 'python') {
        result = await executePython(code)
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
            disabled={isExecuting || (language === 'python' && pyodideLoading)}
            className="run-btn"
          >
            {isExecuting ? 'Running...' : (language === 'python' && pyodideLoading) ? 'Loading Python...' : '▶ Run Code'}
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
