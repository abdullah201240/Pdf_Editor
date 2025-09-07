'use client'
import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDropzone } from "react-dropzone";
import { PDFDocument, rgb } from "pdf-lib";
import { toast } from "sonner";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ToolType } from "@/types/tools";

// Loading component for PDF
const PDFLoading = () => (
  <div className="flex items-center justify-center p-12 bg-gray-100 dark:bg-gray-800 rounded-2xl">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center animate-glow-pulse">
        <FileText className="w-8 h-8 text-white" />
      </div>
      <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
    </div>
  </div>
);

// Dynamic import for react-pdf to avoid SSR issues
const Document = dynamic(
  () => import('react-pdf').then((mod) => ({ default: mod.Document })),
  { 
    ssr: false,
    loading: () => <PDFLoading />
  }
);
const Page = dynamic(
  () => import('react-pdf').then((mod) => ({ default: mod.Page })),
  { 
    ssr: false,
    loading: () => <PDFLoading />
  }
);

// PDF.js worker setup
if (typeof window !== 'undefined') {
  import('react-pdf').then((pdfjs) => {
    pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.pdfjs.version}/build/pdf.worker.min.js`;
  });
}
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Toolbar } from "./Toolbar";
import { TextAnnotationTool } from "./TextAnnotationTool";
import { DrawingTool } from "./DrawingTool";
import { ThemeToggle } from "./ThemeToggle";
import { HelpModal } from "./HelpModal";
import { FileText, Upload, Save, ZoomIn, ZoomOut, Layers, Settings, HelpCircle } from "lucide-react";


interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  page: number;
  fontSize: number;
  color: string;
}

export const PDFEditor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeMode, setActiveMode] = useState<"basic" | "advanced">("basic");
  const [isAddingText, setIsAddingText] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Undo/Redo functions
  const pushToUndoStack = useCallback((currentAnnotations: Annotation[]) => {
    setUndoStack(prev => [...prev.slice(-9), currentAnnotations]); // Keep last 10 states
    setRedoStack([]); // Clear redo stack when new action is performed
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) {
      toast.info('Nothing to undo');
      return;
    }
    
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    setRedoStack(prev => [...prev, annotations]);
    setUndoStack(newUndoStack);
    setAnnotations(previousState);
    
    toast.success('⏪ Undone');
  }, [undoStack, annotations]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) {
      toast.info('Nothing to redo');
      return;
    }
    
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    setUndoStack(prev => [...prev, annotations]);
    setRedoStack(newRedoStack);
    setAnnotations(nextState);
    
    toast.success('⏩ Redone');
  }, [redoStack, annotations]);

  // Load annotations from localStorage
  useEffect(() => {
    if (pdfFile) {
      const savedAnnotations = localStorage.getItem(`pdf-annotations-${pdfFile.name}`);
      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      }
    }
  }, [pdfFile]);

  // Auto-save annotations to localStorage
  useEffect(() => {
    if (pdfFile && annotations.length >= 0) {
      const saveData = {
        annotations,
        lastModified: new Date().toISOString(),
        scale,
        currentPage,
        activeTool,
        activeMode,
      };
      
      localStorage.setItem(`pdf-editor-${pdfFile.name}`, JSON.stringify(saveData));
      
      // Also save to a global recent files list
      const recentFiles = JSON.parse(localStorage.getItem('pdf-editor-recent-files') || '[]');
      const fileEntry = {
        name: pdfFile.name,
        size: pdfFile.size,
        lastOpened: new Date().toISOString(),
        annotationCount: annotations.length,
      };
      
      const updatedFiles = [fileEntry, ...recentFiles.filter((f: any) => f.name !== pdfFile.name)].slice(0, 5);
      localStorage.setItem('pdf-editor-recent-files', JSON.stringify(updatedFiles));
    }
  }, [annotations, pdfFile, scale, currentPage, activeTool, activeMode]);
  
  // Load complete session data from localStorage
  useEffect(() => {
    if (pdfFile) {
      const savedData = localStorage.getItem(`pdf-editor-${pdfFile.name}`);
      if (savedData) {
        try {
          const { 
            annotations: savedAnnotations, 
            scale: savedScale, 
            currentPage: savedPage,
            activeTool: savedTool,
            activeMode: savedMode,
            lastModified 
          } = JSON.parse(savedData);
          
          setAnnotations(savedAnnotations || []);
          if (savedScale) setScale(savedScale);
          if (savedPage) setCurrentPage(savedPage);
          if (savedTool) setActiveTool(savedTool);
          if (savedMode) setActiveMode(savedMode);
          
          toast.success('💾 Session restored!', {
            description: `Loaded from ${new Date(lastModified).toLocaleDateString()}`
          });
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
    }
  }, [pdfFile]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file");
      toast.error("Please upload a valid PDF file");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
      
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      setPdfFile(file);
      const arrayBuffer = await file.arrayBuffer();
      setPdfData(arrayBuffer);
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsLoading(false);
        toast.success("📄 PDF loaded successfully! Ready to edit.", {
          description: `${file.name} • ${(file.size / (1024 * 1024)).toFixed(1)} MB`
        });
      }, 200);
      
    } catch (err) {
      const errorMessage = "Failed to load PDF file";
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
      console.error("PDF loading error:", err);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "text" && pageRef.current) {
      const rect = pageRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / scale;
      const y = (event.clientY - rect.top) / scale;
      
      setIsAddingText(true);
      pushToUndoStack(annotations);
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        x,
        y,
        text: "Click to edit",
        page: currentPage,
        fontSize: 14,
        color: "#8B5CF6",
      };
      setAnnotations(prev => [...prev, newAnnotation]);
      toast.success('✏️ New annotation added');
    }
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    pushToUndoStack(annotations);
    setAnnotations(prev =>
      prev.map(annotation =>
        annotation.id === id ? { ...annotation, ...updates } : annotation
      )
    );
  };

  const deleteAnnotation = (id: string) => {
    pushToUndoStack(annotations);
    setAnnotations(prev => prev.filter(annotation => annotation.id !== id));
    toast.success('🗑️ Annotation deleted');
  };

  // Save PDF function
  const savePDF = useCallback(async () => {
    if (!pdfData) {
      toast.error("❌ No PDF loaded");
      return;
    }

    if (annotations.length === 0) {
      const shouldSave = confirm(
        "No annotations found. Do you want to save the original PDF anyway?"
      );
      if (!shouldSave) return;
    }

    const saveToastId = toast.loading("💾 Preparing your PDF for download...", {
      description: "Processing annotations and generating file"
    });

    try {
      // Validate annotations before processing
      const validAnnotations = annotations.filter(annotation => {
        if (!annotation.text || annotation.text.trim() === '') {
          console.warn(`Skipping empty annotation with id: ${annotation.id}`);
          return false;
        }
        if (annotation.page < 1 || annotation.page > numPages) {
          console.warn(`Skipping annotation with invalid page: ${annotation.page}`);
          return false;
        }
        return true;
      });

      const pdfDoc = await PDFDocument.load(pdfData);
      const pages = pdfDoc.getPages();
      
      // Process each valid annotation
      let processedCount = 0;
      for (const [index, annotation] of validAnnotations.entries()) {
        try {
          const page = pages[annotation.page - 1];
          if (page) {
            const { height } = page.getSize();
            
            // Parse color safely
            let r = 0, g = 0, b = 0;
            if (annotation.color && annotation.color.startsWith('#') && annotation.color.length === 7) {
              r = parseInt(annotation.color.slice(1, 3), 16) / 255;
              g = parseInt(annotation.color.slice(3, 5), 16) / 255;
              b = parseInt(annotation.color.slice(5, 7), 16) / 255;
            } else {
              // Default to purple if color is invalid
              r = 0.545; g = 0.361; b = 0.961;
            }
            
            page.drawText(annotation.text, {
              x: Math.max(0, annotation.x),
              y: Math.max(0, height - annotation.y - annotation.fontSize),
              size: Math.max(8, Math.min(72, annotation.fontSize)), // Clamp font size
              color: rgb(r, g, b),
            });
            processedCount++;
            
            // Update progress
            const progress = Math.round(((index + 1) / validAnnotations.length) * 90);
            await new Promise(resolve => setTimeout(resolve, 0)); // Allow UI to update
            toast.loading(`💾 Processing annotation ${index + 1} of ${validAnnotations.length}...`, {
              id: saveToastId,
              description: `${progress}% complete`
            });
          }
        } catch (annotationError) {
          console.error(`Error processing annotation ${annotation.id}:`, annotationError);
        }
      }

      toast.loading("📦 Finalizing PDF...", {
        id: saveToastId,
        description: "Almost done!"
      });

      const pdfBytes = await pdfDoc.save();
      // Convert to standard Uint8Array for Blob compatibility
      const bytesArray = Array.from(pdfBytes);
      const blob = new Blob([new Uint8Array(bytesArray)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const originalName = pdfFile?.name?.replace(/\.pdf$/, '') || 'document';
      const filename = `${originalName}_edited_${timestamp}.pdf`;
      
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("🎉 PDF saved successfully!", {
        id: saveToastId,
        description: `${processedCount} annotations added • ${filename}`
      });
      
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast.error("❌ Failed to save PDF", {
        id: saveToastId,
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  }, [pdfData, annotations, numPages, pdfFile]);

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onSave: savePDF,
    onUndo: () => undo(),
    onRedo: () => redo(),
    onSelectTool: () => setActiveTool('select'),
    onTextTool: () => setActiveTool('text'),
    onZoomIn: () => setScale(s => Math.min(2, s + 0.1)),
    onZoomOut: () => setScale(s => Math.max(0.5, s - 0.1)),
    onNextPage: () => setCurrentPage(p => Math.min(numPages, p + 1)),
    onPrevPage: () => setCurrentPage(p => Math.max(1, p - 1)),
    onToggleMode: () => setActiveMode(mode => mode === 'basic' ? 'advanced' : 'basic'),
  });

  const currentPageAnnotations = annotations.filter(a => a.page === currentPage);

  if (!pdfFile || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-violet-400/20 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block">
              <h1 className="text-6xl font-bold text-gradient-rainbow mb-6 animate-aurora">
                PDF Editor Pro
              </h1>
              <div className="w-24 h-1 bg-gradient-primary mx-auto mb-6 rounded-full"></div>
            </div>
            <p className="text-gray-600 text-xl leading-relaxed max-w-2xl mx-auto">
              Transform your PDF editing experience with our 
              <span className="text-gradient-primary font-semibold">modern, intuitive tools</span> 
              designed for creativity and productivity
            </p>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="mb-8">
              <Card className="glass border-white/20 shadow-intense backdrop-blur-xl">
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center animate-glow-pulse">
                    <FileText className="w-10 h-10 text-white animate-bounce-gentle" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing your PDF...</h3>
                  <p className="text-gray-600 mb-6">Please wait while we prepare your document for editing</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary rounded-full transition-all duration-300 ease-out animate-aurora"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">{loadingProgress}% Complete</div>
                </div>
              </Card>
            </div>
          )}
          
          {/* Upload Interface */}
          {!isLoading && (
            <Card className="glass border-white/30 shadow-intense backdrop-blur-xl hover-lift">
              <div
                {...getRootProps()}
                className={`p-16 text-center cursor-pointer transition-all duration-500 rounded-xl ${
                  isDragActive
                    ? "bg-gradient-primary/10 border-2 border-violet-400 border-dashed scale-105 shadow-intense"
                    : "border-2 border-dashed border-gray-300 hover:border-violet-400/60 hover:bg-violet-50/50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center shadow-elegant hover-scale">
                      {isDragActive ? (
                        <Upload className="w-12 h-12 text-white animate-bounce-gentle" />
                      ) : (
                        <FileText className="w-12 h-12 text-white" />
                      )}
                    </div>
                    {isDragActive && (
                      <div className="absolute -inset-2 bg-gradient-primary/20 rounded-2xl animate-pulse-rainbow"></div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {isDragActive ? "✨ Drop your PDF here" : "📄 Upload your PDF"}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Drag and drop a PDF file here, or click to browse your files
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      size="lg"
                      className="bg-gradient-primary hover:opacity-90 text-white shadow-elegant hover-scale px-8 py-3 text-lg font-semibold"
                    >
                      Choose File
                    </Button>
                    <p className="text-sm text-gray-500">
                      Supports PDF files up to 50MB
                    </p>
                  </div>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-gradient-success rounded-full flex items-center justify-center mb-2">
                        <span className="text-white text-xl">✍️</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Add Text</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-gradient-warning rounded-full flex items-center justify-center mb-2">
                        <span className="text-white text-xl">🎨</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Colorful Tools</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-gradient-danger rounded-full flex items-center justify-center mb-2">
                        <span className="text-white text-xl">💾</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Save & Export</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mx-6 mb-6 p-4 bg-gradient-danger/10 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-center font-medium">⚠️ {error}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 animate-fade-in">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-soft sticky top-0 z-30 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gradient-primary">PDF Editor Pro</h1>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-6 bg-gray-300 dark:bg-gray-600" />
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate max-w-48">{pdfFile.name}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Mode Switcher */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={activeMode === 'basic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveMode('basic')}
              className={`transition-all duration-300 ${
                activeMode === 'basic'
                  ? 'bg-gradient-secondary text-white shadow-elegant hover:opacity-90 border-0'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 mr-1" />
              Basic
            </Button>
            <Button
              variant={activeMode === 'advanced' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveMode('advanced')}
              className={`transition-all duration-300 ${
                activeMode === 'advanced'
                  ? 'bg-gradient-primary text-white shadow-elegant hover:opacity-90 border-0'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
              }`}
            >
              <Layers className="w-4 h-4 mr-1" />
              Pro
            </Button>
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              className="text-gray-700 dark:text-gray-300 border-0 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all duration-200 hover-scale"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-mono w-12 text-center px-2">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(s => Math.min(2, s + 0.1))}
              className="text-gray-700 dark:text-gray-300 border-0 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all duration-200 hover-scale"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6 bg-gray-300" />
          
          {/* Help Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover-scale"
            title="Help & Keyboard Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={savePDF}
            className="bg-gradient-primary hover:opacity-90 text-white shadow-elegant hover-scale px-6"
          >
            <Save className="w-4 h-4 mr-2" />
            Save PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 animate-slide-in shadow-soft lg:min-h-screen">
          {activeMode === 'basic' ? (
            <Toolbar
              activeTool={activeTool}
              onToolChange={(tool) => setActiveTool(tool)}
              currentPage={currentPage}
              numPages={numPages}
              onPageChange={setCurrentPage}
            />
          ) : (
            <DrawingTool
              activeTool={activeTool}
              onToolChange={(tool) => setActiveTool(tool)}
            />
          )}
          
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-4 h-4 bg-gradient-accent rounded-full animate-pulse"></div>
              <h3 className="text-sm font-bold text-gray-800">Annotations</h3>
              <div className="flex-1 h-px bg-gradient-primary opacity-30"></div>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {currentPageAnnotations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-3">
                    <span className="text-gray-400 text-2xl">✏️</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    No annotations yet.\nClick the text tool and start adding notes!
                  </p>
                </div>
              ) : (
                currentPageAnnotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="group p-3 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-glow transition-all duration-300 hover-lift cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Page {annotation.page}
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: annotation.color }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-800 truncate font-medium group-hover:text-violet-700 transition-colors">
                      {annotation.text || "Empty annotation"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {annotation.fontSize}px • {new Date().toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Page Info Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-secondary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{currentPage}</span>
                  </div>
                  <span className="text-gray-600 font-medium">of {numPages} pages</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="text-sm text-gray-500">
                  {currentPageAnnotations.length} annotation{currentPageAnnotations.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activeTool === 'select' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-violet-100 text-violet-700'
                }`}>
                  {activeTool === 'select' ? '👆 Select Mode' : '✏️ Text Mode'}
                </div>
              </div>
            </div>
            
            {/* PDF Canvas */}
            <div className="relative">
              <div
                ref={pageRef}
                className="relative bg-white shadow-intense rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-elegant"
                style={{
                  cursor: activeTool === 'text' ? 'crosshair' : 'default'
                }}
                onClick={handlePageClick}
              >
                {/* Canvas Border Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 pointer-events-none rounded-2xl"></div>
                
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center relative z-10"
                >
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                
                {/* Text Annotations */}
                {currentPageAnnotations.map((annotation) => (
                  <TextAnnotationTool
                    key={annotation.id}
                    annotation={annotation}
                    scale={scale}
                    onUpdate={updateAnnotation}
                    onDelete={deleteAnnotation}
                  />
                ))}
                
                {/* Tool Indicator */}
                {activeTool === 'text' && (
                  <div className="absolute top-4 right-4 bg-gradient-primary text-white px-3 py-2 rounded-lg shadow-elegant animate-bounce-gentle">
                    <span className="text-sm font-medium">✏️ Click to add text</span>
                  </div>
                )}
              </div>
              
              {/* Page Navigation */}
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-soft">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="hover-scale disabled:opacity-50"
                  >
                    <span className="mr-1">←</span> Previous
                  </Button>
                  
                  <div className="px-4 py-2">
                    <span className="text-sm font-mono text-gray-700">
                      {currentPage} / {numPages}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                    disabled={currentPage === numPages}
                    className="hover-scale disabled:opacity-50"
                  >
                    Next <span className="ml-1">→</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        shortcuts={shortcuts}
      />
    </div>
  );
};
