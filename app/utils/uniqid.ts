export default function uniqid(prefix = "", suffix = ""): string {
  return (
    (prefix || "") +
    time().toString(36) +
    generateCryptoRandom() +
    (suffix || "")
  );
}

// Generate a cryptographically secure random string
function generateCryptoRandom(): string {
  // Create a Uint8Array of 2 bytes (16 bits, equivalent to the original 2^8 * 2^8)
  const array = new Uint8Array(2);

  // Fill the array with cryptographically strong random values
  crypto.getRandomValues(array);

  // Convert to a single number and then to base36 string, padding to ensure consistent length
  return Array.from(array)
    .reduce((acc, val) => acc * 256 + val, 0)
    .toString(36)
    .padStart(4, "0")
    .slice(0, 4); // Ensure consistent length
}

let lastValue = 0;
function time(): number {
  const time = Date.now();
  const last = lastValue || time;
  lastValue = time > last ? time : last + 1;
  return lastValue;
}
