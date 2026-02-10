import { indent, isInteger, isIsoDate, capitalize } from "../utils";

/**
 * Convert JSON → Java DTO or Entity
 * @param json JSON object
 * @param className Name of main class
 * @param options 
 *  - lombok: boolean, whether to add Lombok annotations (only if entity=false)
 *  - entity: boolean, whether to generate Entity
 */
export function jsonToJava(
  json: any,
  className = "RequestModel",
  options: { lombok?: boolean; entity?: boolean } = { lombok: true, entity: false }
): string {
  const classes: string[] = [];
  const { lombok = true, entity = false } = options;

  function processObject(obj: any, name: string): string {
    const fields: string[] = [];

    Object.entries(obj).forEach(([key, value], index) => {
      let fieldType = "";
      const annotations: string[] = [];

      // Nested arrays / objects
      if (Array.isArray(value) && value.length && typeof value[0] === "object") {
        const nestedName = `${capitalize(key)}${entity ? "Entity" : "Dto"}`;
        classes.push(processObject(value[0], nestedName));
        fieldType = `List<${nestedName}>`;

        if (entity)
          annotations.push(
            `@OneToMany(cascade = CascadeType.ALL)\n${indent(1)}@JoinColumn(name = "${key}_id")`
          );
      } else if (typeof value === "object" && value !== null) {
        const nestedName = `${capitalize(key)}${entity ? "Entity" : "Dto"}`;
        classes.push(processObject(value, nestedName));
        fieldType = nestedName;

        if (entity)
          annotations.push(`@OneToOne(cascade = CascadeType.ALL)\n${indent(1)}@JoinColumn(name = "${key}_id")`);
      } else {
        fieldType = resolveJavaType(value);
        if (entity) annotations.push(`@Column(name = "${key}")`);
      }

      // Primary key for Entity
      if (index === 0 && entity) {
        annotations.unshift(`@Id\n${indent(1)}@GeneratedValue(strategy = GenerationType.IDENTITY)`);
      }

      const annotationStr = annotations.length ? annotations.map(a => indent(1) + a).join("\n") + "\n" : "";
      fields.push(`${annotationStr}${indent(1)}private ${fieldType} ${key};`);
    });

    // Class-level annotations
    const classAnnotations = entity
      ? `@Entity\n@Table(name = "${name.toLowerCase()}")\n`
      : lombok
      ? `@Data\n@NoArgsConstructor\n@AllArgsConstructor\n`
      : "";

    return `${classAnnotations}public class ${name} {\n${fields.join("\n")}\n}`;
  }

  const mainClass = processObject(json, className);
  return [mainClass, ...classes].join("\n\n");
}

// Type resolver
function resolveJavaType(value: any): string {
  if (typeof value === "number") return isInteger(value) ? "Long" : "Double";
  if (typeof value === "boolean") return "Boolean";
  if (typeof value === "string") return isIsoDate(value) ? "LocalDate" : "String";
  if (Array.isArray(value)) return value.length ? `List<${resolveJavaType(value[0])}>` : "List<Object>";
  if (typeof value === "object") return "Object";
  return "String";
}
