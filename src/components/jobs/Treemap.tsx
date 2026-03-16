"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OccupationRecord, TreemapNode } from "@/lib/jobs/types";
import { exposureColor } from "@/lib/jobs/colors";
import { formatJobCount, formatExposure } from "@/lib/jobs/format";
import { useTheme } from "@/lib/jobs/theme";

interface TreemapProps {
  data: OccupationRecord[];
  onSelect?: (record: OccupationRecord) => void;
}

/** Squarified treemap layout algorithm */
function squarify(
  items: { id: string; value: number; record: OccupationRecord }[],
  x: number,
  y: number,
  w: number,
  h: number
): TreemapNode[] {
  const totalValue = items.reduce((sum, d) => sum + d.value, 0);
  if (totalValue <= 0 || items.length === 0) return [];

  const nodes: TreemapNode[] = [];
  let cx = x,
    cy = y,
    cw = w,
    ch = h;
  let remaining = [...items].sort((a, b) => b.value - a.value);

  while (remaining.length > 0) {
    const isWide = cw >= ch;
    const side = isWide ? ch : cw;
    const totalRemaining = remaining.reduce((s, d) => s + d.value, 0);
    const scale = (cw * ch) / totalRemaining;

    let row: typeof remaining = [];
    let bestAspect = Infinity;

    for (let i = 1; i <= remaining.length; i++) {
      const candidate = remaining.slice(0, i);
      const rowSum = candidate.reduce((s, d) => s + d.value, 0);
      const rowWidth = (rowSum * scale) / side;
      const worst = candidate.reduce((w, d) => {
        const h = (d.value * scale) / rowWidth;
        const aspect = Math.max(rowWidth / h, h / rowWidth);
        return Math.max(w, aspect);
      }, 0);

      if (worst <= bestAspect) {
        bestAspect = worst;
        row = candidate;
      } else {
        break;
      }
    }

    const rowSum = row.reduce((s, d) => s + d.value, 0);
    const rowThickness = (rowSum * scale) / side;

    let offset = 0;
    for (const item of row) {
      const itemLength = (item.value * scale) / rowThickness;
      const nx = isWide ? cx : cx + offset;
      const ny = isWide ? cy + offset : cy;
      const nw = isWide ? rowThickness : itemLength;
      const nh = isWide ? itemLength : rowThickness;

      nodes.push({
        id: item.id,
        label: item.record.title,
        value: item.value,
        exposure: item.record.exposure,
        color: exposureColor(item.record.exposure, 0.9),
        x: nx,
        y: ny,
        w: nw,
        h: nh,
        country: item.record.country,
        isco: item.record.isco,
        major_group: item.record.major_group,
        rationale: item.record.rationale,
        pay_eur: item.record.pay_eur,
      });
      offset += itemLength;
    }

    if (isWide) {
      cx += rowThickness;
      cw -= rowThickness;
    } else {
      cy += rowThickness;
      ch -= rowThickness;
    }

    remaining = remaining.slice(row.length);
  }

  return nodes;
}

export default function Treemap({ data, onSelect }: TreemapProps) {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<TreemapNode | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const nodesRef = useRef<TreemapNode[]>([]);
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;

  const buildLayout = useCallback(() => {
    const items = data
      .filter((r) => r.jobs_k && r.jobs_k > 0)
      .map((r) => ({
        id: `${r.country}-${r.isco}`,
        value: r.jobs_k!,
        record: r,
      }));

    nodesRef.current = squarify(items, 0, 0, width, height);
  }, [data, width, height]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = isDark ? "#0f0f1a" : "#f3f4f6";
    ctx.fillRect(0, 0, width, height);

    const gap = isDark ? 0.5 : 1;
    const labelBgColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)";
    const labelTextColor = isDark ? "#ffffff" : "#111827";
    const subLabelColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";

    for (const node of nodesRef.current) {
      ctx.fillStyle = node.color;
      ctx.fillRect(node.x + gap, node.y + gap, node.w - gap * 2, node.h - gap * 2);

      if (hoveredNode?.id === node.id) {
        ctx.strokeStyle = isDark ? "#ffffff" : "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(node.x, node.y, node.w, node.h);
      }

      const area = node.w * node.h;

      if (area > 4000 && node.w > 50 && node.h > 24) {
        ctx.fillStyle = labelBgColor;
        ctx.fillRect(node.x + gap, node.y + gap, node.w - gap * 2, Math.min(node.h - gap * 2, 36));

        ctx.fillStyle = labelTextColor;
        ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
        ctx.textBaseline = "top";

        const maxWidth = node.w - 8;
        let label = node.label;
        if (ctx.measureText(label).width > maxWidth) {
          while (label.length > 3 && ctx.measureText(label + "...").width > maxWidth) {
            label = label.slice(0, -1);
          }
          label += "...";
        }
        ctx.fillText(label, node.x + 4, node.y + 3, maxWidth);

        if (node.exposure !== null && node.h > 36) {
          ctx.font = "9px system-ui, -apple-system, sans-serif";
          ctx.fillStyle = subLabelColor;
          ctx.fillText(
            `${node.exposure}/10 · ${formatJobCount(node.value)}`,
            node.x + 4,
            node.y + 18,
            maxWidth
          );
        }
      } else if (area > 1200 && node.w > 30 && node.h > 16) {
        ctx.fillStyle = labelTextColor;
        ctx.font = "9px system-ui, -apple-system, sans-serif";
        ctx.textBaseline = "top";

        const maxWidth = node.w - 4;
        let label = node.label;
        if (ctx.measureText(label).width > maxWidth) {
          while (label.length > 3 && ctx.measureText(label + "...").width > maxWidth) {
            label = label.slice(0, -1);
          }
          label += "...";
        }
        ctx.fillText(label, node.x + 2, node.y + 2, maxWidth);
      }
    }
  }, [width, height, hoveredNode, isDark]);

  useEffect(() => {
    buildLayout();
    render();
  }, [buildLayout, render]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * width;
      const my = ((e.clientY - rect.top) / rect.height) * height;

      const hit = nodesRef.current.find(
        (n) => mx >= n.x && mx <= n.x + n.w && my >= n.y && my <= n.y + n.h
      );

      setHoveredNode(hit || null);
      setTooltip(hit ? { x: e.clientX, y: e.clientY } : null);
    },
    [width, height]
  );

  const handleClick = useCallback(() => {
    if (hoveredNode && onSelect) {
      const record = data.find(
        (r) => `${r.country}-${r.isco}` === hoveredNode.id
      );
      if (record) onSelect(record);
    }
  }, [hoveredNode, data, onSelect]);

  const bgClass = isDark ? "bg-[#0f0f1a]" : "bg-gray-100";

  return (
    <div ref={containerRef} className={`w-full h-full relative ${bgClass}`}>
      <canvas
        ref={canvasRef}
        style={{ width, height, cursor: hoveredNode ? "pointer" : "default" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredNode(null);
          setTooltip(null);
        }}
        onClick={handleClick}
      />
      {hoveredNode && tooltip && (
        <div
          className={`fixed pointer-events-none text-sm rounded-lg px-3 py-2 shadow-xl z-50 max-w-xs backdrop-blur-sm ${
            isDark
              ? "bg-gray-900/95 text-white border border-white/10"
              : "bg-white/95 text-gray-900 border border-gray-200"
          }`}
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 10,
          }}
        >
          <div className="font-bold text-sm">{hoveredNode.label}</div>
          <div className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {hoveredNode.country && <span>{hoveredNode.country} &middot; </span>}
            ISCO {hoveredNode.isco}
            {hoveredNode.major_group && (
              <span> &middot; {hoveredNode.major_group}</span>
            )}
          </div>
          <div className="mt-1.5 space-y-0.5 text-xs">
            <div>
              <span className={isDark ? "text-gray-400" : "text-gray-500"}>Jobs:</span>{" "}
              {formatJobCount(hoveredNode.value)}
            </div>
            <div>
              <span className={isDark ? "text-gray-400" : "text-gray-500"}>AI Exposure:</span>{" "}
              <span className="font-bold">{formatExposure(hoveredNode.exposure)}</span>
            </div>
          </div>
          {hoveredNode.rationale && (
            <div className={`mt-1.5 text-[11px] leading-snug max-w-[280px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {hoveredNode.rationale.length > 150
                ? hoveredNode.rationale.slice(0, 150) + "..."
                : hoveredNode.rationale}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
