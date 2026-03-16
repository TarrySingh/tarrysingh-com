
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface DataPoint {
  x: number
  y: number
  z: number
  category: string
}

interface NewPointControlsProps {
  newPoint: DataPoint
  customPoints: DataPoint[]
  onNewPointChange: (property: keyof DataPoint, value: string) => void
  onAddPoint: () => void
}

export const NewPointControls = ({
  newPoint,
  customPoints,
  onNewPointChange,
  onAddPoint,
}: NewPointControlsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium mb-4">Add New Point</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label>X Position</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={newPoint.x}
              onChange={(e) => onNewPointChange("x", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Y Position</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={newPoint.y}
              onChange={(e) => onNewPointChange("y", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Size</Label>
            <Input
              type="number"
              min="0"
              max="200"
              value={newPoint.z}
              onChange={(e) => onNewPointChange("z", e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={onAddPoint}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add New Point
        </button>
      </div>
      <div className="text-sm text-gray-500 mt-2">
        Added points: {customPoints.length}
      </div>
    </div>
  )
}
