import React, { useState } from "react";
import {
  Result,
  Form,
  Input,
  List,
  Card,
  InfiniteScroll,
  Dialog,
} from "antd-mobile";
import { useRouter } from "next/router";
import { SmileOutline, UserContactOutline } from "antd-mobile-icons";
import { Attendee } from "@/types/attendee";
import { ATTENDEES } from "@/json/attendees";
import styles from "@/styles/common.module.css";
import { useSetGlobalState } from "@/hooks/globalContext";

export interface AttendeesListProps {}

const AttendeesList: React.FC<AttendeesListProps> = (props) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [searchKey, setSearchKey] = useState("");
  const setGlobalState = useSetGlobalState();

  const handleSelectAttendee = async (item: Attendee) => {
    const result = await Dialog.confirm({
      content: (
        <span>
          You have selected <b>{item.name}</b>
        </span>
      ),
      cancelText: "Cancel",
      confirmText: "Confirm",
    });
    if (result) {
      router.push({
        pathname: "/pomp/attendee-detail",
      });
      setGlobalState((pre) => ({ ...pre, recipient: item }));
    }
  };

  const handleSearch = (changedValues: { name: string }) => {
    const { name } = changedValues;
    setSearchKey(name);
  };

  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <div>
          <Card>
            <Result
              icon={<SmileOutline />}
              title={
                <p>
                  To Meet other attendees and mint{" "}
                  <b>Proof of Meet Protocol SBT</b> to remember each other
                </p>
              }
            />

            <Form form={form} onValuesChange={handleSearch}>
              <Form.Item label="" name="name">
                <Input placeholder="Search the name"></Input>
              </Form.Item>
            </Form>
          </Card>

          <List
            header="Attendees list"
            mode="card"
            style={{ margin: "12px 0px 36px 0px" }}
          >
            <div style={{ minHeight: "332px" }}>
              {ATTENDEES.filter(
                (item) =>
                  !searchKey ||
                  item.name
                    .toLowerCase()
                    .trim()
                    .includes(searchKey.toLowerCase().trim())
              ).map((item) => {
                return (
                  <List.Item
                    prefix={
                      <UserContactOutline
                        width={32}
                        height={32}
                        color="var(--adm-color-primary)"
                      />
                    }
                    key={item.email}
                    description={item.role}
                    onClick={() => handleSelectAttendee(item)}
                  >
                    {item.name}
                  </List.Item>
                );
              })}
              <InfiniteScroll loadMore={async () => {}} hasMore={false}>
                <span>--- No more ---</span>
              </InfiniteScroll>
            </div>
          </List>
        </div>
      </div>
    </div>
  );
};

export default AttendeesList;
