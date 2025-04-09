declare module "express-xss-sanitizer" {
  import { RequestHandler } from "express";

  // xss() ফাংশনের জন্য টাইপ ডিফাইন করা
  export function xss(options?: {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
  }): RequestHandler;
}
