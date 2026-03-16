import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import fs from "fs";
import path from "path";
import os from "os";

// --- API Key Management ---
// Priority: env var > config file
const CONFIG_DIR = path.join(os.homedir(), ".config", "nano-banana");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

function readConfigKey(): string {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      return config.gemini_api_key || "";
    }
  } catch {}
  return "";
}

function writeConfigKey(key: string): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ gemini_api_key: key }, null, 2));
}

function getApiKey(): string {
  return process.env.GEMINI_API_KEY || readConfigKey();
}

function getAI(): GoogleGenAI | null {
  const key = getApiKey();
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

function notConfiguredError() {
  return {
    content: [{
      type: "text" as const,
      text: [
        "❌ GEMINI_API_KEY not configured.",
        "",
        "Run the `configure` tool with your Gemini API key:",
        '  configure({ gemini_api_key: "AIza..." })',
        "",
        "Or set the GEMINI_API_KEY environment variable.",
        "Get a key at: https://aistudio.google.com/apikey",
      ].join("\n"),
    }],
    isError: true,
  };
}

// --- Constants ---
const MODELS = {
  "nano-banana-2": "gemini-3.1-flash-image-preview",
  "nano-banana-pro": "gemini-3-pro-image-preview",
  "nano-banana": "gemini-2.5-flash-image",
} as const;

type ModelAlias = keyof typeof MODELS;

const ASPECT_RATIOS = [
  "1:1", "1:4", "1:8", "2:3", "3:2", "3:4",
  "4:1", "4:3", "4:5", "5:4", "8:1", "9:16", "16:9", "21:9",
] as const;

const IMAGE_SIZES = ["512px", "1K", "2K", "4K"] as const;

// --- Server Setup (always starts, even without key) ---
const server = new McpServer({
  name: "nano-banana-mcp",
  version: "1.1.0",
});

// Helper: read image file and return inlineData part
function readImagePart(imagePath: string) {
  const resolvedPath = path.resolve(imagePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Image not found: ${resolvedPath}`);
  }
  const imageData = fs.readFileSync(resolvedPath);
  const base64 = imageData.toString("base64");
  const ext = path.extname(resolvedPath).toLowerCase();
  const mimeType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return { inlineData: { mimeType, data: base64 } };
}

// --- Tool: Configure API Key ---
server.tool(
  "configure",
  "Configure the Gemini API key for image generation. The key is saved to ~/.config/nano-banana/config.json and persists across sessions. Get a key at https://aistudio.google.com/apikey",
  {
    gemini_api_key: z.string().describe("Your Gemini API key (starts with 'AIza...')"),
  },
  async ({ gemini_api_key }) => {
    if (!gemini_api_key || gemini_api_key.trim().length === 0) {
      return {
        content: [{ type: "text" as const, text: "Error: API key cannot be empty." }],
        isError: true,
      };
    }

    const key = gemini_api_key.trim();

    // Validate the key by making a lightweight API call
    try {
      const testAI = new GoogleGenAI({ apiKey: key });
      await testAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say OK",
        config: { maxOutputTokens: 5 },
      });
    } catch (error: any) {
      if (error.message?.includes("API_KEY_INVALID") || error.status === 400 || error.status === 403) {
        return {
          content: [{ type: "text" as const, text: `Error: Invalid API key. ${error.message}` }],
          isError: true,
        };
      }
      // Other errors (network, rate limit) are OK — key format is probably valid
    }

    writeConfigKey(key);

    return {
      content: [{
        type: "text" as const,
        text: [
          "✅ Gemini API key configured and saved.",
          `   Config: ${CONFIG_FILE}`,
          "",
          "Image generation tools are now ready to use.",
        ].join("\n"),
      }],
    };
  }
);

// --- Tool: Generate Image ---
server.tool(
  "generate_image",
  "Generate an image using Google Nano Banana Pro 2 (or other Nano Banana models). Returns the image saved to a file.",
  {
    prompt: z.string().describe("Text prompt describing the image to generate"),
    image_paths: z.array(z.string()).optional().describe("Optional reference image paths. Provide one or more images to guide generation (e.g. style reference, subject reference)."),
    model: z.enum(["nano-banana-2", "nano-banana-pro", "nano-banana"]).default("nano-banana-2").describe("Model to use: nano-banana-2 (fast, default), nano-banana-pro (best quality), nano-banana (high-volume)"),
    aspect_ratio: z.enum(ASPECT_RATIOS).default("1:1").describe("Aspect ratio of the generated image"),
    image_size: z.enum(IMAGE_SIZES).default("2K").describe("Output image resolution"),
    output_dir: z.string().default(".").describe("Directory to save the generated image"),
    filename: z.string().optional().describe("Output filename (without extension). Auto-generated if not provided."),
  },
  async ({ prompt, image_paths, model, aspect_ratio, image_size, output_dir, filename }) => {
    const ai = getAI();
    if (!ai) return notConfiguredError();

    try {
      const modelId = MODELS[model as ModelAlias];

      // Build contents: optional images + text prompt
      let contents: any;
      if (image_paths && image_paths.length > 0) {
        const parts: any[] = image_paths.map((p) => readImagePart(p));
        parts.push({ text: prompt });
        contents = [{ role: "user", parts }];
      } else {
        contents = prompt;
      }

      const response = await ai.models.generateContent({
        model: modelId,
        contents,
        config: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: aspect_ratio,
            imageSize: image_size,
          },
        },
      });

      const outputPath = path.resolve(output_dir);
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const results: string[] = [];
      let textContent = "";
      let imageCount = 0;

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            textContent += part.text;
          }
          if (part.inlineData) {
            imageCount++;
            const ext = part.inlineData.mimeType?.includes("jpeg") ? "jpg" : "png";
            const name = filename
              ? (imageCount > 1 ? `${filename}_${imageCount}.${ext}` : `${filename}.${ext}`)
              : `nano_banana_${Date.now()}_${imageCount}.${ext}`;
            const filePath = path.join(outputPath, name);
            const buffer = Buffer.from(part.inlineData.data!, "base64");
            fs.writeFileSync(filePath, buffer);
            results.push(filePath);
          }
        }
      }

      if (results.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `No image was generated. Model response: ${textContent || "(empty)"}`,
          }],
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: [
            `Generated ${results.length} image(s) using ${model} (${modelId}):`,
            ...results.map((r) => `  - ${r}`),
            textContent ? `\nModel notes: ${textContent}` : "",
          ].filter(Boolean).join("\n"),
        }],
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text" as const,
          text: `Error generating image: ${error.message}`,
        }],
        isError: true,
      };
    }
  }
);

// --- Tool: Edit Image ---
server.tool(
  "edit_image",
  "Edit an existing image using Nano Banana Pro 2. Provide a source image and a text prompt describing the desired edits.",
  {
    prompt: z.string().describe("Text prompt describing how to edit the image"),
    image_path: z.string().describe("Path to the source image to edit"),
    additional_images: z.array(z.string()).optional().describe("Optional additional reference image paths for multi-image editing (e.g. style reference, subject to insert)."),
    model: z.enum(["nano-banana-2", "nano-banana-pro", "nano-banana"]).default("nano-banana-2").describe("Model to use"),
    output_dir: z.string().default(".").describe("Directory to save the edited image"),
    filename: z.string().optional().describe("Output filename (without extension)"),
  },
  async ({ prompt, image_path, additional_images, model, output_dir, filename }) => {
    const ai = getAI();
    if (!ai) return notConfiguredError();

    try {
      const resolvedPath = path.resolve(image_path);
      if (!fs.existsSync(resolvedPath)) {
        return {
          content: [{ type: "text" as const, text: `Source image not found: ${resolvedPath}` }],
          isError: true,
        };
      }

      // Build parts: primary image + additional images + text prompt
      const parts: any[] = [readImagePart(resolvedPath)];
      if (additional_images && additional_images.length > 0) {
        for (const img of additional_images) {
          parts.push(readImagePart(img));
        }
      }
      parts.push({ text: prompt });

      const modelId = MODELS[model as ModelAlias];
      const response = await ai.models.generateContent({
        model: modelId,
        contents: [{ role: "user", parts }],
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      const outputPath = path.resolve(output_dir);
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const results: string[] = [];
      let textContent = "";

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            textContent += part.text;
          }
          if (part.inlineData) {
            const outExt = part.inlineData.mimeType?.includes("jpeg") ? "jpg" : "png";
            const name = filename
              ? `${filename}.${outExt}`
              : `nano_banana_edit_${Date.now()}.${outExt}`;
            const filePath = path.join(outputPath, name);
            const buffer = Buffer.from(part.inlineData.data!, "base64");
            fs.writeFileSync(filePath, buffer);
            results.push(filePath);
          }
        }
      }

      if (results.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `No edited image returned. Model response: ${textContent || "(empty)"}`,
          }],
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: [
            `Edited image saved:`,
            ...results.map((r) => `  - ${r}`),
            textContent ? `\nModel notes: ${textContent}` : "",
          ].filter(Boolean).join("\n"),
        }],
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text" as const,
          text: `Error editing image: ${error.message}`,
        }],
        isError: true,
      };
    }
  }
);

// --- Tool: List Models ---
server.tool(
  "list_models",
  "List available Nano Banana image generation models and their capabilities.",
  {},
  async () => {
    const configured = !!getApiKey();
    return {
      content: [{
        type: "text" as const,
        text: [
          configured ? "✅ API key configured" : "❌ API key not configured (run `configure` tool first)",
          "",
          "Available Nano Banana models:",
          "",
          "1. nano-banana-2 (gemini-3.1-flash-image-preview)",
          "   - Best balance of speed and quality",
          "   - Supports thinking levels for complex prompts",
          "   - Up to 4K resolution",
          "",
          "2. nano-banana-pro (gemini-3-pro-image-preview)",
          "   - Highest quality for professional assets",
          "   - Best text rendering and detail",
          "   - Up to 4K resolution",
          "",
          "3. nano-banana (gemini-2.5-flash-image)",
          "   - Fastest generation, optimized for high-volume",
          "   - Good for rapid prototyping",
          "   - Up to 4K resolution",
          "",
          "Supported aspect ratios: 1:1, 1:4, 1:8, 2:3, 3:2, 3:4, 4:1, 4:3, 4:5, 5:4, 8:1, 9:16, 16:9, 21:9",
          "Supported sizes: 512px, 1K, 2K, 4K",
        ].join("\n"),
      }],
    };
  }
);

// --- Start Server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const keyStatus = getApiKey() ? "configured" : "NOT configured (run configure tool)";
  console.error(`Nano Banana MCP server running on stdio [API key: ${keyStatus}]`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
