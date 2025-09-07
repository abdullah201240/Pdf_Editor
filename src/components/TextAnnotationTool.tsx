import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, Edit3, Trash2, Palette } from "lucide-react";

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  page: number;
  fontSize: number;
  color: string;
}

interface TextAnnotationToolProps {
  annotation: Annotation;
  scale: number;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onDelete: (id: string) => void;
}

const colorOptions = [
  { name: "Ruby", value: "#ef4444", bg: "bg-red-500" },
  { name: "Emerald", value: "#10b981", bg: "bg-emerald-500" },
  { name: "Sapphire", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Amethyst", value: "#8b5cf6", bg: "bg-violet-500" },
  { name: "Amber", value: "#f59e0b", bg: "bg-amber-500" },
  { name: "Rose", value: "#ec4899", bg: "bg-pink-500" },
  { name: "Teal", value: "#14b8a6", bg: "bg-teal-500" },
  { name: "Orange", value: "#f97316", bg: "bg-orange-500" },
];

export const TextAnnotationTool = ({
  annotation,
  scale,
  onUpdate,
  onDelete,
}: TextAnnotationToolProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [text, setText] = useState(annotation.text);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate(annotation.id, { text });
    setIsEditing(false);
    setShowColorPicker(false);
  };

  const handleCancel = () => {
    setText(annotation.text);
    setIsEditing(false);
    setShowColorPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleColorChange = (color: string) => {
    onUpdate(annotation.id, { color });
    setShowColorPicker(false);
  };

  if (isEditing) {
    return (
      <div
        className="absolute z-20 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          left: annotation.x * scale,
          top: annotation.y * scale,
        }}
      >
        <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-indigo-200 rounded-xl shadow-2xl p-4 min-w-[280px] backdrop-blur-sm">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 text-sm bg-white/70 border-gray-200 focus:border-indigo-400 focus:ring-indigo-200 rounded-lg transition-all duration-200"
                placeholder="Type your annotation..."
              />
            </div>
            
            {showColorPicker && (
              <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-4 gap-2 p-2 bg-white/80 rounded-lg border border-gray-200">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorChange(color.value)}
                      className={`w-8 h-8 rounded-full ${color.bg} hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg ring-2 ring-offset-1 ${
                        annotation.color === color.value ? 'ring-gray-800' : 'ring-transparent hover:ring-gray-300'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between space-x-2">
              <Button
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Palette className="w-3 h-3 mr-1" />
                Color
              </Button>
              
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="border-gray-300 text-gray-600 hover:bg-gray-100 hover:scale-105 transition-all duration-200 shadow-md"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute group cursor-pointer animate-in fade-in-0 zoom-in-95 duration-300"
      style={{
        left: annotation.x * scale,
        top: annotation.y * scale,
        fontSize: annotation.fontSize * scale,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 600,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      <div
        className={`
          relative px-3 py-1.5 rounded-lg shadow-lg transition-all duration-300 transform
          hover:scale-105 hover:shadow-xl cursor-pointer select-none
          backdrop-blur-sm border-2 border-white/30
          ${isHovered ? 'animate-pulse' : ''}
        `}
        style={{
          background: `linear-gradient(135deg, ${annotation.color}15, ${annotation.color}25)`,
          color: annotation.color,
          borderColor: `${annotation.color}40`,
        }}
      >
        <span className="relative z-10 drop-shadow-sm">
          {annotation.text || "Click to edit"}
        </span>
        
        {/* Animated background glow */}
        <div
          className="absolute inset-0 rounded-lg opacity-20 animate-pulse"
          style={{
            background: `linear-gradient(45deg, ${annotation.color}, transparent, ${annotation.color})`,
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
          }}
        />
      </div>

      {/* Floating action buttons */}
      <div className={`
        absolute -top-12 -right-2 flex space-x-1 transition-all duration-300 transform
        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
      `}>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="w-8 h-8 p-0 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 rounded-full"
          title="Edit annotation"
        >
          <Edit3 className="w-3 h-3" />
        </Button>
        
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(annotation.id);
          }}
          className="w-8 h-8 p-0 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 rounded-full"
          title="Delete annotation"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
};