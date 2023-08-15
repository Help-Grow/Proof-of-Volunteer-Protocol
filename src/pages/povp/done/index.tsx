import React from "react";
import { Card, Result, Space } from "antd-mobile";
import { SmileOutline } from "antd-mobile-icons";
import styles from "@/styles/common.module.css";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
} from "react-share";

export interface DonePageProps {}

const DonePage: React.FC<DonePageProps> = (props) => {
  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Card style={{ width: "100%" }}>
          <Result
            icon={<SmileOutline />}
            status="success"
            title="Done!"
            description="Also share it to let everyone know you volunteered :)"
          />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Space>
              <FacebookShareButton disabled url="">
                <FacebookIcon round size={48}></FacebookIcon>
              </FacebookShareButton>
              <TwitterShareButton disabled url="">
                <TwitterIcon round size={48}></TwitterIcon>
              </TwitterShareButton>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DonePage;
