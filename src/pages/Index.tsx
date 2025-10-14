import { useState, useRef, useEffect } from "react";
import { Sparkles, Smartphone } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ThinkingIndicator } from "@/components/ThinkingIndicator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { translations, type Language } from "@/lib/translations";
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
  const [language, setLanguage] = useState<Language>("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const t = translations[language];

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
        body: { messages: [...messages, newUserMessage], language },
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
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-secondary animate-float" />
              <div>
                <h1 className="text-3xl font-serif font-bold bg-gradient-gold bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-sm text-muted-foreground font-sans">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open('https://wa.me/255693142943', '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                title="Contact us on WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-sm font-medium hidden sm:inline">{t.whatsapp}</span>
              </button>
              <button
                onClick={() => toast({ title: "Coming Soon", description: "Mobile app will be available soon!" })}
                className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                title="Download Mobile App (Coming Soon)"
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">{t.mobileApp}</span>
              </button>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-card/70 border border-border/30 rounded-lg px-4 py-2 text-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
              >
                <option value="en">🇬🇧 English</option>
                <option value="sw">🇹🇿 Swahili</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="it">🇮🇹 Italiano</option>
                <option value="pt">🇵🇹 Português</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="ja">🇯🇵 日本語</option>
                <option value="ar">🇸🇦 العربية</option>
                <option value="hi">🇮🇳 हिंदी</option>
              </select>
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
                  {t.welcome}
                </h2>
                <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                  {t.welcomeDesc}
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
            <ChatInput 
              onSend={handleSend} 
              onRefresh={handleRefresh} 
              disabled={isLoading}
              placeholder={t.inputPlaceholder}
              sendLabel={t.send}
              refreshLabel={t.refresh}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
