import React from "react";
import {
  NoticeBar,
  Space,
  Input,
  Form,
  Button,
  Result,
  Card,
} from "antd-mobile";
import { SmileOutline } from "antd-mobile-icons";
import { useRouter } from "next/router";
import styles from "@/styles/common.module.css";
import { useSetGlobalState } from "@/hooks/globalContext";

export interface CheckInPageProps {}

const CheckInPage: React.FC<CheckInPageProps> = (props) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const setGlobalState = useSetGlobalState();

  const handleSubmit = async () => {
    const { email } = await form.validateFields();
    router.push({ pathname: "/welcome" });
    setGlobalState((pre) => ({ ...pre, email }));
  };

  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Space direction="vertical" style={{ "--gap": "20px" }}>
          <Card>
            <Space direction="vertical" style={{ "--gap": "16px" }}>
              <Result
                icon={<SmileOutline />}
                status="success"
                title="Use the email you registered to check-in"
              />

              <Form layout="horizontal" form={form}>
                <Form.Item
                  label=""
                  name="email"
                  validateTrigger="onBlur"
                  rules={[
                    { required: true, message: "Please input" },
                    { type: "email", message: "Invalid email" },
                  ]}
                >
                  <Input placeholder="Input Email" clearable />
                </Form.Item>
              </Form>
            </Space>
          </Card>
          <Button block color="primary" onClick={handleSubmit} size="large">
            Check-in
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default CheckInPage;
