import { User, Sparkles } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = content.length > 300;

  const formatContent = (text: string) => {
    // Parse numbered lists and format them nicely
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Check if line starts with a number
      const numberMatch = line.match(/^(\d+)\.\s*\*\*(.+?)\*\*\s*-\s*(.+)$/);
      if (numberMatch) {
        return (
          <div key={idx} className="mb-4 last:mb-0">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-sm font-semibold">
                {numberMatch[1]}
              </span>
              <div>
                <h4 className="font-semibold text-foreground mb-1">{numberMatch[2]}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{numberMatch[3]}</p>
              </div>
            </div>
          </div>
        );
      }
      
      // Regular line
      if (line.trim()) {
        return <p key={idx} className="mb-2 last:mb-0 leading-relaxed">{line}</p>;
      }
      return null;
    });
  };

  const displayContent = isLong && !isExpanded ? content.slice(0, 300) + "..." : content;

  if (role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[80%] md:max-w-[70%] backdrop-blur-md bg-gradient-gold rounded-2xl rounded-tr-sm p-4 shadow-luxury">
          <div className="flex items-start gap-3">
            <p className="text-primary font-medium flex-1">{content}</p>
            <User className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[85%] md:max-w-[75%] backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl rounded-tl-sm p-5 shadow-glow">
        <div className="flex items-start gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <span className="font-serif font-semibold text-secondary">Luxora AI</span>
        </div>
        <div className="text-foreground/90 font-sans text-sm">
          {formatContent(displayContent)}
        </div>
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-xs text-secondary hover:text-accent transition-colors font-medium"
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
};
