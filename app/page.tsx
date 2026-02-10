"use client";

import { useState } from "react";
import { Row, Col, Select, Tabs, Switch, message, Card, Typography, Tooltip } from "antd";
import { saveAs } from "file-saver";
import Header from "@/components/Header";
import EditorPanel from "@/components/EditorPanel";
import ActionBar from "@/components/ActionBar";
import { jsonToJava } from "@/lib/converters/jsonToJava";
import { jsonToCSharp } from "@/lib/converters/jsonToCSharp";
import { modelToJson } from "@/lib/converters/modelToJson";

const { Option } = Select;

export default function Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState<"java" | "csharp">("java");
  const [lombok, setLombok] = useState(true);
  const [entityMode, setEntityMode] = useState(false);
  const [activeTab, setActiveTab] = useState("json-to-model");

  // Handle language change
  const handleLanguageChange = (lang: "java" | "csharp") => {
    setLanguage(lang);
    setEntityMode(false); // reset entity mode
    if (lang === "csharp") setLombok(false); // Lombok only for Java
  };

  // Convert JSON → Model or Model → JSON
  const handleConvert = () => {
    try {
      if (activeTab === "json-to-model") {
        const json = JSON.parse(input);
        const result =
          language === "java"
            ? jsonToJava(json, "RequestModel", { lombok, entity: entityMode })
            : jsonToCSharp(json, "RequestModel", { entity: entityMode });
        setOutput(result);
      } else {
        setOutput(modelToJson(input));
      }
    } catch (e: any) {
      setOutput(`// Error: Invalid input\n// ${e.message || e}`);
    }
  };

  // Download file
  const handleDownload = () => {
    if (!output) {
      message.warning("Nothing to download!");
      return;
    }
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `RequestModel.${language === "java" ? "java" : "cs"}`);
    message.success("File downloaded!");
  };

  // Tabs using AntD items
  const tabItems = [
    {
      key: "json-to-model",
      label: "JSON → Model",
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <EditorPanel value={input} onChange={setInput} language="json" />
          </Col>
          <Col span={12}>
            <EditorPanel
              value={output}
              readOnly
              language={language === "java" ? "java" : "csharp"}
            />
          </Col>
        </Row>
      ),
    },
    {
      key: "model-to-json",
      label: "Model → JSON",
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <EditorPanel
              value={input}
              onChange={setInput}
              language={language === "java" ? "java" : "csharp"}
            />
          </Col>
          <Col span={12}>
            <EditorPanel value={output} readOnly language="json" />
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <>
      <Header />

      <Card style={{ margin: 16, padding: 16 }}>
        <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
          {/* Language Selector */}
          <Col>
            <Select value={language} onChange={handleLanguageChange} style={{ width: 160 }}>
              <Option value="java">Java</Option>
              <Option value="csharp">C#</Option>
            </Select>
          </Col>

          {/* Show Mode/Lombok only on JSON → Model tab */}
          {activeTab === "json-to-model" && language === "java" && (
            <>
              <Col>
                <Tooltip title="Switch between DTO and Entity generation">
                  Mode: {entityMode ? "Entity" : "DTO"}{" "}
                  <Switch checked={entityMode} onChange={setEntityMode} />
                </Tooltip>
              </Col>
              <Col>
                <Tooltip title="Enable Lombok annotations (DTO only)">
                  Lombok:{" "}
                  <Switch checked={lombok} onChange={setLombok} disabled={entityMode} />
                </Tooltip>
              </Col>
            </>
          )}

          {activeTab === "json-to-model" && language === "csharp" && (
            <Col>
              <Tooltip title="Switch between DTO and Entity generation">
                Mode: {entityMode ? "Entity" : "DTO"}{" "}
                <Switch checked={entityMode} onChange={setEntityMode} />
              </Tooltip>
            </Col>
          )}

          {/* Action buttons */}
          <Col>
            <ActionBar
              onConvert={handleConvert}
              onCopy={() => navigator.clipboard.writeText(output)}
              onClear={() => {
                setInput("");
                setOutput("");
              }}
              onDownload={handleDownload}
            />
          </Col>
        </Row>

        {/* Main Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </>
  );
}
