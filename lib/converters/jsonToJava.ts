import { indent, isInteger, isIsoDate, capitalize } from "../utils";

interface JsonToJavaOptions {
  lombok?: boolean;
  entity?: boolean;
  jsonProperty?: boolean;
}

export function jsonToJava(
  json: any,
  className = "RequestDto",
  options: JsonToJavaOptions = { lombok: true, entity: false, jsonProperty: true }
): string {
  const { lombok = true, entity = false, jsonProperty = true } = options;
  const classes: string[] = [];
  let useJsonPropertyImport = false;

  function processObject(obj: any, name: string): string {
    const fields: string[] = [];

    Object.entries(obj).forEach(([key, value]) => {
      let fieldLines: string[] = [];

      // Nested objects / arrays
      if (Array.isArray(value) && value.length && typeof value[0] === "object") {
        const nestedName = `${capitalize(key)}Dto`;
        classes.push(processObject(value[0], nestedName));
        fieldLines.push(`${indent(1)}private List<${nestedName}> ${key};`);
      } else if (typeof value === "object" && value !== null) {
        const nestedName = `${capitalize(key)}Dto`;
        classes.push(processObject(value, nestedName));
        fieldLines.push(`${indent(1)}private ${nestedName} ${key};`);
      } else {
        // Simple types
        const type = resolveJavaType(value);
        if (!entity && jsonProperty) {
          fieldLines.push(`${indent(1)}@JsonProperty("${key}")`);
          useJsonPropertyImport = true;
        }
        fieldLines.push(`${indent(1)}private ${type} ${key};`);
      }

      fields.push(fieldLines.join("\n"));
    });

    const annotations = !entity && lombok ? "@Data\n@NoArgsConstructor\n@AllArgsConstructor\n" : "";
    return `${annotations}public class ${name} {\n${fields.join("\n")}\n}`;
  }

  const mainClass = processObject(json, className);

  // Add import if @JsonProperty is used
  const imports = useJsonPropertyImport ? "import com.fasterxml.jackson.annotation.JsonProperty;\n" : "";

  return [imports + mainClass, ...classes].join("\n\n");
}

function resolveJavaType(value: any): string {
  if (typeof value === "number") return isInteger(value) ? "Long" : "Double";
  if (typeof value === "boolean") return "Boolean";
  if (typeof value === "string") return isIsoDate(value) ? "LocalDate" : "String";
  if (Array.isArray(value)) return value.length ? `List<${resolveJavaType(value[0])}>` : "List<Object>";
  if (typeof value === "object") return "Object";
  return "String";
}
