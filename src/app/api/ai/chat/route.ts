import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { prompt, history } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let fullPrompt = prompt;

    if (history && history.length > 0) {
      const contextMessages = history
        .slice(-5)
        .map(
          (msg: any) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n");
      fullPrompt = `Previous conversation:\n${contextMessages}\n\nUser: ${prompt}\n\nAssistant:`;
    }

    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: fullPrompt,
      store: true,
    });

    return NextResponse.json(
      {
        output: response.output_text,
        success: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("OpenAI chat error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to get AI response",
        success: false,
      },
      { status: 500 }
    );
  }
}
