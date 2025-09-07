import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSelectTool: () => void;
  onTextTool: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onToggleMode: () => void;
}

export const useKeyboardShortcuts = ({
  onSave,
  onUndo,
  onRedo,
  onSelectTool,
  onTextTool,
  onZoomIn,
  onZoomOut,
  onNextPage,
  onPrevPage,
  onToggleMode,
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLElement && event.target.isContentEditable
    ) {
      return;
    }

    const { ctrlKey, metaKey, shiftKey, key } = event;
    const cmdOrCtrl = ctrlKey || metaKey;

    // Prevent browser defaults for our shortcuts
    const preventDefault = () => {
      event.preventDefault();
      event.stopPropagation();
    };

    switch (key.toLowerCase()) {
      // Save
      case 's':
        if (cmdOrCtrl) {
          preventDefault();
          onSave();
        }
        break;

      // Undo
      case 'z':
        if (cmdOrCtrl && !shiftKey) {
          preventDefault();
          onUndo();
        }
        break;

      // Redo
      case 'y':
        if (cmdOrCtrl) {
          preventDefault();
          onRedo();
        }
        break;

      // Redo (alternative)
      case 'z':
        if (cmdOrCtrl && shiftKey) {
          preventDefault();
          onRedo();
        }
        break;

      // Select tool
      case 'v':
        preventDefault();
        onSelectTool();
        break;

      // Text tool
      case 't':
        preventDefault();
        onTextTool();
        break;

      // Zoom in
      case '=':
      case '+':
        if (cmdOrCtrl) {
          preventDefault();
          onZoomIn();
        }
        break;

      // Zoom out
      case '-':
        if (cmdOrCtrl) {
          preventDefault();
          onZoomOut();
        }
        break;

      // Next page
      case 'arrowright':
      case 'pagedown':
        if (!cmdOrCtrl) {
          preventDefault();
          onNextPage();
        }
        break;

      // Previous page
      case 'arrowleft':
      case 'pageup':
        if (!cmdOrCtrl) {
          preventDefault();
          onPrevPage();
        }
        break;

      // Toggle between basic and advanced mode
      case 'm':
        if (cmdOrCtrl) {
          preventDefault();
          onToggleMode();
        }
        break;

      // Escape key - generic close/cancel action
      case 'escape':
        preventDefault();
        // Could be used to deselect tools or close dialogs
        break;
    }
  }, [
    onSave,
    onUndo,
    onRedo,
    onSelectTool,
    onTextTool,
    onZoomIn,
    onZoomOut,
    onNextPage,
    onPrevPage,
    onToggleMode,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return keyboard shortcuts info for help/documentation
  return {
    shortcuts: [
      { keys: ['Ctrl/Cmd', 'S'], description: 'Save PDF' },
      { keys: ['Ctrl/Cmd', 'Z'], description: 'Undo' },
      { keys: ['Ctrl/Cmd', 'Y'], description: 'Redo' },
      { keys: ['V'], description: 'Select Tool' },
      { keys: ['T'], description: 'Text Tool' },
      { keys: ['Ctrl/Cmd', '+'], description: 'Zoom In' },
      { keys: ['Ctrl/Cmd', '-'], description: 'Zoom Out' },
      { keys: ['→', 'Page Down'], description: 'Next Page' },
      { keys: ['←', 'Page Up'], description: 'Previous Page' },
      { keys: ['Ctrl/Cmd', 'M'], description: 'Toggle Mode' },
      { keys: ['Esc'], description: 'Cancel/Close' },
    ],
  };
};
