import { useEffect } from "react";
import { handleKeydown, resetSpaceChord } from "../shortcuts";

export function useGlobalShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable ||
        target?.closest("[contenteditable]");

      if (isEditable && e.key !== "Escape") return;

      handleKeydown(e);
    };

    const onClick = () => {
      resetSpaceChord();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
    };
  }, []);
}
