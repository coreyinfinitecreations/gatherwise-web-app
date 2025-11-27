import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: prompt || "write a haiku about ai",
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
    console.error("OpenAI test error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to call OpenAI",
        success: false,
      },
      { status: 500 }
    );
  }
}
