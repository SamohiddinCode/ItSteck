import React from 'react'

export default class ErrorBoundary extends React.Component {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  componentDidCatch(error, info) {
    console.error('Application render error', error, info)
  }

  render() {
    if (this.state.failed) return (
      <main className="min-h-screen bg-bg bg-noise grid place-items-center px-6 text-center">
        <div className="card p-10 max-w-lg glow-border">
          <h1 className="font-display text-3xl font-bold mb-3">Не удалось открыть страницу</h1>
          <p className="text-muted mb-7">Обновите страницу. Если ошибка повторится, свяжитесь с нами.</p>
          <button onClick={() => window.location.reload()} className="btn bg-primary hover:bg-primary-hover text-white h-11 px-7">Обновить страницу</button>
        </div>
      </main>
    )
    return this.props.children
  }
}
