import { useState, useEffect } from 'react'
import { useStdout } from 'ink'

interface TerminalSize {
  width: number
  height: number
}

/**
 * Hook to track terminal size with automatic updates on resize.
 * Listens for SIGWINCH signal and stdout resize events.
 */
export function useTerminalSize(): TerminalSize {
  const { stdout } = useStdout()
  
  const getSize = (): TerminalSize => ({
    width: stdout?.columns || process.stdout.columns || 80,
    height: stdout?.rows || process.stdout.rows || 24,
  })
  
  const [size, setSize] = useState<TerminalSize>(getSize)
  
  useEffect(() => {
    const handleResize = () => {
      setSize(getSize())
    }
    
    // Listen for resize events on stdout
    if (stdout) {
      stdout.on('resize', handleResize)
    }
    
    // Also listen on process.stdout as fallback
    process.stdout.on('resize', handleResize)
    
    // Listen for SIGWINCH signal (terminal resize on Unix)
    const sigwinchHandler = () => {
      handleResize()
    }
    
    if (process.platform !== 'win32') {
      process.on('SIGWINCH', sigwinchHandler)
    }
    
    return () => {
      if (stdout) {
        stdout.off('resize', handleResize)
      }
      process.stdout.off('resize', handleResize)
      if (process.platform !== 'win32') {
        process.off('SIGWINCH', sigwinchHandler)
      }
    }
  }, [stdout])
  
  return size
}

export default useTerminalSize
