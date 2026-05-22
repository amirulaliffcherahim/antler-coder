import { useState, useCallback, useRef, useEffect } from "react";

const STORAGE_PREFIX = "antler:layout:";

function loadSize(key: string, defaultPx: number): number {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw !== null) {
      const val = Number(raw);
      return Number.isFinite(val) ? val : defaultPx;
    }
  } catch {
    // localStorage unavailable
  }
  return defaultPx;
}

function saveSize(key: string, px: number) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, String(px));
  } catch {
    // localStorage unavailable
  }
}

/**
 * Draggable panel resize hook.
 *
 * @param key - unique layout key (e.g. "sidebar", "terminal")
 * @param defaultPx - default size in pixels
 * @param minPx - minimum size
 * @param maxPx - maximum size
 * @returns [sizePx, dragHandlers]
 *
 * Usage:
 *   const [sidebarPx, drag] = usePanelSize("sidebar", 224, 160, 400);
 *   <aside style={{ width: sidebarPx }}> ... </aside>
 *   <PanelSplitter onMouseDown={drag.onMouseDown} />
 */
export function usePanelSize(
  key: string,
  defaultPx: number,
  minPx: number,
  maxPx: number,
): [number, { onMouseDown: (e: React.MouseEvent) => void }] {
  const [size, setSize] = useState(() => loadSize(key, defaultPx));
  const dragRef = useRef<{
    startX: number;
    startSize: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startSize: size };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const newSize = Math.min(maxPx, Math.max(minPx, dragRef.current.startSize + dx));
        setSize(newSize);
      };

      const handleMouseUp = () => {
        if (!dragRef.current) return;
        const finalSize = Math.min(
          maxPx,
          Math.max(minPx, dragRef.current.startSize),
        );
        saveSize(key, finalSize);
        dragRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [size, key, minPx, maxPx],
  );

  // Clean up if unmounted mid-drag
  useEffect(() => {
    return () => {
      if (dragRef.current) {
        saveSize(key, size);
        dragRef.current = null;
      }
    };
  }, [key, size]);

  return [size, { onMouseDown: handleMouseDown }];
}

/**
 * Draggable horizontal panel resize hook.
 * Same as usePanelSize but tracks Y-axis instead of X.
 */
export function usePanelSizeVertical(
  key: string,
  defaultPx: number,
  minPx: number,
  maxPx: number,
): [number, { onMouseDown: (e: React.MouseEvent) => void }] {
  const [size, setSize] = useState(() => loadSize(key, defaultPx));
  const dragRef = useRef<{
    startY: number;
    startSize: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { startY: e.clientY, startSize: size };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dy = ev.clientY - dragRef.current.startY;
        const newSize = Math.min(maxPx, Math.max(minPx, dragRef.current.startSize + dy));
        setSize(newSize);
      };

      const handleMouseUp = () => {
        if (!dragRef.current) return;
        const finalSize = Math.min(
          maxPx,
          Math.max(minPx, dragRef.current.startSize),
        );
        saveSize(key, finalSize);
        dragRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [size, key, minPx, maxPx],
  );

  useEffect(() => {
    return () => {
      if (dragRef.current) {
        saveSize(key, size);
        dragRef.current = null;
      }
    };
  }, [key, size]);

  return [size, { onMouseDown: handleMouseDown }];
}

/**
 * Reset all persisted layout sizes.
 */
export function resetPanelLayout() {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(STORAGE_PREFIX)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
