
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorConfig {
  winner: string
  loser: string
  battleZone: string
  smallBubbles: string
  purpleBubbles: string
}

interface ColorControlsProps {
  colors: ColorConfig
  bubbleCounts: {
    small: number
    purple: number
    winner: number
    loser: number
  }
  winnerBubbleSize: number
  loserBubbleSize: number
  purpleBubbleSize: number
  onColorChange: (category: keyof ColorConfig, value: string) => void
  onWinnerCountChange: (value: string) => void
  onWinnerBubbleSizeChange: (value: string) => void
  onLoserCountChange: (value: string) => void
  onLoserBubbleSizeChange: (value: string) => void
  onBubbleCountChange: (category: 'small' | 'purple', value: string) => void
  onPurpleSizeChange: (value: string) => void
}

const ColorPicker = ({
  label,
  color,
  onChange,
}: {
  label: string
  color: string
  onChange: (value: string) => void
}) => (
  <div className="flex items-center gap-2">
    <Label className="w-24">{label}</Label>
    <Popover>
      <PopoverTrigger>
        <div
          className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <Input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 h-8"
        />
      </PopoverContent>
    </Popover>
  </div>
)

export const ColorControls = ({
  colors,
  bubbleCounts,
  winnerBubbleSize,
  loserBubbleSize,
  purpleBubbleSize,
  onColorChange,
  onWinnerCountChange,
  onWinnerBubbleSizeChange,
  onLoserCountChange,
  onLoserBubbleSizeChange,
  onBubbleCountChange,
  onPurpleSizeChange,
}: ColorControlsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium mb-4">Color Controls</h3>
      <ColorPicker
        label="Winner Zone"
        color={colors.winner}
        onChange={(value) => onColorChange("winner", value)}
      />
      <ColorPicker
        label="Loser Zone"
        color={colors.loser}
        onChange={(value) => onColorChange("loser", value)}
      />
      <ColorPicker
        label="Losers"
        color={colors.battleZone}
        onChange={(value) => onColorChange("battleZone", value)}
      />
      <ColorPicker
        label="Mass Markets"
        color={colors.smallBubbles}
        onChange={(value) => onColorChange("smallBubbles", value)}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t">
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium">Winner Zone Bubbles</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={bubbleCounts.winner}
            onChange={(e) => onWinnerCountChange(e.target.value)}
            className="w-full text-lg h-12"
          />
        </div>
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium">Winner Zone Size</Label>
          <Input
            type="number"
            min="5"
            max="200"
            value={winnerBubbleSize}
            onChange={(e) => onWinnerBubbleSizeChange(e.target.value)}
            className="w-full text-lg h-12"
          />
        </div>
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium">Loser Zone Bubbles</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={bubbleCounts.loser}
            onChange={(e) => onLoserCountChange(e.target.value)}
            className="w-full text-lg h-12"
          />
        </div>
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium">Loser Zone Size</Label>
          <Input
            type="number"
            min="5"
            max="200"
            value={loserBubbleSize}
            onChange={(e) => onLoserBubbleSizeChange(e.target.value)}
            className="w-full text-lg h-12"
          />
        </div>
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium">Grey Participants</Label>
          <Input
            type="number"
            min="0"
            max="200"
            value={bubbleCounts.small}
            onChange={(e) => onBubbleCountChange('small', e.target.value)}
            className="w-full text-lg h-12"
          />
        </div>
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium">Purple Size</Label>
          <Input
            type="number"
            min="5"
            max="100"
            value={purpleBubbleSize}
            onChange={(e) => onPurpleSizeChange(e.target.value)}
            className="w-full text-lg h-12"
          />
        </div>
      </div>
    </div>
  )
}
