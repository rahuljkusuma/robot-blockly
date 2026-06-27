import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('ErrorBoundary caught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:16, color:'#b00', background:'#fee', border:'1px solid #f88'}}>
          <h2>Something went wrong in Blockly</h2>
          <pre>{this.state.message}</pre>
          <p>Please reload the page.</p>
        </div>
      )
    }

    return this.props.children
  }
}
