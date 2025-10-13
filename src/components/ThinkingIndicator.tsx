import { Loader2 } from "lucide-react";

export const ThinkingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl rounded-tl-sm p-5 shadow-glow">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-secondary animate-spin" />
          <span className="text-foreground/80 font-sans text-sm italic">
            Luxora AI is thinking...
          </span>
        </div>
      </div>
    </div>
  );
};
