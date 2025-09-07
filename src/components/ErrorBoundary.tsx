'use client'
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center">
            {/* Animated Error Icon */}
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-danger rounded-full flex items-center justify-center shadow-elegant animate-bounce-gentle">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-danger/20 rounded-full animate-pulse-rainbow"></div>
            </div>
            
            <Card className="glass border-red-200 shadow-intense backdrop-blur-xl p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-red-700 mb-2">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-red-600 text-lg leading-relaxed">
                    We encountered an unexpected error while processing your request.
                    Don't worry, your work is safe!
                  </p>
                </div>
                
                {this.state.error && process.env.NODE_ENV === 'development' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                    <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
                    <code className="text-xs text-red-700 break-all">
                      {this.state.error.message}
                    </code>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => this.setState({ hasError: false })}
                    className="bg-gradient-primary hover:opacity-90 text-white shadow-elegant hover-scale"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 hover-scale"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>
                
                <div className="pt-4 border-t border-red-200">
                  <p className="text-sm text-red-500">
                    If this problem persists, please try refreshing the page or contact support.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
