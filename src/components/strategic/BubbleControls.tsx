
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Positions {
  [key: string]: { x: number; y: number }
}

interface BubbleControlsProps {
  positions: Positions
  onPositionChange: (bubble: string, axis: 'x' | 'y', value: string) => void
}

export const BubbleControls = ({ positions, onPositionChange }: BubbleControlsProps) => {
  return (
    <div className="mt-6 md:mt-10 space-y-4 md:space-y-6">
      <h2 className="text-lg md:text-xl font-semibold text-[#1A1A1A] mb-2 md:mb-3">Bubble Position Controls</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {Object.keys(positions).map((bubble) => (
          <div key={bubble} className="space-y-3 md:space-y-4 p-3 border border-gray-100 rounded-lg">
            <h3 className="text-base md:text-lg font-medium capitalize">{bubble.replace(/([A-Z])/g, ' $1').trim()}</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label>X Position (0-10)</Label>
                <Input 
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={positions[bubble].x}
                  onChange={(e) => onPositionChange(bubble, 'x', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Y Position (0-1)</Label>
                <Input 
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={positions[bubble].y}
                  onChange={(e) => onPositionChange(bubble, 'y', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
