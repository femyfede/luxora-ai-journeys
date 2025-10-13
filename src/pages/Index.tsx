import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ThinkingIndicator } from "@/components/ThinkingIndicator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import bgHotel from "@/assets/bg-hotel.jpg";
import bgRestaurant from "@/assets/bg-restaurant.jpg";
import bgTravel from "@/assets/bg-travel.jpg";
import bgDefault from "@/assets/bg-default.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BACKGROUNDS = {
  hotel: bgHotel,
  restaurant: bgRestaurant,
  travel: bgTravel,
  default: bgDefault,
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [background, setBackground] = useState(BACKGROUNDS.default);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectBackgroundTopic = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("hotel") || lowerText.includes("resort") || lowerText.includes("accommodation")) {
      return "hotel";
    }
    if (lowerText.includes("restaurant") || lowerText.includes("dining") || lowerText.includes("food")) {
      return "restaurant";
    }
    if (lowerText.includes("travel") || lowerText.includes("destination") || lowerText.includes("beach") || lowerText.includes("spa")) {
      return "travel";
    }
    return "default";
  };

  const handleSend = async (userMessage: string) => {
    const newUserMessage: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("luxora-chat", {
        body: { messages: [...messages, newUserMessage] },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Service Notice",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      const assistantMessage = data?.choices?.[0]?.message?.content || "I apologize, but I couldn't process that request. Please try again.";
      
      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
      
      // Change background based on the response
      const topic = detectBackgroundTopic(assistantMessage);
      setBackground(BACKGROUNDS[topic as keyof typeof BACKGROUNDS]);

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: "Unable to reach Luxora AI. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setMessages([]);
    setBackground(BACKGROUNDS.default);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${background})` }}
      />
      <div className="absolute inset-0 bg-gradient-overlay" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="backdrop-blur-md bg-[var(--glass-bg)] border-b border-[var(--glass-border)] py-6 px-6 shadow-luxury">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-secondary animate-float" />
            <div>
              <h1 className="text-3xl font-serif font-bold bg-gradient-gold bg-clip-text text-transparent">
                Luxora AI
              </h1>
              <p className="text-sm text-muted-foreground font-sans">Your Luxury Travel Concierge</p>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <main className="flex-1 overflow-y-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-20 animate-fade-in">
                <Sparkles className="w-16 h-16 text-secondary mx-auto mb-6 animate-float" />
                <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
                  Welcome to Luxora AI
                </h2>
                <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                  Your personal luxury travel assistant. Ask me about exquisite hotels, 
                  fine dining experiences, or exclusive travel destinations.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <ChatMessage key={idx} role={msg.role} content={msg.content} />
            ))}

            {isLoading && <ThinkingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <div className="py-6 px-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={handleSend} onRefresh={handleRefresh} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
