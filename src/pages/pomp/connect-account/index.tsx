import React from "react";
import { Button, Card, Form, Input, Result, Tabs } from "antd-mobile";
import { SmileOutline } from "antd-mobile-icons";
import styles from "@/styles/common.module.css";
import Link from "next/link";

export interface ConnectAccountPageProps {}

const ConnectAccountPage: React.FC<ConnectAccountPageProps> = (props) => {
  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Card style={{ width: "100%" }}>
          <Result
            icon={<SmileOutline />}
            status="success"
            title="Input Mia's account"
          />

          <Tabs defaultActiveKey="Ethereum">
            <Tabs.Tab title="Ethereum Address" key="Ethereum">
              <Input placeholder="Input Ethereum Address"></Input>
            </Tabs.Tab>
            <Tabs.Tab title="Unipass Account" key="Unipass">
              <Input placeholder="Input Unipass Account"></Input>
            </Tabs.Tab>
          </Tabs>
        </Card>
        <Link href="/done">
          <Button block color="primary" size="large">
            Share
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ConnectAccountPage;
