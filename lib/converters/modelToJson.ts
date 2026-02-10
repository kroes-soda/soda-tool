export function modelToJson(model: string): string {
  const lines = model.split("\n");
  const json: Record<string, any> = {};

  lines.forEach(line => {
    const javaMatch = line.match(/private\s+(\w+)\s+(\w+);/);
    const csharpMatch = line.match(/public\s+(\w+)\s+(\w+)/);

    if (javaMatch) {
      const [, type, name] = javaMatch;
      json[name] = defaultValue(type);
    }
    if (csharpMatch) {
      const [, type, name] = csharpMatch;
      json[camelCase(name)] = defaultValue(type);
    }
  });

  return JSON.stringify(json, null, 2);
};

function defaultValue(type: string) {
  const t = type.toLowerCase();
  if (t.includes("string")) return "";
  if (t.includes("long") || t.includes("int")) return 0;
  if (t.includes("double") || t.includes("decimal")) return 0.0;
  if (t.includes("bool")) return false;
  if (t.includes("date")) return "2025-01-01";
  if (t.includes("list")) return [];
  return null;
}

function camelCase(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
