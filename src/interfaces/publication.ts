import { GenericMetadata, MetadataDisplayType } from "./generic";

interface MetadataMedia {
  item: string;
  /**
   * This is the mime type of media
   */
  type: string;
}

export interface MetadataAttribute {
  displayType?: MetadataDisplayType;
  traitType?: string;
  value: string;
}
export type Maybe<T> = T | null;
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BlockchainData: any;
  BroadcastId: any;
  ChainId: any;
  CollectModuleData: any;
  ContentEncryptionKey: any;
  ContractAddress: any;
  CreateHandle: any;
  Cursor: any;
  DateTime: any;
  EncryptedValueScalar: any;
  Ens: any;
  EthereumAddress: any;
  FollowModuleData: any;
  Handle: any;
  HandleClaimIdScalar: any;
  IfpsCid: any;
  InternalPublicationId: any;
  Jwt: any;
  LimitScalar: any;
  Locale: any;
  Markdown: any;
  MimeType: any;
  NftGalleryId: any;
  NftGalleryName: any;
  NftOwnershipId: any;
  Nonce: any;
  NotificationId: any;
  ProfileId: any;
  ProfileInterest: any;
  ProxyActionId: any;
  PublicationId: any;
  PublicationTag: any;
  PublicationUrl: any;
  ReactionId: any;
  ReferenceModuleData: any;
  Search: any;
  Signature: any;
  Sources: any;
  TimestampScalar: any;
  TokenId: any;
  TxHash: any;
  TxId: any;
  UnixTimestamp: any;
  Url: any;
  Void: any;
};

/** Media object output */
export type MediaOutput = {
  __typename?: "MediaOutput";
  /** The alt tags for accessibility */
  altTag?: Maybe<Scalars["String"]>;
  /** The cover for any video or audio you attached */
  cover?: Maybe<Scalars["Url"]>;
  item: Scalars["Url"];
  source?: Maybe<PublicationMediaSource>;
  /** This is the mime type of media */
  type?: Maybe<Scalars["MimeType"]>;
};
export enum PublicationMediaSource {
  Lens = "LENS",
}
export interface Metadata extends GenericMetadata {
  description?: string;
  content?: string;
  external_url?: string | null;
  name: string;
  attributes: MetadataAttribute[];
  image?: string | null;
  imageMimeType?: string | null;
  media?: MediaOutput[];
  animation_url?: string;
  locale: string;
  tags?: string[];
  contentWarning?: PublicationContentWarning;
  mainContentFocus: PublicationMainFocus;
}
export declare enum PublicationMetadataDisplayTypes {
  Date = "date",
  Number = "number",
  String = "string",
}
export type InputMaybe<T> = Maybe<T>;
export type MetadataAttributeInput = {
  /** The display type */
  displayType?: InputMaybe<PublicationMetadataDisplayTypes>;
  /** The trait type - can be anything its the name it will render so include spaces */
  traitType: Scalars["String"];
  /** The value */
  value: Scalars["String"];
};

export enum PublicationMainFocus {
  Article = "ARTICLE",
  Audio = "AUDIO",
  Embed = "EMBED",
  Image = "IMAGE",
  Link = "LINK",
  TextOnly = "TEXT_ONLY",
  Video = "VIDEO",
}

export enum PublicationMetadataDisplayType {
  number = "number",
  string = "string",
  date = "date",
}

export interface PublicationMetadataAttribute {
  displayType?: MetadataDisplayType | undefined | null;
  traitType?: string | undefined | null;
  value: string;
}

export enum PublicationContentWarning {
  NSFW = "NSFW",
  SENSITIVE = "SENSITIVE",
  SPOILER = "SPOILER",
}
