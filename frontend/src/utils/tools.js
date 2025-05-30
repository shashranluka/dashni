export function splitTextToWords(text) {
  if (!text) return [];
  // Split by spaces, punctuation, and special characters
  return text.split(/[\s,;:.!?()]+/).filter(word => word.trim() !== '');
}