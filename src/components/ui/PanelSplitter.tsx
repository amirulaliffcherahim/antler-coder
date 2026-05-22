import { useRef, useState } from "react";

interface PanelSplitterProps {
  orientation: "vertical" | "horizontal";
  onMouseDown: (e: React.MouseEvent) => void;
}

/**
 * A draggable panel divider.
 *
 * - vertical: sits between sidebar and editor (cursor-col-resize)
 * - horizontal: sits between editor and terminal (cursor-row-resize)
 *
 * Shows a thin accent highlight on hover and during active drag.
 */
export function PanelSplitter({ orientation, onMouseDown }: PanelSplitterProps) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isVertical = orientation === "vertical";

  return (
    <div
      ref={ref}
      onMouseDown={(e) => {
        setActive(true);
        onMouseDown(e);
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={`shrink-0 relative transition-colors ${
        isVertical
          ? "w-1 cursor-col-resize hover:bg-neon-cyan/30"
          : "h-1 cursor-row-resize hover:bg-neon-cyan/30"
      } ${active ? "bg-neon-cyan/30" : "bg-transparent"}`}
    >
      {/* Wider invisible hit area */}
      <div
        className={`absolute inset-0 ${isVertical ? "-left-1 right-0" : "-top-0.5 bottom-0"}`}
      />
    </div>
  );
}
