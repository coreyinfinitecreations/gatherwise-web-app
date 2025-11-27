"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Send,
  Sparkles,
  Loader2,
  Minimize2,
  Maximize2,
  GripVertical,
} from "lucide-react";
import { useAIChat } from "@/contexts/ai-chat-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIChatBubble() {
  const { isVisible } = useAIChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isInitialMount = useRef(true);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (isVisible) {
        setShouldRender(true);
        setIsAnimating(true);
      }
      return;
    }

    if (isVisible) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    const savedPosition = localStorage.getItem("aiChatBubblePosition");
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    } else {
      const bottomOffset = 24;
      const rightOffset = 24;
      setPosition({
        x: window.innerWidth - rightOffset - 56,
        y: window.innerHeight - bottomOffset - 56,
      });
    }
  }, []);

  useEffect(() => {
    if (position === null) return;

    const updatePosition = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        return {
          x: Math.max(0, Math.min(prev.x, window.innerWidth - 56)),
          y: Math.max(0, Math.min(prev.y, window.innerHeight - 56)),
        };
      });
    };

    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [position]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      !lastMessage ||
      lastMessage.role !== "assistant" ||
      typingMessageId !== lastMessage.id
    )
      return;

    const fullContent = lastMessage.content;
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex <= fullContent.length) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === lastMessage.id
              ? { ...msg, content: fullContent.slice(0, currentIndex) }
              : msg
          )
        );
        currentIndex++;
      } else {
        setTypingMessageId(null);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [typingMessageId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (!position) return;

    e.preventDefault();
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - position.x,
      offsetY: e.clientY - position.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;

      e.preventDefault();

      const newX = e.clientX - dragRef.current.offsetX;
      const newY = e.clientY - dragRef.current.offsetY;

      const newPosition = {
        x: Math.max(0, Math.min(newX, window.innerWidth - 56)),
        y: Math.max(0, Math.min(newY, window.innerHeight - 56)),
      };

      setPosition(newPosition);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;

      const dragDistance = Math.sqrt(
        Math.pow(e.clientX - dragRef.current.startX, 2) +
          Math.pow(e.clientY - dragRef.current.startY, 2)
      );

      dragRef.current.isDragging = false;
      setIsDragging(false);

      if (position) {
        localStorage.setItem("aiChatBubblePosition", JSON.stringify(position));
      }

      if (dragDistance < 5 && !isOpen) {
        setIsOpen(true);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isOpen, position]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input.trim(),
          history: messages.slice(-10),
        }),
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.output,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setTypingMessageId(assistantMessage.id);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!shouldRender) return null;

  if (!isOpen) {
    return (
      <div
        className="fixed z-50"
        style={{
          left: position ? `${position.x}px` : "0px",
          top: position ? `${position.y}px` : "0px",
          cursor: isDragging ? "grabbing" : "grab",
          opacity: isAnimating && position ? 1 : 0,
          transform: isAnimating
            ? "translateY(0) scale(1)"
            : "translateY(200px) scale(0.3)",
          transition: isDragging
            ? "none"
            : "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseDown={(e) => {
          if (!position) return;
          e.preventDefault();
          dragRef.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            offsetX: e.clientX - position.x,
            offsetY: e.clientY - position.y,
          };
          setIsDragging(true);
        }}
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 pointer-events-none"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={chatRef}
      className="fixed z-50"
      style={{
        left: position ? `${position.x}px` : "0px",
        top: position ? `${position.y}px` : "0px",
        cursor: isDragging ? "grabbing" : "default",
        opacity: isAnimating && position ? 1 : 0,
        transform: isAnimating
          ? "translateY(0) scale(1)"
          : "translateY(200px) scale(0.3)",
        transition: isDragging
          ? "none"
          : "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        className={`bg-background border rounded-lg shadow-2xl flex flex-col ${
          isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
        }`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">
                Always here to help
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                    <p>Start a conversation with your AI assistant</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                        {typingMessageId === message.id && (
                          <span className="animate-pulse">|</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={loading}
                  className="flex-1"
                  autoComplete="off"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
