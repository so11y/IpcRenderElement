import crypto from "crypto";

export function generateBase64Key(text: string, length = 12) {
  const unicodeStr = Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0);
      return code >= 0x4e00 && code <= 0x9fff
        ? `\\u${code.toString(16).padStart(4, "0")}`
        : char;
    })
    .join("");

  const hash = crypto.createHash("sha256");
  hash.update(unicodeStr);
  return hash.digest("base64").substring(0, length);
}



