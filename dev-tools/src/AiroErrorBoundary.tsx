import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; captureGlobalErrors?: boolean; }
interface State { hasError: boolean; }

export default class AiroErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
