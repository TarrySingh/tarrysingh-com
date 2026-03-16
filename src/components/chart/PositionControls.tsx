
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface BubblePosition {
  winner: { x: number; y: number; z: number }
  battleZone: { x: number; y: number; z: number }
}

interface PositionControlsProps {
  positions: BubblePosition
  onPositionChange: (
    category: keyof BubblePosition,
    property: "x" | "y" | "z",
    value: string
  ) => void
}

export const PositionControls = ({
  positions,
  onPositionChange,
}: PositionControlsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium mb-4">Position & Size Controls</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Winner</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="X"
              value={positions.winner.x}
              onChange={(e) =>
                onPositionChange("winner", "x", e.target.value)
              }
            />
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="Y"
              value={positions.winner.y}
              onChange={(e) =>
                onPositionChange("winner", "y", e.target.value)
              }
            />
            <Input
              type="number"
              min="0"
              max="200"
              placeholder="Size"
              value={positions.winner.z}
              onChange={(e) =>
                onPositionChange("winner", "z", e.target.value)
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Losers</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="X"
              value={positions.battleZone.x}
              onChange={(e) =>
                onPositionChange("battleZone", "x", e.target.value)
              }
            />
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="Y"
              value={positions.battleZone.y}
              onChange={(e) =>
                onPositionChange("battleZone", "y", e.target.value)
              }
            />
            <Input
              type="number"
              min="0"
              max="200"
              placeholder="Size"
              value={positions.battleZone.z}
              onChange={(e) =>
                onPositionChange("battleZone", "z", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
