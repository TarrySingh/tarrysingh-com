
import React from 'react';

interface CustomScatterPointProps {
  cx?: number;
  cy?: number;
  fill?: string;
  category?: string;
  onMouseDown?: (event: React.MouseEvent, category: string) => void;
}

const CustomScatterPoint: React.FC<CustomScatterPointProps> = ({ 
  cx, 
  cy, 
  fill, 
  category,
  onMouseDown 
}) => {
  if (!cx || !cy) return null;
  
  const isDraggable = category === 'winner' || category === 'battleZone';
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={10}
      fill={fill}
      fillOpacity={0.8}
      stroke={fill}
      strokeWidth={1}
      style={{ cursor: isDraggable ? 'move' : 'default' }}
      onMouseDown={(e) => {
        if (isDraggable && onMouseDown && category) {
          onMouseDown(e, category);
        }
      }}
    />
  );
};

export default CustomScatterPoint;
