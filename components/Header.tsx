import { Typography, Switch, Space } from "antd";
import { CodeOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.body.style.backgroundColor = checked ? "#1f1f1f" : "#fafafa";
    document.body.style.color = checked ? "#e0e0e0" : "#000";
  };

  return (
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 16px",
        background: darkMode
          ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
          : "linear-gradient(135deg, #1890ff, #40a9ff)",
        color: darkMode ? "#e0e0e0" : "#fff",
        borderRadius: "0 0 0 0",
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
        textAlign: "center",
        transition: "all 0.3s ease",
      }}
    >
      {/* Icon + Title */}
      <Space orientation="horizontal" size="middle" align="center">
        <CodeOutlined
          style={{ fontSize: 40, color: darkMode ? "#40a9ff" : "#fff" }}
        />
        <Title
          level={2}
          style={{
            margin: 0,
            color: darkMode ? "#e0e0e0" : "#fff",
            letterSpacing: 1,
          }}
        >
          Soda Tool
        </Title>
      </Space>

      {/* Subtitle */}
      <Text
        style={{
          marginTop: 8,
          fontSize: 16,
          color: darkMode ? "#cfcfcf" : "#f0f0f0",
        }}
      >
        Professional JSON ⇄ Model Converter for Java & C#
      </Text>

      {/* Dark / Light Mode Toggle */}
      <div style={{ marginTop: 16 }}>
        <Switch
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          checked={darkMode}
          onChange={toggleDarkMode}
        />
      </div>
    </header>
  );
}
