import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Pencil, 
  Square, 
  Circle, 
  Minus, 
  Type,
  Highlighter,
  Eraser,
  Palette,
  RotateCcw,
  Download,
  Settings,
  MousePointer
} from 'lucide-react';
import { ToolType, Tool } from '@/types/tools';

interface DrawingToolProps {
  onToolChange: (tool: ToolType) => void;
  activeTool: ToolType;
}

const tools: Tool[] = [
  { id: 'select', icon: MousePointer, name: 'Select', color: 'from-gray-500 to-gray-600' },
  { id: 'pen', icon: Pencil, name: 'Pen', color: 'from-blue-500 to-cyan-500' },
  { id: 'highlighter', icon: Highlighter, name: 'Highlight', color: 'from-yellow-400 to-orange-400' },
  { id: 'rectangle', icon: Square, name: 'Rectangle', color: 'from-green-500 to-emerald-500' },
  { id: 'circle', icon: Circle, name: 'Circle', color: 'from-purple-500 to-violet-500' },
  { id: 'line', icon: Minus, name: 'Line', color: 'from-pink-500 to-rose-500' },
  { id: 'text', icon: Type, name: 'Text', color: 'from-indigo-500 to-blue-500' },
  { id: 'eraser', icon: Eraser, name: 'Eraser', color: 'from-red-500 to-orange-500' },
];

const colors = [
  { name: 'Ruby', value: '#ef4444', gradient: 'from-red-500 to-red-600' },
  { name: 'Orange', value: '#f97316', gradient: 'from-orange-500 to-orange-600' },
  { name: 'Amber', value: '#f59e0b', gradient: 'from-amber-500 to-amber-600' },
  { name: 'Emerald', value: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
  { name: 'Cyan', value: '#06b6d4', gradient: 'from-cyan-500 to-cyan-600' },
  { name: 'Blue', value: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Violet', value: '#8b5cf6', gradient: 'from-violet-500 to-violet-600' },
  { name: 'Purple', value: '#a855f7', gradient: 'from-purple-500 to-purple-600' },
  { name: 'Pink', value: '#ec4899', gradient: 'from-pink-500 to-pink-600' },
  { name: 'Black', value: '#000000', gradient: 'from-gray-800 to-gray-900' },
  { name: 'Gray', value: '#6b7280', gradient: 'from-gray-500 to-gray-600' },
  { name: 'White', value: '#ffffff', gradient: 'from-gray-100 to-gray-200' },
];

const brushSizes = [
  { size: 1, name: 'Extra Fine' },
  { size: 3, name: 'Fine' },
  { size: 5, name: 'Medium' },
  { size: 8, name: 'Thick' },
  { size: 12, name: 'Extra Thick' },
];

export const DrawingTool = ({ onToolChange, activeTool }: DrawingToolProps) => {
  const [selectedColor, setSelectedColor] = useState('#8b5cf6');
  const [brushSize, setBrushSize] = useState(3);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSettings, setShowBrushSettings] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Drawing Tools Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-4 h-4 bg-gradient-primary rounded-full animate-pulse"></div>
          <h3 className="text-sm font-bold text-gray-800">Drawing Tools</h3>
          <div className="flex-1 h-px bg-gradient-primary opacity-30"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            
            return (
              <Button
                key={tool.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onToolChange(tool.id)}
                className={`h-12 flex-col space-y-1 transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${tool.color} text-white shadow-elegant hover:opacity-90 border-0`
                    : "text-gray-700 border-gray-200 hover:shadow-glow hover-lift"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{tool.name}</span>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* Color Picker Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-accent rounded-full animate-pulse"></div>
            <h3 className="text-sm font-bold text-gray-800">Colors</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 hover-scale"
          >
            <Palette className="w-4 h-4" />
          </Button>
        </div>

        {/* Color Preview */}
        <div className="flex items-center space-x-3 mb-3">
          <div 
            className="w-8 h-8 rounded-lg border-2 border-white shadow-md hover-scale cursor-pointer"
            style={{ backgroundColor: selectedColor }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          ></div>
          <div className="text-sm">
            <div className="font-medium text-gray-800">Current Color</div>
            <div className="text-xs text-gray-500">{selectedColor.toUpperCase()}</div>
          </div>
        </div>

        {/* Color Palette */}
        {showColorPicker && (
          <div className="animate-fade-in">
            <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-soft">
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setSelectedColor(color.value);
                      setShowColorPicker(false);
                    }}
                    className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color.gradient} hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg ring-2 ring-offset-1 ${
                      selectedColor === color.value ? 'ring-gray-800' : 'ring-transparent hover:ring-gray-300'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      <Separator className="bg-gray-200" />

      {/* Brush Settings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-warning rounded-full animate-pulse"></div>
            <h3 className="text-sm font-bold text-gray-800">Brush Size</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBrushSettings(!showBrushSettings)}
            className="p-2 hover-scale"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Size Preview */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <div 
              className="bg-gray-800 rounded-full"
              style={{ 
                width: `${Math.min(brushSize * 2, 20)}px`, 
                height: `${Math.min(brushSize * 2, 20)}px` 
              }}
            ></div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-800">Size: {brushSize}px</div>
            <div className="text-xs text-gray-500">
              {brushSizes.find(s => s.size === brushSize)?.name || 'Custom'}
            </div>
          </div>
        </div>

        {/* Brush Size Options */}
        {showBrushSettings && (
          <div className="animate-fade-in">
            <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-soft">
              <div className="space-y-2">
                {brushSizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => {
                      setBrushSize(size.size);
                      setShowBrushSettings(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      brushSize === size.size
                        ? 'bg-gradient-primary text-white shadow-elegant'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-sm font-medium">{size.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">{size.size}px</span>
                      <div 
                        className={`rounded-full ${
                          brushSize === size.size ? 'bg-white' : 'bg-gray-400'
                        }`}
                        style={{ 
                          width: `${Math.min(size.size * 1.5, 16)}px`, 
                          height: `${Math.min(size.size * 1.5, 16)}px` 
                        }}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      <Separator className="bg-gray-200" />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 hover-lift"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Undo Last
        </Button>
        
        <Button
          variant="outline"
          className="w-full text-gray-700 border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 hover-lift"
        >
          <Eraser className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Tips */}
      <div className="pt-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-violet-50 p-4 rounded-xl border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Pro Tips</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Hold Shift while drawing for straight lines</li>
            <li>• Use highlighter for transparent effects</li>
            <li>• Right-click to access more options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
