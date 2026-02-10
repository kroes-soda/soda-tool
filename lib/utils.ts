export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isInteger(value: number) {
  return Number.isInteger(value);
}

export function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}/.test(value);
}

export function indent(level: number) {
  return " ".repeat(level * 4);
}
