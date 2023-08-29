import { Attendee } from "./attendee";
// Enums
import { ImageType } from "@lens-protocol/react-web";

export interface GlobalState {
  recipient?: Attendee;
  email?: string;
  imageUrl?: string;
  imageType?: ImageType;
}
