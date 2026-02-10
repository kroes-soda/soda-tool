import { Button, Space, message } from "antd";
import { CopyOutlined, DeleteOutlined, PlayCircleOutlined, DownloadOutlined } from "@ant-design/icons";

interface Props {
  onConvert: () => void;
  onCopy: () => void;
  onClear: () => void;
  onDownload: () => void;
}

export default function ActionBar({ onConvert, onCopy, onClear, onDownload }: Props) {
  const handleCopy = () => {
    onCopy();
    message.success("Copied to clipboard!");
  };

  const handleClear = () => {
    onClear();
    message.info("Cleared!");
  };

  return (
    <Space>
      <Button type="primary" icon={<PlayCircleOutlined />} onClick={onConvert}>
        Convert
      </Button>
      <Button icon={<CopyOutlined />} onClick={handleCopy}>
        Copy
      </Button>
      <Button danger icon={<DeleteOutlined />} onClick={handleClear}>
        Clear
      </Button>
      <Button icon={<DownloadOutlined />} onClick={onDownload}>
        Download
      </Button>
    </Space>
  );
}
