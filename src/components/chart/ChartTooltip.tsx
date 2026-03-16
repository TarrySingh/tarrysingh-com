
interface TooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      category: string
      y: number
      z: number
    }
  }>
}

export const ChartTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  let label = ""
  switch (data.category) {
    case "winner":
      label = "Winner Technology"
      break
    case "battleZone":
      label = "Battle Zone"
      break
    case "custom":
      label = "Custom Point"
      break
    case "purple":
      label = "Purple Participant"
      break
    default:
      label = "Market Participant"
  }

  return (
    <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-gray-600">Market Share: {Math.round(data.y)}%</p>
      <p className="text-gray-600">Size: {Math.round(data.z)}</p>
    </div>
  )
}
