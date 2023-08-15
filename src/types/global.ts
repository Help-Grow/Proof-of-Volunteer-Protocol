import { Attendee } from "./attendee";
import { LensClient } from "@lens-protocol/client";
export interface GlobalState {
  recipient?: Attendee;
  email?: string;
  ipfsImageUrl?: string;
}
