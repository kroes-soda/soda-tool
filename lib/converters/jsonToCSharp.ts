import { capitalize, isInteger, isIsoDate } from "../utils";

/**
 * Convert JSON → C# DTO or Entity
 * @param json JSON object
 * @param className Name of main class
 * @param options 
 *  - entity: boolean, whether to generate Entity
 *  - nullable: boolean, whether to mark properties nullable
 */
export function jsonToCSharp(
  json: any,
  className = "RequestModel",
  options: { entity?: boolean; nullable?: boolean } = { entity: false, nullable: true }
): string {
  const classes: string[] = [];
  const { entity = false, nullable = true } = options;

  function processObject(obj: any, name: string): string {
    const fields: string[] = [];
    const usings = new Set<string>();

    Object.entries(obj).forEach(([key, value], index) => {
      let type = "";
      const annotations: string[] = [];
      const propertyName = capitalize(key);

      // Nested objects / arrays
      if (Array.isArray(value) && value.length && typeof value[0] === "object") {
        const nestedName = `${capitalize(key)}${entity ? "Entity" : "Dto"}`;
        classes.push(processObject(value[0], nestedName));
        type = `List<${nestedName}>`;
        usings.add("System.Collections.Generic");

        if (entity)
          annotations.push(`[InverseProperty("${propertyName}")]`);
      } else if (typeof value === "object" && value !== null) {
        const nestedName = `${capitalize(key)}${entity ? "Entity" : "Dto"}`;
        classes.push(processObject(value, nestedName));
        type = nestedName;

        if (entity)
          annotations.push(`[ForeignKey("${propertyName}Id")]`);
      } else {
        type = resolveCSharpType(value, nullable);
        if (entity) {
          if (index === 0) annotations.unshift("[Key]"); // first field as primary key
          annotations.push("[Required]");
        }
      }

      const annotationStr = annotations.length ? annotations.map(a => "    " + a).join("\n") + "\n" : "";
      fields.push(`${annotationStr}    public ${type} ${propertyName} { get; set; }`);
    });

    const classAnnotations = entity
      ? `[Table("${name}")]\npublic class ${name} {\n${fields.join("\n")}\n}`
      : `public class ${name} {\n${fields.join("\n")}\n}`;

    // Add using statements if needed
    const usingStr = usings.size ? Array.from(usings).map(u => `using ${u};`).join("\n") + "\n\n" : "";

    return usingStr + classAnnotations;
  }

  const mainClass = processObject(json, className);
  return [mainClass, ...classes].join("\n\n");
}

// Type resolver
function resolveCSharpType(value: any, nullable = true): string {
  let type = "string";

  if (typeof value === "number") type = isInteger(value) ? "long" : "double";
  else if (typeof value === "boolean") type = "bool";
  else if (typeof value === "string") type = isIsoDate(value) ? "DateTime" : "string";
  else if (Array.isArray(value)) type = value.length ? `List<${resolveCSharpType(value[0])}>` : "List<object>";
  else if (typeof value === "object") type = "object";

  // Add nullable ? for value types if requested
  if (nullable && ["int", "long", "double", "bool", "DateTime"].includes(type)) {
    type += "?";
  }

  return type;
}
