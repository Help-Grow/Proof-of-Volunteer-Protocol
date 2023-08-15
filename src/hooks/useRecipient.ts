import { ATTENDEES } from "@/json/attendees";
import { Attendee } from "@/types/attendee";
import { useEffect, useState } from "react";

export const useRecipient = (email: string) => {
  const [recipient, setRecipient] = useState<Attendee>();

  useEffect(() => {
    setRecipient(ATTENDEES.find((item) => item.email === email));
  }, [email]);

  return [recipient];
};
