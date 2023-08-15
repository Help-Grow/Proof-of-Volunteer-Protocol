import React, { useEffect, useState } from "react";
import { Card, Space, Button, Result } from "antd-mobile";
import { SmileOutline } from "antd-mobile-icons";
import styles from "@/styles/common.module.css";
import Link from "next/link";
import { useGlobalState } from "@/hooks/globalContext";

export interface AttendeeDetailProps {}

const AttendeeDetail: React.FC<AttendeeDetailProps> = () => {
  const { recipient: attendee } = useGlobalState();

  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Space direction="vertical" style={{ "--gap": "20px" }}>
          <Card style={{ width: "100%", fontSize: "18px" }}>
            <Result icon={<SmileOutline />} title="" />
            <div>
              <b>Name: </b>
              <span>{attendee?.name}</span>
            </div>
            <br />
            <div>
              <b>DAO role: </b>
              <span>{attendee?.role}</span>
            </div>
            <br />
            <div>
              <b>Self introduction:</b>
              <span>{attendee?.introduction}</span>
            </div>
          </Card>

          <Link href="/pomp/take-photo">
            <Button size="large" shape="rounded" color="primary">
              Take a joint picture to remember such a moment
            </Button>
          </Link>
        </Space>
      </div>
    </div>
  );
};

export default AttendeeDetail;
