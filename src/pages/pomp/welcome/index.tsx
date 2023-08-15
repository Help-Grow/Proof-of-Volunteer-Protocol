import React from "react";
import { Button, Space, Result, Card } from "antd-mobile";
import { SmileOutline } from "antd-mobile-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "@/styles/common.module.css";

export interface WelcomePageProps {}

const WelcomePage: React.FC<WelcomePageProps> = (props) => {
  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Space direction="vertical" style={{ "--gap": "20px" }}>
          <Card>
            <Result
              icon={<SmileOutline />}
              status="success"
              title="Welcome to SeeDAO 1st offline DAO member meetup at Singapore"
            />
          </Card>
          <Space
            direction="vertical"
            style={{ "--gap": "10px", width: "100%" }}
          >
            <Button block size="large" disabled>
              Claim POAP NFT
            </Button>
            <Link href="/pomp/attendees-list">
              <Button block size="large" color="primary">
                View Attendee List
              </Button>
            </Link>
            <Button block size="large" disabled>
              Event Images & Videos
            </Button>
          </Space>
          <iframe
            style={{ width: "100%", height: "450px", background: "white" }}
            src="https://widget.0xecho.com?color-theme=light&desc=test&has-h-padding=true&has-v-padding=true&modules=comment%2Clike%2Ctip&receiver=0x46CE1348B3Dd340a9323aA21eD6c3a90359882cA&target_uri=https%3A%2F%2Fnice-to-meet-you.vercel.app%2Fpomp%2Fwelcome"
            frameBorder="0"
          />
        </Space>
      </div>
    </div>
  );
};

export default WelcomePage;
