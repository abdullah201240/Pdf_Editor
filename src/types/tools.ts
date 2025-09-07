export type ToolType = 
  | 'select' 
  | 'pen' 
  | 'highlighter' 
  | 'rectangle' 
  | 'circle' 
  | 'line' 
  | 'text' 
  | 'eraser';

export interface Tool {
  id: ToolType;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  color: string;
}
