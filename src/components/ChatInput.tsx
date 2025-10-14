import { Send, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onRefresh: () => void;
  disabled?: boolean;
  placeholder?: string;
  sendLabel?: string;
  refreshLabel?: string;
}

export const ChatInput = ({ 
  onSend, 
  onRefresh, 
  disabled, 
  placeholder = "Ask about luxury hotels, restaurants, or destinations...",
  sendLabel = "Send",
  refreshLabel = "New Chat"
}: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 shadow-luxury">
      <div className="flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-h-[60px] max-h-[120px] resize-none bg-background/50 border-border/50 focus:border-secondary transition-colors font-sans"
        />
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            size="icon"
            className="bg-gradient-gold hover:shadow-glow transition-all duration-300 hover:scale-105"
            title={sendLabel}
          >
            <Send className="w-4 h-4 text-primary" />
          </Button>
          <Button
            onClick={onRefresh}
            disabled={disabled}
            size="icon"
            variant="outline"
            className="border-border/50 hover:border-secondary hover:bg-secondary/10 transition-all duration-300"
            title={refreshLabel}
          >
            <RotateCcw className="w-4 h-4 text-secondary" />
          </Button>
        </div>
      </div>
    </div>
  );
};
