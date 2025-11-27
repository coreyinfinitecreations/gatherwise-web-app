"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Calendar,
  Users,
  Route,
  MessageSquare,
} from "lucide-react";
import DashboardLayout from "@/components/layouts/dashboard-layout";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const animateText = async (text: string, messageId: string) => {
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: currentText, isStreaming: true }
            : msg
        )
      );
      
      await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 20));
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
    setStreamingMessageId(null);
  };

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

    const assistantMessageId = `assistant-${Date.now()}`;
    setStreamingMessageId(assistantMessageId);
    
    const placeholderMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    
    setMessages((prev) => [...prev, placeholderMessage]);

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
        await animateText(data.output, assistantMessageId);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
      setStreamingMessageId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full -m-6 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 bg-background overflow-y-auto">
            <div className="max-w-3xl w-full space-y-8 py-12">
              <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 rounded-full bg-primary/10 items-center justify-center mb-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  How can I help you today?
                </h1>
                <p className="text-muted-foreground text-lg">
                  Get assistance with church management, member care, event
                  planning, and more
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-12">
                <button
                  onClick={() => {
                    setInput("Help me plan an upcoming church event");
                    handleSend();
                  }}
                  className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">
                        Plan an event
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Get help organizing your next church gathering
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setInput("Show me member engagement statistics");
                    handleSend();
                  }}
                  className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">
                        Member insights
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Analyze engagement and growth trends
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setInput("Help me create a new pathway");
                    handleSend();
                  }}
                  className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <Route className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">
                        Create pathway
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Design a discipleship journey for members
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setInput("Draft an announcement for this weekend");
                    handleSend();
                  }}
                  className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">
                        Draft message
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Create announcements and communications
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-2 mt-8">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Message AI Assistant..."
                  className="min-h-[56px] resize-none text-base"
                  disabled={loading}
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  size="icon"
                  className="h-14 w-14 rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-background overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-8">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.role === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`flex-1 max-w-2xl ${
                        message.role === "user" ? "flex justify-end" : ""
                      }`}
                    >
                      <div
                        className={`rounded-2xl p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />
                          )}
                        </p>
                        {message.role === "assistant" && !message.isStreaming && message.content && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-8"
                            onClick={() =>
                              handleCopy(message.content, message.id)
                            }
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </div>

            <div className="border-t bg-background p-6 flex-shrink-0">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Message AI Assistant..."
                  className="min-h-[56px] resize-none text-base"
                  disabled={loading}
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  size="icon"
                  className="h-14 w-14 rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
