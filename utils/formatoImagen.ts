type Extension = "jpg" | "png" | "webp";

export function detectarFormato(bytes: Uint8Array): Extension | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    return "jpg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b))
    return "png";
  if (
    bytes.length >= 12 &&
    [82, 73, 70, 70].every((b, i) => bytes[i] === b) &&
    [87, 69, 66, 80].every((b, i) => bytes[i + 8] === b)
  )
    return "webp";
  return null;
}
