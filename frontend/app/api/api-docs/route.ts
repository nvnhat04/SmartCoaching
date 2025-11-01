import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "api-docs.json");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const apiDocs = JSON.parse(fileContent);

    return NextResponse.json(apiDocs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load API documentation" },
      { status: 500 }
    );
  }
}
