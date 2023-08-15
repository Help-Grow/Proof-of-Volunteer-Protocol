import React from "react";
import { Card, Space, Button, Result } from "antd-mobile";
import { SmileOutline } from "antd-mobile-icons";
import styles from "@/styles/common.module.css";
import { useRouter } from "next/router";

export interface WelcomeProps {}

const Welcome: React.FC<WelcomeProps> = (props) => {
  const router = useRouter();

  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Space direction="vertical" style={{ "--gap": "14px" }}>
          <Card style={{ marginBottom: "14px" }}>
            <Result
              icon={<SmileOutline />}
              title=""
              description="Appreciate your help in digital upskill for kids"
            />
          </Card>

          <Button
            block
            color="primary"
            size="large"
            onClick={() => router.push("/povp/upload-image")}
          >
            Claim POVP SBT
          </Button>
          <Button
            block
            color="default"
            size="large"
            onClick={() => router.push("/pomp_lens/attendees-list")}
          >
            Meet other volunteers
          </Button>
          <Button block color="default" size="large" disabled>
            Images & Videos
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default Welcome;
