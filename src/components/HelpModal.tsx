'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Keyboard, Lightbulb, Zap, Heart } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

export const HelpModal = ({ isOpen, onClose, shortcuts }: HelpModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-intense border border-gray-200/50 dark:border-gray-700/50">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Help & Tips</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Master your PDF editing workflow</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="hover-scale border-gray-300 dark:border-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Keyboard Shortcuts */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Keyboard className="w-5 h-5 text-violet-600" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Keyboard Shortcuts</h3>
              </div>
              
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:shadow-glow transition-all duration-200"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                    <div className="flex space-x-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd 
                          key={keyIndex}
                          className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-600 dark:text-gray-400 shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips & Tricks */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pro Tips</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">🎯 Precision Editing</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Hold Shift while drawing for straight lines</li>
                    <li>• Use the grid view for precise alignment</li>
                    <li>• Double-click text to quick edit</li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">💾 Auto-Save Features</h4>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• Your work is automatically saved locally</li>
                    <li>• Session state is preserved between visits</li>
                    <li>• Recent files are tracked for quick access</li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">🎨 Advanced Tools</h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                    <li>• Switch to Pro mode for drawing tools</li>
                    <li>• Use different brush sizes and colors</li>
                    <li>• Try the highlighter for transparent effects</li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">⚡ Performance Tips</h4>
                  <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                    <li>• Large PDFs may take time to process</li>
                    <li>• Zoom out for better overview of large documents</li>
                    <li>• Use undo/redo for experimenting safely</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for PDF editing enthusiasts</span>
            </div>
            <div className="mt-2">
              <Button
                onClick={onClose}
                className="bg-gradient-primary hover:opacity-90 text-white shadow-elegant hover-scale"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
