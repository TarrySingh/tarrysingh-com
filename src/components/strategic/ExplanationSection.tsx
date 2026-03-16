
interface ExplanationSectionProps {
  sourceUrl?: string
}

export const ExplanationSection = ({ sourceUrl = "https://tarrysingh.com" }: ExplanationSectionProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Understanding Technology Positioning</h2>
      <p className="text-[#666666] leading-relaxed text-base">
        This visualization maps the relationship between technological attractiveness and competitive strengths. 
        The arrow indicates the strategic vector towards core technology advancement, showing the transformation 
        path from aging technology to the core technology region.
      </p>
      <p className="text-sm text-[#666666] mt-8">
        Source: Strategic Technology Analysis, 2025, {sourceUrl}
      </p>
    </div>
  );
};
