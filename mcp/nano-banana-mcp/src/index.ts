import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import fs from "fs";
import path from "path";

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

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable is required");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const server = new McpServer({
  name: "nano-banana-mcp",
  version: "1.0.0",
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

// Tool: Generate image
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

// Tool: Edit image
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

// Tool: List available models
server.tool(
  "list_models",
  "List available Nano Banana image generation models and their capabilities.",
  {},
  async () => {
    return {
      content: [{
        type: "text" as const,
        text: [
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nano Banana MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
