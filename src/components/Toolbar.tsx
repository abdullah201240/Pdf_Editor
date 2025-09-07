import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MousePointer, Type, ChevronLeft, ChevronRight } from "lucide-react";
import { ToolType } from "@/types/tools";

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
}

export const Toolbar = ({
  activeTool,
  onToolChange,
  currentPage,
  numPages,
  onPageChange,
}: ToolbarProps) => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-4 h-4 bg-gradient-primary rounded-full animate-pulse"></div>
          <h3 className="text-sm font-bold text-gray-800">Tools</h3>
          <div className="flex-1 h-px bg-gradient-primary opacity-30"></div>
        </div>
        
        <div className="space-y-2">
          <Button
            variant={activeTool === 'select' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onToolChange('select')}
          >
            <MousePointer className="mr-2 h-4 w-4" />
            Select
          </Button>
          <Button
            variant={activeTool === 'text' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onToolChange('text')}
          >
            <Type className="mr-2 h-4 w-4" />
            Text
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-sm font-bold text-gray-800">Pages</h3>
          <div className="flex-1 h-px bg-gradient-primary opacity-30"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium">
            {currentPage} / {numPages}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};