"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { Loader2, Sparkles } from "lucide-react";

export default function AITestPage() {
  const [prompt, setPrompt] = useState("write a haiku about ai");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!response || isTyping) return;

    setIsTyping(true);
    setDisplayedText("");
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex <= response.length) {
        setDisplayedText(response.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [response]);

  const handleTest = async () => {
    try {
      setLoading(true);
      setResponse(null);
      setDisplayedText("");

      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.output);
        toast.success("AI response received!");
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error: any) {
      console.error("Test error:", error);
      toast.error(error.message || "Failed to test OpenAI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OpenAI Test</h1>
          <p className="text-muted-foreground">
            Test the OpenAI integration with GPT-5-nano
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Test Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter your prompt:</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your prompt here..."
                rows={4}
                className="resize-none"
              />
            </div>

            <Button onClick={handleTest} disabled={loading || !prompt.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Test OpenAI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {(displayedText || loading) && (
          <Card>
            <CardHeader>
              <CardTitle>AI Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg min-h-[100px]">
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">
                    {displayedText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
