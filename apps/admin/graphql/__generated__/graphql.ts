/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Date (format %d.%m.%Y) */
  Date: any;
  /** DateTime (format ISO-8601) */
  DateTime: any;
  JSON: any;
  /** String or number (input is casted to string) */
  StringOrNumber: any;
  /** YearMonthDate (format YYYY-MM) */
  YearMonthDate: any;
};

/** Entity describing ability and terms of granting a membership */
export type AccessCampaign = {
  __typename?: 'AccessCampaign';
  /** Begin of campaign */
  beginAt: Scalars['DateTime'];
  defaultMessage?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  /** End of campaign */
  endAt: Scalars['DateTime'];
  grants: Array<AccessGrant>;
  id: Scalars['ID'];
  perks: AccessCampaignPerks;
  slots: AccessCampaignSlots;
  title: Scalars['String'];
  type: Scalars['String'];
};


/** Entity describing ability and terms of granting a membership */
export type AccessCampaignGrantsArgs = {
  withInvalidated?: InputMaybe<Scalars['Boolean']>;
  withRevoked?: InputMaybe<Scalars['Boolean']>;
};

/** Entity describing available perks */
export type AccessCampaignPerks = {
  __typename?: 'AccessCampaignPerks';
  giftableMemberships?: Maybe<Scalars['Int']>;
};

/** Entity describing state of slots: total, used and free */
export type AccessCampaignSlots = {
  __typename?: 'AccessCampaignSlots';
  free: Scalars['Int'];
  total: Scalars['Int'];
  used: Scalars['Int'];
};

/** Entity describing an event that occured, linked to an AccessGrant */
export type AccessEvent = {
  __typename?: 'AccessEvent';
  createdAt: Scalars['DateTime'];
  event: Scalars['String'];
  id: Scalars['ID'];
};

/** Entity representing a future, current or passed granted membership */
export type AccessGrant = {
  __typename?: 'AccessGrant';
  /** Beginning of sharing period */
  beginAt?: Maybe<Scalars['DateTime']>;
  /** Sharing period must begin before */
  beginBefore: Scalars['DateTime'];
  /** Campaign this membership grant belongs to */
  campaign: AccessCampaign;
  createdAt: Scalars['DateTime'];
  /** Original recipient email address of grant. */
  email?: Maybe<Scalars['String']>;
  /** Ending of sharing period */
  endAt?: Maybe<Scalars['DateTime']>;
  /** Events (Admin only) */
  events?: Maybe<Array<Maybe<AccessEvent>>>;
  followupAt?: Maybe<Scalars['DateTime']>;
  /** Entity who granted membership (Admin only) */
  granter?: Maybe<User>;
  /** Name or email address of entity who granted membership */
  granterName: Scalars['String'];
  id: Scalars['ID'];
  /** Date when grant was rendered invalid */
  invalidatedAt?: Maybe<Scalars['DateTime']>;
  /** Entity who received granted membership (Admin only) */
  recipient?: Maybe<User>;
  /** Name or email address of entity who received granted access */
  recipientName?: Maybe<Scalars['String']>;
  /** Date when grant was revoked */
  revokedAt?: Maybe<Scalars['DateTime']>;
  /** Status (Admin only) */
  status?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  /** Voucher code claim this grant */
  voucherCode?: Maybe<Scalars['String']>;
};

export type AccessGrantInfo = {
  __typename?: 'AccessGrantInfo';
  granter: User;
  granterName: Scalars['String'];
  message?: Maybe<Scalars['String']>;
};

export type AccessGrantStats = {
  __typename?: 'AccessGrantStats';
  /** Returns events on access grants in daily buckets */
  events: AccessGrantStatsEvents;
  /** Returns access grant states per in daily buckets. */
  evolution: AccessGrantStatsEvolution;
};


export type AccessGrantStatsEventsArgs = {
  accessCampaignId: Scalars['ID'];
  max: Scalars['Date'];
  min: Scalars['Date'];
};


export type AccessGrantStatsEvolutionArgs = {
  accessCampaignId: Scalars['ID'];
  max: Scalars['Date'];
  min: Scalars['Date'];
};

export type AccessGrantStatsEvents = {
  __typename?: 'AccessGrantStatsEvents';
  buckets?: Maybe<Array<AccessGrantStatsEventsBucket>>;
  updatedAt: Scalars['DateTime'];
};

export type AccessGrantStatsEventsBucket = {
  __typename?: 'AccessGrantStatsEventsBucket';
  claims: Scalars['Int'];
  date: Scalars['Date'];
  invites: Scalars['Int'];
  key: Scalars['String'];
  pledges: Scalars['Int'];
  revenue: Scalars['Int'];
};

export type AccessGrantStatsEvolution = {
  __typename?: 'AccessGrantStatsEvolution';
  buckets?: Maybe<Array<AccessGrantStatsPeriodBucket>>;
  updatedAt: Scalars['DateTime'];
};

export type AccessGrantStatsPeriodBucket = {
  __typename?: 'AccessGrantStatsPeriodBucket';
  active: Scalars['Int'];
  activeUnconverted: Scalars['Int'];
  converted: Scalars['Int'];
  date: Scalars['Date'];
  key: Scalars['String'];
};

export enum AccessRole {
  Admin = 'ADMIN',
  Editor = 'EDITOR',
  Member = 'MEMBER',
  Public = 'PUBLIC'
}

/** Scope of an access token */
export enum AccessTokenScope {
  /** A token authorize a session (TTL: 5 days) */
  AuthorizeSession = 'AUTHORIZE_SESSION',
  /** A token to use mutation claimCard (TTL: 90 days) */
  ClaimCard = 'CLAIM_CARD',
  /** A token to access me.customPackages (TTL: 90 days) */
  CustomPledge = 'CUSTOM_PLEDGE',
  /** A token to access me.customPackages (TTL: 120 days) */
  CustomPledgeExtended = 'CUSTOM_PLEDGE_EXTENDED',
  /** A token access a invoices (TTL: 5 days) */
  Invoice = 'INVOICE',
  /** A token to access a users name and portrait (TTL: 30 days) */
  NowYouSeeMe = 'NOW_YOU_SEE_ME'
}

export enum Action {
  Create = 'create',
  Delete = 'delete'
}

export type AddPaymentMethodResponse = {
  __typename?: 'AddPaymentMethodResponse';
  stripeClientSecret?: Maybe<Scalars['String']>;
  stripePublishableKey?: Maybe<Scalars['String']>;
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String'];
  country: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  line1: Scalars['String'];
  line2?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  postalCode: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type AddressInput = {
  city: Scalars['String'];
  country: Scalars['String'];
  line1: Scalars['String'];
  line2?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  postalCode: Scalars['String'];
};

export type AnserPageInfo = {
  __typename?: 'AnserPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type Answer = {
  __typename?: 'Answer';
  drafted?: Maybe<Scalars['Boolean']>;
  hasMatched?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  payload: Scalars['JSON'];
  question: QuestionInterface;
  submitted: Scalars['Boolean'];
};

export type AnswerConnection = {
  __typename?: 'AnswerConnection';
  nodes: Array<Answer>;
  pageInfo: AnserPageInfo;
  totalCount: Scalars['Int'];
};

export type AnswerInput = {
  id: Scalars['ID'];
  payload?: InputMaybe<Scalars['JSON']>;
  questionId: Scalars['ID'];
};

/** Provide an entitiy type (e. g. `Document`) and its ID */
export type AudioQueueEntityInput = {
  id: Scalars['ID'];
  type: AudioQueueEntityType;
};

export enum AudioQueueEntityType {
  Document = 'Document'
}

/** An item in an audio queue. */
export type AudioQueueItem = CollectionItemInterface & {
  __typename?: 'AudioQueueItem';
  collection: Collection;
  createdAt: Scalars['DateTime'];
  document: Document;
  id: Scalars['ID'];
  /** Sequence number of this item */
  sequence: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};

export type AudioSource = PlayableMedia & {
  __typename?: 'AudioSource';
  aac?: Maybe<Scalars['String']>;
  durationMs: Scalars['Int'];
  kind?: Maybe<AudioSourceKind>;
  mediaId: Scalars['ID'];
  mp3?: Maybe<Scalars['String']>;
  ogg?: Maybe<Scalars['String']>;
  userProgress?: Maybe<MediaProgress>;
};

export enum AudioSourceKind {
  Podcast = 'podcast',
  ReadAloud = 'readAloud',
  SyntheticReadAloud = 'syntheticReadAloud'
}

export type Author = {
  __typename?: 'Author';
  email: Scalars['String'];
  name: Scalars['String'];
  user?: Maybe<User>;
};

export enum Badge {
  Crowdfunder = 'CROWDFUNDER',
  Freelancer = 'FREELANCER',
  Patron = 'PATRON',
  Staff = 'STAFF'
}

export type BooleanFilter = {
  field: Field;
  value: Scalars['Boolean'];
};

export type Calendar = {
  __typename?: 'Calendar';
  id: Scalars['ID'];
  slots?: Maybe<Array<CalendarSlot>>;
  slug: Scalars['String'];
};


export type CalendarSlotsArgs = {
  from?: InputMaybe<Scalars['DateTime']>;
  to?: InputMaybe<Scalars['DateTime']>;
};

export type CalendarSlot = {
  __typename?: 'CalendarSlot';
  id: Scalars['ID'];
  key: Scalars['String'];
  userCanBook: Scalars['Boolean'];
  userCanCancel: Scalars['Boolean'];
  userHasBooked: Scalars['Boolean'];
  users: Array<User>;
};

export type CallToAction = {
  __typename?: 'CallToAction';
  /** Timestamp when User acknowledged call to action */
  acknowledgedAt?: Maybe<Scalars['DateTime']>;
  beginAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  endAt: Scalars['DateTime'];
  id: Scalars['ID'];
  payload: CallToActionPayload;
  response?: Maybe<Scalars['JSON']>;
  updatedAt: Scalars['DateTime'];
};

export type CallToActionBasicPayload = {
  __typename?: 'CallToActionBasicPayload';
  linkHref: Scalars['String'];
  linkLabel: Scalars['String'];
  text: Scalars['String'];
};

export type CallToActionComponentPayload = {
  __typename?: 'CallToActionComponentPayload';
  customComponent: CallToActionCustomComponent;
};

export type CallToActionCustomComponent = {
  __typename?: 'CallToActionCustomComponent';
  args?: Maybe<Scalars['JSON']>;
  key: Scalars['String'];
};

export type CallToActionPayload = CallToActionBasicPayload | CallToActionComponentPayload;

export type Cancellation = {
  __typename?: 'Cancellation';
  cancelledViaSupport: Scalars['Boolean'];
  category: CancellationCategory;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  reason?: Maybe<Scalars['String']>;
  revokedAt?: Maybe<Scalars['DateTime']>;
  suppressConfirmation: Scalars['Boolean'];
  suppressWinback: Scalars['Boolean'];
  winbackCanBeSent: Scalars['Boolean'];
  winbackSentAt?: Maybe<Scalars['DateTime']>;
};

export type CancellationCategory = {
  __typename?: 'CancellationCategory';
  label: Scalars['String'];
  type: CancellationCategoryType;
};

export enum CancellationCategoryType {
  CrowfundingOnly = 'CROWFUNDING_ONLY',
  EditoralNarcissistic = 'EDITORAL_NARCISSISTIC',
  Editorial = 'EDITORIAL',
  Expections = 'EXPECTIONS',
  LoginTech = 'LOGIN_TECH',
  NoMoney = 'NO_MONEY',
  NoTime = 'NO_TIME',
  Other = 'OTHER',
  Paper = 'PAPER',
  RarelyRead = 'RARELY_READ',
  SeveralReasons = 'SEVERAL_REASONS',
  System = 'SYSTEM',
  TooExpensive = 'TOO_EXPENSIVE',
  TooMuchToRead = 'TOO_MUCH_TO_READ',
  UncertainFuture = 'UNCERTAIN_FUTURE',
  Void = 'VOID'
}

export type CancellationInput = {
  reason?: InputMaybe<Scalars['String']>;
  suppressConfirmation?: InputMaybe<Scalars['Boolean']>;
  suppressWinback?: InputMaybe<Scalars['Boolean']>;
  type: CancellationCategoryType;
};

export type Candidacy = {
  __typename?: 'Candidacy';
  city?: Maybe<Scalars['String']>;
  comment: Comment;
  credential?: Maybe<Credential>;
  election: Election;
  id: Scalars['ID'];
  isIncumbent?: Maybe<Scalars['Boolean']>;
  postalCodeGeo?: Maybe<PostalCodeGeo>;
  recommendation?: Maybe<Scalars['String']>;
  user: User;
  yearOfBirth?: Maybe<Scalars['Int']>;
};

export type Card = {
  __typename?: 'Card';
  documents: DocumentConnection;
  group: CardGroup;
  id: Scalars['ID'];
  payload: Scalars['JSON'];
  statement?: Maybe<Comment>;
  user: User;
};


export type CardPayloadArgs = {
  paths?: InputMaybe<Array<Scalars['String']>>;
};


export type CardUserArgs = {
  accessToken?: InputMaybe<Scalars['ID']>;
};

export type CardAggregation = {
  __typename?: 'CardAggregation';
  buckets: Array<CardAggregationBucket>;
  key: Scalars['String'];
};

export type CardAggregationBucket = {
  __typename?: 'CardAggregationBucket';
  cards: CardConnection;
  value: Scalars['String'];
};


export type CardAggregationBucketCardsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export enum CardAggregationKeys {
  CouncilOfStatesElection = 'councilOfStatesElection',
  Election = 'election',
  Fraction = 'fraction',
  NationalCouncilElection = 'nationalCouncilElection',
  Party = 'party'
}

export type CardConnection = {
  __typename?: 'CardConnection';
  aggregations: Array<CardAggregation>;
  medians: CardMedians;
  nodes: Array<Card>;
  pageInfo: CardPageInfo;
  totalCount: Scalars['Int'];
};


export type CardConnectionAggregationsArgs = {
  keys?: InputMaybe<Array<CardAggregationKeys>>;
};

export type CardFiltersInput = {
  candidacies?: InputMaybe<Array<Scalars['String']>>;
  elected?: InputMaybe<Scalars['Boolean']>;
  elects?: InputMaybe<Array<Scalars['String']>>;
  fractions?: InputMaybe<Array<Scalars['String']>>;
  mustHave?: InputMaybe<Array<CardFiltersMustHaveInput>>;
  parties?: InputMaybe<Array<Scalars['String']>>;
  subscribedByMe?: InputMaybe<Scalars['Boolean']>;
};

export enum CardFiltersMustHaveInput {
  Financing = 'financing',
  Portrait = 'portrait',
  Smartspider = 'smartspider',
  Statement = 'statement'
}

export type CardGroup = {
  __typename?: 'CardGroup';
  cards: CardConnection;
  discussion?: Maybe<Discussion>;
  id: Scalars['ID'];
  name: Scalars['String'];
  slug: Scalars['String'];
};


export type CardGroupCardsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<CardFiltersInput>;
  first?: InputMaybe<Scalars['Int']>;
  focus?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<CardSortInput>;
};

export type CardGroupConnection = {
  __typename?: 'CardGroupConnection';
  nodes: Array<CardGroup>;
  pageInfo: CardGroupPageInfo;
  totalCount: Scalars['Int'];
};

export type CardGroupPageInfo = {
  __typename?: 'CardGroupPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type CardMedians = {
  __typename?: 'CardMedians';
  smartspider?: Maybe<Array<Scalars['Float']>>;
};

export type CardPageInfo = {
  __typename?: 'CardPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type CardSortInput = {
  smartspider?: InputMaybe<Array<InputMaybe<Scalars['Float']>>>;
};

export type Collection = {
  __typename?: 'Collection';
  id: Scalars['ID'];
  items: CollectionItemConnection;
  name: Scalars['String'];
};


export type CollectionItemsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type CollectionItem = CollectionItemInterface & {
  __typename?: 'CollectionItem';
  collection: Collection;
  createdAt: Scalars['DateTime'];
  document?: Maybe<Document>;
  id: Scalars['ID'];
};

export type CollectionItemConnection = {
  __typename?: 'CollectionItemConnection';
  nodes: Array<CollectionItem>;
  pageInfo: CollectionItemPageInfo;
  totalCount: Scalars['Int'];
};

export type CollectionItemInterface = {
  collection: Collection;
  createdAt: Scalars['DateTime'];
  document?: Maybe<Document>;
  id: Scalars['ID'];
};

export type CollectionItemPageInfo = {
  __typename?: 'CollectionItemPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type CollectionsStats = {
  __typename?: 'CollectionsStats';
  evolution: CollectionsStatsEvolution;
  last: CollectionsStatsBucket;
};


export type CollectionsStatsEvolutionArgs = {
  max: Scalars['YearMonthDate'];
  min: Scalars['YearMonthDate'];
  name: Scalars['String'];
};


export type CollectionsStatsLastArgs = {
  name: Scalars['String'];
};

export type CollectionsStatsBucket = {
  __typename?: 'CollectionsStatsBucket';
  /** Amount of documents */
  documents: Scalars['Int'];
  /** Bucket key (YYYY-MM) */
  key: Scalars['String'];
  /** Amount of media */
  medias: Scalars['Int'];
  /** Amount of records */
  records: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
  /** Amount of unqiue users */
  users: Scalars['Int'];
};

export type CollectionsStatsEvolution = {
  __typename?: 'CollectionsStatsEvolution';
  buckets?: Maybe<Array<CollectionsStatsBucket>>;
  updatedAt: Scalars['DateTime'];
};

export type Comment = {
  __typename?: 'Comment';
  adminUnpublished?: Maybe<Scalars['Boolean']>;
  author?: Maybe<User>;
  comments: CommentConnection;
  content?: Maybe<Scalars['JSON']>;
  contentLength?: Maybe<Scalars['Int']>;
  createdAt: Scalars['DateTime'];
  depth: Scalars['Int'];
  discussion: Discussion;
  displayAuthor: DisplayUser;
  downVotes: Scalars['Int'];
  embed?: Maybe<Embed>;
  featuredAt?: Maybe<Scalars['DateTime']>;
  featuredTargets?: Maybe<Array<CommentFeaturedTarget>>;
  featuredText?: Maybe<Scalars['String']>;
  hotness: Scalars['Float'];
  id: Scalars['ID'];
  mentioningDocument?: Maybe<MentioningDocument>;
  numReports?: Maybe<Scalars['Int']>;
  parent?: Maybe<Comment>;
  parentIds: Array<Scalars['ID']>;
  preview?: Maybe<Preview>;
  published: Scalars['Boolean'];
  score: Scalars['Int'];
  tags: Array<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  unreadNotifications?: Maybe<NotificationConnection>;
  upVotes: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
  userCanEdit?: Maybe<Scalars['Boolean']>;
  userCanReport: Scalars['Boolean'];
  userReportedAt?: Maybe<Scalars['DateTime']>;
  userVote?: Maybe<CommentVote>;
};


export type CommentPreviewArgs = {
  length?: InputMaybe<Scalars['Int']>;
};

export type CommentAggregation = {
  __typename?: 'CommentAggregation';
  beginDate?: Maybe<Scalars['Date']>;
  count: Scalars['Int'];
  discussion: Discussion;
  endDate?: Maybe<Scalars['Date']>;
};

export type CommentConnection = {
  __typename?: 'CommentConnection';
  directTotalCount?: Maybe<Scalars['Int']>;
  focus?: Maybe<Comment>;
  id: Scalars['ID'];
  nodes: Array<Maybe<Comment>>;
  pageInfo?: Maybe<DiscussionPageInfo>;
  resolvedOrderBy?: Maybe<DiscussionOrder>;
  totalCount: Scalars['Int'];
};

export enum CommentFeaturedTarget {
  Default = 'DEFAULT',
  Marketing = 'MARKETING'
}

export type CommentUpdate = {
  __typename?: 'CommentUpdate';
  mutation: MutationType;
  node: Comment;
};

export enum CommentVote {
  Down = 'DOWN',
  Up = 'UP'
}

export type Commit = {
  __typename?: 'Commit';
  author: Author;
  canDerive: Scalars['Boolean'];
  date: Scalars['DateTime'];
  derivatives?: Maybe<Array<Derivative>>;
  document: Document;
  id: Scalars['ID'];
  markdown: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  parentIds: Array<Scalars['ID']>;
  repo: Repo;
};


export type CommitCanDeriveArgs = {
  type: DerivativeType;
};

export type CommitConnection = {
  __typename?: 'CommitConnection';
  nodes: Array<Commit>;
  pageInfo: PublikatorPageInfo;
  totalCount: Scalars['Int'];
};

export type Company = {
  __typename?: 'Company';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Contributor = {
  __typename?: 'Contributor';
  kind?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  user?: Maybe<User>;
};

export type Credential = {
  __typename?: 'Credential';
  description: Scalars['String'];
  id: Scalars['ID'];
  isListed: Scalars['Boolean'];
  verified: Scalars['Boolean'];
};

export type Crop = {
  __typename?: 'Crop';
  height?: Maybe<Scalars['Int']>;
  width?: Maybe<Scalars['Int']>;
  x?: Maybe<Scalars['Int']>;
  y?: Maybe<Scalars['Int']>;
};

export type Crowdfunding = {
  __typename?: 'Crowdfunding';
  beginDate: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  endDate: Scalars['DateTime'];
  endVideo?: Maybe<Video>;
  goals: Array<CrowdfundingGoal>;
  hasEnded: Scalars['Boolean'];
  id: Scalars['ID'];
  name: Scalars['String'];
  packages: Array<Package>;
  status: CrowdfundingStatus;
  updatedAt: Scalars['DateTime'];
};

export type CrowdfundingGoal = {
  __typename?: 'CrowdfundingGoal';
  description?: Maybe<Scalars['String']>;
  memberships?: Maybe<Scalars['Int']>;
  money: Scalars['Int'];
  people: Scalars['Int'];
};

export type CrowdfundingStatus = {
  __typename?: 'CrowdfundingStatus';
  memberships: Scalars['Int'];
  money: Scalars['Int'];
  people: Scalars['Int'];
};

export type DateRangeFilter = {
  field: Field;
  from: Scalars['DateTime'];
  to: Scalars['DateTime'];
};

export type DateRangeInput = {
  from?: InputMaybe<Scalars['DateTime']>;
  to?: InputMaybe<Scalars['DateTime']>;
};

export type Derivative = {
  __typename?: 'Derivative';
  createdAt: Scalars['DateTime'];
  destroyedAt?: Maybe<Scalars['DateTime']>;
  failedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  readyAt?: Maybe<Scalars['DateTime']>;
  result?: Maybe<Scalars['JSON']>;
  status: DerivativeStatus;
  type: DerivativeType;
  updatedAt: Scalars['DateTime'];
};

export enum DerivativeStatus {
  Destroyed = 'Destroyed',
  Failure = 'Failure',
  Pending = 'Pending',
  Ready = 'Ready'
}

export enum DerivativeType {
  SyntheticReadAloud = 'SyntheticReadAloud'
}

export type Device = {
  __typename?: 'Device';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  information: DeviceInformation;
  lastSeen: Scalars['DateTime'];
  user: User;
};

export type DeviceInformation = {
  __typename?: 'DeviceInformation';
  appVersion: Scalars['String'];
  model: Scalars['String'];
  os: OsType;
  osVersion: Scalars['String'];
};

export type DeviceInformationInput = {
  appVersion: Scalars['String'];
  model: Scalars['String'];
  os: OsType;
  osVersion: Scalars['StringOrNumber'];
  userAgent?: InputMaybe<Scalars['String']>;
};

export type Discussion = {
  __typename?: 'Discussion';
  closed: Scalars['Boolean'];
  collapsable: Scalars['Boolean'];
  comments: CommentConnection;
  displayAuthor?: Maybe<DisplayUser>;
  document?: Maybe<Document>;
  id: Scalars['ID'];
  isBoard: Scalars['Boolean'];
  path?: Maybe<Scalars['String']>;
  rules: DiscussionRules;
  tagBuckets: Array<DiscussionTagBucket>;
  tagRequired: Scalars['Boolean'];
  tags: Array<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  userCanComment: Scalars['Boolean'];
  userPreference?: Maybe<DiscussionPreferences>;
  userSubscriptionsForCommenters: SubscriptionConnection;
  userWaitUntil?: Maybe<Scalars['DateTime']>;
};


export type DiscussionCommentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  flatDepth?: InputMaybe<Scalars['Int']>;
  focusId?: InputMaybe<Scalars['ID']>;
  includeParent?: InputMaybe<Scalars['Boolean']>;
  orderBy?: InputMaybe<DiscussionOrder>;
  orderDirection?: InputMaybe<OrderDirection>;
  parentId?: InputMaybe<Scalars['ID']>;
  tag?: InputMaybe<Scalars['String']>;
};


export type DiscussionUserSubscriptionsForCommentersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export enum DiscussionNotificationChannel {
  App = 'APP',
  Email = 'EMAIL',
  Web = 'WEB'
}

export enum DiscussionNotificationOption {
  All = 'ALL',
  MyChildren = 'MY_CHILDREN',
  None = 'NONE'
}

export enum DiscussionOrder {
  Auto = 'AUTO',
  Date = 'DATE',
  FeaturedAt = 'FEATURED_AT',
  Hot = 'HOT',
  Replies = 'REPLIES',
  Votes = 'VOTES'
}

export type DiscussionPageInfo = {
  __typename?: 'DiscussionPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
};

export type DiscussionPreferences = {
  __typename?: 'DiscussionPreferences';
  anonymity: Scalars['Boolean'];
  credential?: Maybe<Credential>;
  notifications?: Maybe<DiscussionNotificationOption>;
};

export type DiscussionPreferencesInput = {
  anonymity?: InputMaybe<Scalars['Boolean']>;
  credential?: InputMaybe<Scalars['String']>;
  notifications?: InputMaybe<DiscussionNotificationOption>;
};

export type DiscussionRules = {
  __typename?: 'DiscussionRules';
  allowedRoles: Array<Scalars['String']>;
  anonymity: Permission;
  disableTopLevelComments?: Maybe<Scalars['Boolean']>;
  maxLength?: Maybe<Scalars['Int']>;
  minInterval?: Maybe<Scalars['Int']>;
};

export type DiscussionSuspension = {
  __typename?: 'DiscussionSuspension';
  beginAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  endAt: Scalars['DateTime'];
  id: Scalars['ID'];
  issuer?: Maybe<User>;
  reason?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type DiscussionTagBucket = {
  __typename?: 'DiscussionTagBucket';
  count: Scalars['Int'];
  value: Scalars['String'];
};

export type DiscussionsStats = {
  __typename?: 'DiscussionsStats';
  evolution: DiscussionsStatsEvolution;
  last: DiscussionsStatsBucket;
};


export type DiscussionsStatsEvolutionArgs = {
  max: Scalars['YearMonthDate'];
  min: Scalars['YearMonthDate'];
};

export type DiscussionsStatsBucket = {
  __typename?: 'DiscussionsStatsBucket';
  /** Amount of comments */
  comments: Scalars['Int'];
  /** Amount of discussions */
  discussions: Scalars['Int'];
  /** Bucket key (YYYY-MM) */
  key: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  /** Amount of unqiue users */
  users: Scalars['Int'];
  /** Amount of unqiue users which posted a comment */
  usersPosted: Scalars['Int'];
  /** Amount of unqiue users which voted on a comment */
  usersVoted: Scalars['Int'];
};

export type DiscussionsStatsEvolution = {
  __typename?: 'DiscussionsStatsEvolution';
  buckets?: Maybe<Array<DiscussionsStatsBucket>>;
  updatedAt: Scalars['DateTime'];
};

export type DisplayUser = {
  __typename?: 'DisplayUser';
  anonymity: Scalars['Boolean'];
  credential?: Maybe<Credential>;
  id: Scalars['ID'];
  name: Scalars['String'];
  profilePicture?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  /** @deprecated use `slug` instead */
  username?: Maybe<Scalars['String']>;
};

export type Document = {
  __typename?: 'Document';
  children: DocumentNodeConnection;
  content: Scalars['JSON'];
  id: Scalars['ID'];
  issuedForUserId?: Maybe<Scalars['ID']>;
  linkedDocuments: DocumentConnection;
  meta: Meta;
  repoId: Scalars['ID'];
  subscribedBy: SubscriptionConnection;
  /** @deprecated use `subscribedBy` with `onlyMe: true` instead */
  subscribedByMe?: Maybe<Subscription>;
  type: DocumentType;
  unreadNotifications?: Maybe<NotificationConnection>;
  userCollectionItem?: Maybe<CollectionItem>;
  userCollectionItems: Array<CollectionItem>;
  userProgress?: Maybe<DocumentProgress>;
};


export type DocumentChildrenArgs = {
  after?: InputMaybe<Scalars['ID']>;
  before?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  only?: InputMaybe<Scalars['ID']>;
};


export type DocumentLinkedDocumentsArgs = {
  after?: InputMaybe<Scalars['ID']>;
  before?: InputMaybe<Scalars['ID']>;
  feed?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type DocumentSubscribedByArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<Array<EventObjectType>>;
  first?: InputMaybe<Scalars['Int']>;
  includeParents?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  onlyEligibles?: InputMaybe<Scalars['Boolean']>;
  onlyMe?: InputMaybe<Scalars['Boolean']>;
  uniqueUsers?: InputMaybe<Scalars['Boolean']>;
};


export type DocumentSubscribedByMeArgs = {
  includeParents?: InputMaybe<Scalars['Boolean']>;
};


export type DocumentUserCollectionItemArgs = {
  collectionName: Scalars['String'];
};

export type DocumentConnection = {
  __typename?: 'DocumentConnection';
  nodes: Array<Document>;
  pageInfo: DocumentPageInfo;
  totalCount: Scalars['Int'];
};

export type DocumentInput = {
  content: Scalars['JSON'];
  type?: InputMaybe<DocumentType>;
};

export type DocumentNode = {
  __typename?: 'DocumentNode';
  body: Scalars['JSON'];
  id: Scalars['ID'];
};

export type DocumentNodeConnection = {
  __typename?: 'DocumentNodeConnection';
  nodes: Array<DocumentNode>;
  pageInfo: DocumentNodePageInfo;
  totalCount: Scalars['Int'];
};

export type DocumentNodePageInfo = {
  __typename?: 'DocumentNodePageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type DocumentPageInfo = {
  __typename?: 'DocumentPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type DocumentProgress = CollectionItemInterface & {
  __typename?: 'DocumentProgress';
  collection: Collection;
  createdAt: Scalars['DateTime'];
  document?: Maybe<Document>;
  id: Scalars['ID'];
  max?: Maybe<DocumentProgress>;
  nodeId: Scalars['String'];
  percentage: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
};

export enum DocumentTextLengths {
  Long = 'LONG',
  Medium = 'MEDIUM',
  Short = 'SHORT'
}

export enum DocumentType {
  Mdast = 'mdast',
  Slate = 'slate'
}

export type DocumentZone = {
  __typename?: 'DocumentZone';
  data: Scalars['JSON'];
  document?: Maybe<Document>;
  hash: Scalars['String'];
  id: Scalars['ID'];
  identifier: Scalars['String'];
  node: Scalars['JSON'];
  text?: Maybe<Scalars['String']>;
  type: DocumentType;
};

export type Election = VotingInterface & {
  __typename?: 'Election';
  allowEmptyBallots: Scalars['Boolean'];
  allowedMemberships?: Maybe<Array<VotingMembershipRequirement>>;
  allowedRoles?: Maybe<Array<Scalars['String']>>;
  beginDate: Scalars['DateTime'];
  candidacies: Array<Candidacy>;
  candidacyBeginDate: Scalars['DateTime'];
  candidacyEndDate: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  discussion: Discussion;
  endDate: Scalars['DateTime'];
  id: Scalars['ID'];
  liveResult: Scalars['Boolean'];
  numSeats: Scalars['Int'];
  requireAddress: Scalars['Boolean'];
  result?: Maybe<ElectionResult>;
  slug: Scalars['String'];
  turnout: ElectionTurnout;
  userHasSubmitted?: Maybe<Scalars['Boolean']>;
  userIsEligible?: Maybe<Scalars['Boolean']>;
  userSubmitDate?: Maybe<Scalars['DateTime']>;
};

export type ElectionBallotInput = {
  candidacyIds: Array<Scalars['ID']>;
  electionId: Scalars['ID'];
};

export type ElectionCandidacyResult = {
  __typename?: 'ElectionCandidacyResult';
  candidacy?: Maybe<Candidacy>;
  count: Scalars['Int'];
  elected?: Maybe<Scalars['Boolean']>;
};

export type ElectionInput = {
  allowEmptyBallots?: InputMaybe<Scalars['Boolean']>;
  allowedMemberships?: InputMaybe<Array<VotingMembershipRequirementInput>>;
  allowedRoles?: InputMaybe<Array<Scalars['String']>>;
  beginDate: Scalars['DateTime'];
  candidacyBeginDate: Scalars['DateTime'];
  candidacyEndDate: Scalars['DateTime'];
  description: Scalars['String'];
  endDate: Scalars['DateTime'];
  groupSlug?: InputMaybe<Scalars['String']>;
  numSeats: Scalars['Int'];
  slug: Scalars['String'];
};

export type ElectionResult = {
  __typename?: 'ElectionResult';
  candidacies: Array<ElectionCandidacyResult>;
  createdAt?: Maybe<Scalars['DateTime']>;
  message?: Maybe<Scalars['String']>;
  turnout: ElectionTurnout;
  updatedAt?: Maybe<Scalars['DateTime']>;
  video?: Maybe<Video>;
};

export type ElectionTurnout = {
  __typename?: 'ElectionTurnout';
  eligible: Scalars['Int'];
  submitted: Scalars['Int'];
};

export type Embed = LinkPreview | TwitterEmbed | VimeoEmbed | YoutubeEmbed;

export enum EmbedType {
  TwitterEmbed = 'TwitterEmbed',
  VimeoEmbed = 'VimeoEmbed',
  YoutubeEmbed = 'YoutubeEmbed'
}

export type Employee = {
  __typename?: 'Employee';
  greeting?: Maybe<Scalars['String']>;
  group?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  pitch?: Maybe<Scalars['String']>;
  subgroup?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type Episode = {
  __typename?: 'Episode';
  document?: Maybe<Document>;
  image?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  lead?: Maybe<Scalars['String']>;
  publishDate?: Maybe<Scalars['DateTime']>;
  title?: Maybe<Scalars['String']>;
};

export type Event = {
  __typename?: 'Event';
  date?: Maybe<Scalars['Date']>;
  description?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  locationLink?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  socialMediaImage?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  where?: Maybe<Scalars['String']>;
};

export type EventObject = Comment | Document;

export enum EventObjectType {
  Comment = 'Comment',
  Document = 'Document',
  ReadAloud = 'ReadAloud'
}

export type Faq = {
  __typename?: 'Faq';
  answer?: Maybe<Scalars['String']>;
  category?: Maybe<Scalars['String']>;
  question?: Maybe<Scalars['String']>;
};

export enum Field {
  Avisierungstext = 'avisierungstext',
  Buchungsdatum = 'buchungsdatum',
  CreatedAt = 'createdAt',
  DueDate = 'dueDate',
  Email = 'email',
  FirstName = 'firstName',
  Gutschrift = 'gutschrift',
  Hidden = 'hidden',
  Hrid = 'hrid',
  LastName = 'lastName',
  Matched = 'matched',
  Method = 'method',
  Mitteilung = 'mitteilung',
  PaperInvoice = 'paperInvoice',
  Status = 'status',
  Total = 'total',
  UpdatedAt = 'updatedAt',
  Valuta = 'valuta',
  Verified = 'verified'
}

export type Goodie = {
  __typename?: 'Goodie';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  name: Scalars['String'];
  requireAddress: Scalars['Boolean'];
  updatedAt: Scalars['DateTime'];
};

export type Greeting = {
  __typename?: 'Greeting';
  id: Scalars['ID'];
  text: Scalars['String'];
};

export type ImageProperties = {
  bw?: InputMaybe<Scalars['Boolean']>;
  height?: InputMaybe<Scalars['Int']>;
  width?: InputMaybe<Scalars['Int']>;
};

export type LinkPreview = {
  __typename?: 'LinkPreview';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  imageAlt?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  siteImageUrl?: Maybe<Scalars['String']>;
  siteName: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  url: Scalars['String'];
};

export type MailboxAddress = {
  __typename?: 'MailboxAddress';
  address: Scalars['String'];
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type MailboxConnection = {
  __typename?: 'MailboxConnection';
  nodes: Array<MailboxRecord>;
  pageInfo: MailboxPageInfo;
  totalCount: Scalars['Int'];
};

export type MailboxFiltersInput = {
  email?: InputMaybe<Scalars['String']>;
  hasError?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['ID']>;
};

export type MailboxLink = {
  __typename?: 'MailboxLink';
  id: Scalars['ID'];
  label: Scalars['String'];
  type: Scalars['String'];
  url: Scalars['String'];
};

export type MailboxPageInfo = {
  __typename?: 'MailboxPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type MailboxRecord = {
  __typename?: 'MailboxRecord';
  bcc?: Maybe<Array<MailboxAddress>>;
  cc?: Maybe<Array<MailboxAddress>>;
  date: Scalars['DateTime'];
  error?: Maybe<Scalars['String']>;
  from?: Maybe<MailboxAddress>;
  hasHtml: Scalars['Boolean'];
  html?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  links?: Maybe<Array<MailboxLink>>;
  status?: Maybe<Scalars['String']>;
  subject?: Maybe<Scalars['String']>;
  template?: Maybe<Scalars['String']>;
  to?: Maybe<Array<MailboxAddress>>;
  type?: Maybe<Scalars['String']>;
};

export type MediaProgress = CollectionItemInterface & {
  __typename?: 'MediaProgress';
  collection: Collection;
  createdAt: Scalars['DateTime'];
  document?: Maybe<Document>;
  id: Scalars['ID'];
  max?: Maybe<MediaProgress>;
  mediaId: Scalars['ID'];
  secs: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
};

export type MediaResponse = {
  __typename?: 'MediaResponse';
  medium?: Maybe<Scalars['String']>;
  publishDate?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type MemberStats = {
  __typename?: 'MemberStats';
  count: Scalars['Int'];
};

export type Membership = {
  __typename?: 'Membership';
  accessGranted: Scalars['Boolean'];
  active: Scalars['Boolean'];
  autoPay: Scalars['Boolean'];
  autoPayIsMutable: Scalars['Boolean'];
  canAppendPeriod: Scalars['Boolean'];
  canProlong: Scalars['Boolean'];
  canReset: Scalars['Boolean'];
  cancellations: Array<Cancellation>;
  claimerName?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  endDate?: Maybe<Scalars['DateTime']>;
  giverName?: Maybe<Scalars['String']>;
  graceEndDate?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  initialInterval: MembershipTypeInterval;
  initialPeriods: Scalars['Int'];
  messageToClaimers?: Maybe<Scalars['String']>;
  overdue: Scalars['Boolean'];
  periods: Array<Maybe<MembershipPeriod>>;
  pledge: Pledge;
  reducedPrice: Scalars['Boolean'];
  renew: Scalars['Boolean'];
  sequenceNumber?: Maybe<Scalars['Int']>;
  type: MembershipType;
  updatedAt: Scalars['DateTime'];
  user: User;
  voucherCode?: Maybe<Scalars['String']>;
};

export type MembershipPeriod = {
  __typename?: 'MembershipPeriod';
  beginDate: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  endDate: Scalars['DateTime'];
  id: Scalars['ID'];
  isCurrent: Scalars['Boolean'];
  kind: MembershipPeriodKind;
  membership: Membership;
  updatedAt: Scalars['DateTime'];
};

export enum MembershipPeriodKind {
  Admin = 'ADMIN',
  Bonus = 'BONUS',
  Changeover = 'CHANGEOVER',
  Regular = 'REGULAR'
}

export type MembershipPeriodStats = {
  __typename?: 'MembershipPeriodStats';
  days: Array<MembershipPeriodStatsDay>;
  id: Scalars['ID'];
  totalMemberships: Scalars['Int'];
};

export type MembershipPeriodStatsDay = {
  __typename?: 'MembershipPeriodStatsDay';
  cancelCount: Scalars['Int'];
  date: Scalars['Date'];
  id: Scalars['ID'];
  prolongCount: Scalars['Int'];
};

export type MembershipPotStats = {
  __typename?: 'MembershipPotStats';
  donatedAmountOfMemberships: Scalars['Int'];
  generatedAmountOfMemberships: Scalars['Int'];
  surplusAmountOfDonatedMemberships: Scalars['Int'];
  totalDonated: Scalars['Int'];
};

export type MembershipStats = {
  __typename?: 'MembershipStats';
  /** Returns age distribution for users with active memberships */
  ages: MembershipStatsAges;
  count: Scalars['Int'];
  countRange: Scalars['Int'];
  /** Returns membership evolution in monthly buckets. */
  evolution: MembershipStatsEvolution;
  /** Returns active membership counts per country/postalCode and year */
  geo?: Maybe<MembershipStatsGeo>;
  /** Returns active membership counts per city and year  */
  geoCities?: Maybe<MembershipStatsgeoCities>;
  lastSeen: MembershipStatsLastSeen;
  monthlys: Array<MonthlyMembershipStat>;
  /** Returns name distribution for users with active memberships including sex categorization */
  names: MembershipStatsNames;
  periods: MembershipPeriodStats;
};


export type MembershipStatsCountRangeArgs = {
  max: Scalars['DateTime'];
  min: Scalars['DateTime'];
};


export type MembershipStatsEvolutionArgs = {
  max: Scalars['YearMonthDate'];
  min: Scalars['YearMonthDate'];
};


export type MembershipStatsLastSeenArgs = {
  max: Scalars['YearMonthDate'];
  min: Scalars['YearMonthDate'];
};


export type MembershipStatsNamesArgs = {
  first?: InputMaybe<Scalars['Int']>;
};


export type MembershipStatsPeriodsArgs = {
  maxEndDate: Scalars['Date'];
  membershipTypes?: InputMaybe<Array<Scalars['String']>>;
  minEndDate: Scalars['Date'];
};

export type MembershipStatsAges = {
  __typename?: 'MembershipStatsAges';
  averageAge?: Maybe<Scalars['Float']>;
  buckets: Array<MembershipStatsAgesBucket>;
  updatedAt: Scalars['DateTime'];
};

export type MembershipStatsAgesBucket = {
  __typename?: 'MembershipStatsAgesBucket';
  count: Scalars['Int'];
  key?: Maybe<Scalars['Int']>;
};

export type MembershipStatsEvolution = {
  __typename?: 'MembershipStatsEvolution';
  buckets?: Maybe<Array<MembershipStatsEvolutionBucket>>;
  updatedAt: Scalars['DateTime'];
};

export type MembershipStatsEvolutionBucket = {
  __typename?: 'MembershipStatsEvolutionBucket';
  /** Amount of memberships which are active (periods) */
  active: Scalars['Int'];
  /** Amount of active memberships at beginning of month */
  activeBeginningOfMonth: Scalars['Int'];
  /** Amount of still or again active crowdfunding memberships (periods) */
  activeCrowdfunders: Scalars['Int'];
  /** Amount of still or again active crowdfunding memberships at end of month */
  activeCrowdfundersEndOfMonth: Scalars['Int'];
  /** Amount of active memberships at end of month */
  activeEndOfMonth: Scalars['Int'];
  /** Amount of active memberships at end of month with a donation */
  activeEndOfMonthWithDonation: Scalars['Int'];
  /** Amount of active memberships at end of month without a donation */
  activeEndOfMonthWithoutDonation: Scalars['Int'];
  /** Amount of still or again active loyalist memberships (periods) */
  activeLoyalists: Scalars['Int'];
  /** Amount of still or again active loyalist memberships at end of month */
  activeLoyalistsEndOfMonth: Scalars['Int'];
  /** Amount of memberships which ended and were cancelled as of now */
  cancelled: Scalars['Int'];
  /** Amount of memberships ended during month due to cancellation */
  cancelledEndOfMonth: Scalars['Int'];
  /** Amount of memberships which ended as of now */
  ended: Scalars['Int'];
  /** Amount of memberships ended during month */
  endedEndOfMonth: Scalars['Int'];
  /** Amount of memberships ending during month */
  ending: Scalars['Int'];
  /** Amount of memberships which expired as of now */
  expired: Scalars['Int'];
  /** Amount of memberships ended during month due to expiration */
  expiredEndOfMonth: Scalars['Int'];
  /** Amount of memberships gained during month */
  gaining: Scalars['Int'];
  /** Amount of memberships gained during month with donation */
  gainingWithDonation: Scalars['Int'];
  /** Amount of memberships gained during month without donation */
  gainingWithoutDonation: Scalars['Int'];
  /** Bucket key (YYYY-MM) */
  key: Scalars['String'];
  /** Amount of memberships which are overdue */
  overdue: Scalars['Int'];
  /** Amount of all memberships pending at end of month (ending but still prolongable) */
  pending: Scalars['Int'];
  /** Amount of all subscriptions (e.g. MONTHLY_ABO) pending at end of month (ending but still prolongable) */
  pendingSubscriptionsOnly: Scalars['Int'];
  /** Amount of memberships ending during month but still prolongable */
  prolongable: Scalars['Int'];
};

export type MembershipStatsGeo = {
  __typename?: 'MembershipStatsGeo';
  buckets: Array<MembershipStatsGeoBucket>;
  updatedAt: Scalars['DateTime'];
};

export type MembershipStatsGeoBucket = {
  __typename?: 'MembershipStatsGeoBucket';
  buckets: Array<MembershipStatsGeoCountBucket>;
  country?: Maybe<Scalars['String']>;
  key?: Maybe<Scalars['String']>;
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  postalCode?: Maybe<Scalars['String']>;
};

export type MembershipStatsGeoCountBucket = {
  __typename?: 'MembershipStatsGeoCountBucket';
  count: Scalars['Int'];
  key?: Maybe<Scalars['String']>;
};

export type MembershipStatsLastSeen = {
  __typename?: 'MembershipStatsLastSeen';
  buckets?: Maybe<Array<MembershipStatsLastSeenBucket>>;
  updatedAt: Scalars['DateTime'];
};

export type MembershipStatsLastSeenBucket = {
  __typename?: 'MembershipStatsLastSeenBucket';
  /** Bucket key (YYYY-MM) */
  key: Scalars['String'];
  users: Scalars['Int'];
};

export type MembershipStatsNames = {
  __typename?: 'MembershipStatsNames';
  buckets: Array<MembershipStatsNamesBucket>;
  updatedAt: Scalars['DateTime'];
};

export type MembershipStatsNamesBucket = {
  __typename?: 'MembershipStatsNamesBucket';
  count: Scalars['Int'];
  key?: Maybe<Scalars['String']>;
  sex?: Maybe<Sex>;
};

export type MembershipStatsgeoCities = {
  __typename?: 'MembershipStatsgeoCities';
  buckets: Array<MembershipStatsgeoCitiesBucket>;
  updatedAt: Scalars['DateTime'];
};

export type MembershipStatsgeoCitiesBucket = {
  __typename?: 'MembershipStatsgeoCitiesBucket';
  buckets: Array<MembershipStatsgeoCitiesCountBucket>;
  key?: Maybe<Scalars['String']>;
};

export type MembershipStatsgeoCitiesCountBucket = {
  __typename?: 'MembershipStatsgeoCitiesCountBucket';
  count: Scalars['Int'];
  key?: Maybe<Scalars['String']>;
};

export type MembershipType = {
  __typename?: 'MembershipType';
  createdAt: Scalars['DateTime'];
  defaultPeriods: Scalars['Int'];
  id: Scalars['ID'];
  interval: MembershipTypeInterval;
  maxPeriods: Scalars['Int'];
  minPeriods: Scalars['Int'];
  name: Scalars['String'];
  requireAddress: Scalars['Boolean'];
  updatedAt: Scalars['DateTime'];
};

export enum MembershipTypeInterval {
  Day = 'day',
  Month = 'month',
  Week = 'week',
  Year = 'year'
}

export type Memo = {
  __typename?: 'Memo';
  author: Author;
  content?: Maybe<Scalars['JSON']>;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  parentIds: Array<Scalars['ID']>;
  published: Scalars['Boolean'];
  text?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};

export type MentioningDocument = {
  __typename?: 'MentioningDocument';
  document: Document;
  fragmentId?: Maybe<Scalars['String']>;
  iconUrl: Scalars['String'];
};

export type Meta = {
  __typename?: 'Meta';
  audioCover?: Maybe<Scalars['String']>;
  audioCoverCrop?: Maybe<Crop>;
  audioSource?: Maybe<AudioSource>;
  color?: Maybe<Scalars['String']>;
  contributors: Array<Contributor>;
  credits?: Maybe<Scalars['JSON']>;
  description?: Maybe<Scalars['String']>;
  disableActionBar?: Maybe<Scalars['Boolean']>;
  dossier?: Maybe<Document>;
  emailSubject?: Maybe<Scalars['String']>;
  estimatedConsumptionMinutes?: Maybe<Scalars['Int']>;
  estimatedReadingMinutes?: Maybe<Scalars['Int']>;
  externalBaseUrl?: Maybe<Scalars['String']>;
  facebookDescription?: Maybe<Scalars['String']>;
  facebookImage?: Maybe<Scalars['String']>;
  facebookTitle?: Maybe<Scalars['String']>;
  feed?: Maybe<Scalars['Boolean']>;
  format?: Maybe<Document>;
  gallery?: Maybe<Scalars['Boolean']>;
  image?: Maybe<Scalars['String']>;
  indicateChart?: Maybe<Scalars['Boolean']>;
  indicateGallery?: Maybe<Scalars['Boolean']>;
  indicateVideo?: Maybe<Scalars['Boolean']>;
  isRestricted?: Maybe<Scalars['Boolean']>;
  kind?: Maybe<Scalars['String']>;
  lastPublishedAt?: Maybe<Scalars['DateTime']>;
  linkedDiscussion?: Maybe<Discussion>;
  newsletter?: Maybe<Newsletter>;
  ownDiscussion?: Maybe<Discussion>;
  path?: Maybe<Scalars['String']>;
  paynoteMode?: Maybe<PaynoteMode>;
  paynotes?: Maybe<Array<Maybe<Scalars['JSON']>>>;
  podcast?: Maybe<Podcast>;
  prepublication?: Maybe<Scalars['Boolean']>;
  publishDate?: Maybe<Scalars['DateTime']>;
  recommendations?: Maybe<DocumentConnection>;
  section?: Maybe<Document>;
  seoDescription?: Maybe<Scalars['String']>;
  seoTitle?: Maybe<Scalars['String']>;
  series?: Maybe<Series>;
  shareBackgroundImage?: Maybe<Scalars['String']>;
  shareBackgroundImageInverted?: Maybe<Scalars['String']>;
  shareFontSize?: Maybe<Scalars['Int']>;
  shareInverted?: Maybe<Scalars['Boolean']>;
  shareLogo?: Maybe<Scalars['String']>;
  shareText?: Maybe<Scalars['String']>;
  shareTextPosition?: Maybe<Scalars['String']>;
  shortTitle?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  /** @deprecated parse `Document.content` instead */
  subject?: Maybe<Scalars['String']>;
  suggestSubscription?: Maybe<Scalars['Boolean']>;
  template?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  twitterDescription?: Maybe<Scalars['String']>;
  twitterImage?: Maybe<Scalars['String']>;
  twitterTitle?: Maybe<Scalars['String']>;
  willBeReadAloud?: Maybe<Scalars['Boolean']>;
};


export type MetaAudioCoverArgs = {
  properties?: InputMaybe<ImageProperties>;
};

export type Milestone = MilestoneInterface & {
  __typename?: 'Milestone';
  author: Author;
  commit: Commit;
  date: Scalars['DateTime'];
  immutable: Scalars['Boolean'];
  message?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type MilestoneInterface = {
  author: Author;
  commit: Commit;
  date: Scalars['DateTime'];
  name: Scalars['String'];
};

export type MonthlyMembershipStat = {
  __typename?: 'MonthlyMembershipStat';
  day: Scalars['Date'];
  newCount: Scalars['Int'];
  renewableCount: Scalars['Int'];
  renewedCount: Scalars['Int'];
  renewedRatio: Scalars['Float'];
};

export enum MutationType {
  Created = 'CREATED',
  Deleted = 'DELETED',
  Updated = 'UPDATED'
}

export type Newsletter = {
  __typename?: 'Newsletter';
  free?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
};

export enum NewsletterName {
  Accomplice = 'ACCOMPLICE',
  Climate = 'CLIMATE',
  Daily = 'DAILY',
  Projectr = 'PROJECTR',
  Weekly = 'WEEKLY'
}

export type NewsletterSettings = {
  __typename?: 'NewsletterSettings';
  id: Scalars['ID'];
  status: Scalars['String'];
  subscriptions?: Maybe<Array<Maybe<NewsletterSubscription>>>;
};


export type NewsletterSettingsSubscriptionsArgs = {
  name?: InputMaybe<NewsletterName>;
};

export type NewsletterSubscription = {
  __typename?: 'NewsletterSubscription';
  id: Scalars['ID'];
  /** @deprecated Eligability is handeld elsewhere. Subscription changes are always possible. */
  isEligible: Scalars['Boolean'];
  name: NewsletterName;
  subscribed: Scalars['Boolean'];
};

export type Notification = {
  __typename?: 'Notification';
  appPushesFailed?: Maybe<Scalars['Int']>;
  appPushesSuccessful?: Maybe<Scalars['Int']>;
  channels: Array<Maybe<DiscussionNotificationChannel>>;
  content: NotificationContent;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  object?: Maybe<EventObject>;
  readAt?: Maybe<Scalars['DateTime']>;
  subscription?: Maybe<Subscription>;
};

export type NotificationConnection = {
  __typename?: 'NotificationConnection';
  nodes: Array<Notification>;
  pageInfo: SubscriptionPageInfo;
  totalCount: Scalars['Int'];
  unreadCount: Scalars['Int'];
};

export type NotificationContent = {
  __typename?: 'NotificationContent';
  title: Scalars['String'];
  url: Scalars['String'];
};

export enum OsType {
  Android = 'android',
  Ios = 'ios'
}

export type OrderBy = {
  direction: OrderDirection;
  field: Field;
};

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Package = {
  __typename?: 'Package';
  company: Company;
  createdAt: Scalars['DateTime'];
  group: PackageGroup;
  id: Scalars['ID'];
  name: Scalars['String'];
  options: Array<PackageOption>;
  paymentMethods: Array<PaymentMethod>;
  suggestedTotal?: Maybe<Scalars['Int']>;
  updatedAt: Scalars['DateTime'];
};

export enum PackageGroup {
  Give = 'GIVE',
  Hidden = 'HIDDEN',
  Me = 'ME'
}

export type PackageOption = {
  __typename?: 'PackageOption';
  accessGranted?: Maybe<Scalars['Boolean']>;
  additionalPeriods?: Maybe<Array<MembershipPeriod>>;
  amount?: Maybe<Scalars['Int']>;
  autoPay?: Maybe<Scalars['Boolean']>;
  createdAt: Scalars['DateTime'];
  defaultAmount: Scalars['Int'];
  fixedPrice: Scalars['Boolean'];
  id: Scalars['ID'];
  maxAmount?: Maybe<Scalars['Int']>;
  membership?: Maybe<Membership>;
  minAmount: Scalars['Int'];
  minUserPrice: Scalars['Int'];
  optionGroup?: Maybe<Scalars['String']>;
  package: Package;
  payMoreSuggestion: Scalars['Boolean'];
  periods?: Maybe<Scalars['Int']>;
  price: Scalars['Int'];
  reward?: Maybe<Reward>;
  templateId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  userPrice: Scalars['Boolean'];
  vat: Scalars['Int'];
};

export type PackageOptionInput = {
  amount: Scalars['Int'];
  autoPay?: InputMaybe<Scalars['Boolean']>;
  membershipId?: InputMaybe<Scalars['ID']>;
  periods?: InputMaybe<Scalars['Int']>;
  price: Scalars['Int'];
  templateId: Scalars['ID'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export enum PaymentMethod {
  Paymentslip = 'PAYMENTSLIP',
  Paypal = 'PAYPAL',
  Postfinancecard = 'POSTFINANCECARD',
  Stripe = 'STRIPE'
}

export type PaymentSource = {
  __typename?: 'PaymentSource';
  brand: Scalars['String'];
  expMonth: Scalars['Int'];
  expYear: Scalars['Int'];
  id: Scalars['String'];
  isDefault: Scalars['Boolean'];
  isExpired: Scalars['Boolean'];
  last4: Scalars['String'];
  status: PaymentSourceStatus;
  wallet?: Maybe<PaymentSourceWallet>;
};

export enum PaymentSourceStatus {
  Canceled = 'CANCELED',
  Chargeable = 'CHARGEABLE',
  Consumed = 'CONSUMED',
  Failed = 'FAILED',
  Pending = 'PENDING'
}

export enum PaymentSourceWallet {
  AmexExpressCheckout = 'amex_express_checkout',
  ApplePay = 'apple_pay',
  GooglePay = 'google_pay',
  Masterpass = 'masterpass',
  SamsungPay = 'samsung_pay',
  VisaCheckout = 'visa_checkout'
}

export enum PaymentStatus {
  Cancelled = 'CANCELLED',
  Paid = 'PAID',
  Refunded = 'REFUNDED',
  Waiting = 'WAITING',
  WaitingForRefund = 'WAITING_FOR_REFUND'
}

export enum PaynoteMode {
  Button = 'button',
  NoPaynote = 'noPaynote',
  TrialForm = 'trialForm'
}

export enum Permission {
  Allowed = 'ALLOWED',
  Enforced = 'ENFORCED',
  Forbidden = 'FORBIDDEN'
}

export type PlayableMedia = {
  durationMs: Scalars['Int'];
  mediaId: Scalars['ID'];
  userProgress?: Maybe<MediaProgress>;
};

export type Pledge = {
  __typename?: 'Pledge';
  createdAt: Scalars['DateTime'];
  donation: Scalars['Int'];
  id: Scalars['ID'];
  memberships: Array<Membership>;
  options: Array<PackageOption>;
  package: Package;
  payments: Array<PledgePayment>;
  reason?: Maybe<Scalars['String']>;
  shippingAddress?: Maybe<Address>;
  status: PledgeStatus;
  total: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type PledgeInput = {
  accessToken?: InputMaybe<Scalars['ID']>;
  address?: InputMaybe<AddressInput>;
  messageToClaimers?: InputMaybe<Scalars['String']>;
  options: Array<PackageOptionInput>;
  payload?: InputMaybe<Scalars['JSON']>;
  reason?: InputMaybe<Scalars['String']>;
  shippingAddress?: InputMaybe<AddressInput>;
  total: Scalars['Int'];
  user?: InputMaybe<UserInput>;
};

export type PledgePayment = {
  __typename?: 'PledgePayment';
  createdAt: Scalars['DateTime'];
  dueDate?: Maybe<Scalars['DateTime']>;
  hrid?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  invoiceUrl?: Maybe<Scalars['String']>;
  method: PaymentMethod;
  paperInvoice: Scalars['Boolean'];
  paymentslipUrl?: Maybe<Scalars['String']>;
  pspId?: Maybe<Scalars['String']>;
  reference?: Maybe<Scalars['String']>;
  remindersSentAt?: Maybe<Array<Scalars['DateTime']>>;
  status: PaymentStatus;
  total: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
  user?: Maybe<User>;
};


export type PledgePaymentReferenceArgs = {
  pretty?: InputMaybe<Scalars['Boolean']>;
};

export type PledgePaymentInput = {
  address?: InputMaybe<AddressInput>;
  makeDefault?: InputMaybe<Scalars['Boolean']>;
  method: PaymentMethod;
  paperInvoice?: InputMaybe<Scalars['Boolean']>;
  pledgeId: Scalars['ID'];
  pspPayload?: InputMaybe<Scalars['JSON']>;
  shippingAddress?: InputMaybe<AddressInput>;
  sourceId?: InputMaybe<Scalars['String']>;
};

export type PledgePayments = {
  __typename?: 'PledgePayments';
  count: Scalars['Int'];
  items: Array<PledgePayment>;
};

export type PledgeResponse = {
  __typename?: 'PledgeResponse';
  companyId?: Maybe<Scalars['ID']>;
  emailVerify?: Maybe<Scalars['Boolean']>;
  pfAliasId?: Maybe<Scalars['String']>;
  pfSHA?: Maybe<Scalars['String']>;
  pledgeId?: Maybe<Scalars['ID']>;
  stripeClientSecret?: Maybe<Scalars['String']>;
  stripePaymentIntentId?: Maybe<Scalars['ID']>;
  stripePublishableKey?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['ID']>;
};

export enum PledgeStatus {
  Cancelled = 'CANCELLED',
  Draft = 'DRAFT',
  PaidInvestigate = 'PAID_INVESTIGATE',
  Successful = 'SUCCESSFUL',
  WaitingForPayment = 'WAITING_FOR_PAYMENT'
}

export type Podcast = {
  __typename?: 'Podcast';
  appleUrl?: Maybe<Scalars['String']>;
  googleUrl?: Maybe<Scalars['String']>;
  podigeeSlug?: Maybe<Scalars['String']>;
  spotifyUrl?: Maybe<Scalars['String']>;
};

export enum PortraitSize {
  /** @deprecated use `ImageProperties` instead */
  Share = 'SHARE',
  /** @deprecated use `ImageProperties` instead */
  Small = 'SMALL'
}

export type PostalCodeGeo = {
  __typename?: 'PostalCodeGeo';
  countryCode?: Maybe<Scalars['String']>;
  countryName?: Maybe<Scalars['String']>;
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  postalCode?: Maybe<Scalars['String']>;
};

export type PostfinancePayment = {
  __typename?: 'PostfinancePayment';
  avisierungstext: Scalars['String'];
  buchungsdatum: Scalars['Date'];
  createdAt: Scalars['DateTime'];
  debitorName?: Maybe<Scalars['String']>;
  gutschrift: Scalars['Int'];
  hidden: Scalars['Boolean'];
  iban: Scalars['String'];
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  konto: Scalars['String'];
  matched: Scalars['Boolean'];
  mitteilung?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  valuta: Scalars['Date'];
};

export type PostfinancePayments = {
  __typename?: 'PostfinancePayments';
  count: Scalars['Int'];
  items: Array<PostfinancePayment>;
};

export type Preview = {
  __typename?: 'Preview';
  more: Scalars['Boolean'];
  string: Scalars['String'];
};

export enum ProgressState {
  Finished = 'FINISHED',
  Unfinished = 'UNFINISHED'
}

export type Publication = MilestoneInterface & {
  __typename?: 'Publication';
  author: Author;
  commit: Commit;
  date: Scalars['DateTime'];
  document?: Maybe<Document>;
  live: Scalars['Boolean'];
  name: Scalars['String'];
  prepublication: Scalars['Boolean'];
  scheduledAt?: Maybe<Scalars['DateTime']>;
  sha: Scalars['String'];
  updateMailchimp: Scalars['Boolean'];
};

export type PublikatorPageInfo = {
  __typename?: 'PublikatorPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type PublishResponse = {
  __typename?: 'PublishResponse';
  publication?: Maybe<Publication>;
  unresolvedRepoIds: Array<Scalars['ID']>;
};

export type PublishSettings = {
  ignoreUnresolvedRepoIds?: InputMaybe<Scalars['Boolean']>;
  notifyFilters?: InputMaybe<Array<EventObjectType>>;
  prepublication: Scalars['Boolean'];
  scheduledAt?: InputMaybe<Scalars['DateTime']>;
  updateMailchimp: Scalars['Boolean'];
};

export enum QrCodeErrorCorrectionLevel {
  H = 'H',
  L = 'L',
  M = 'M',
  Q = 'Q'
}

export type QuestionInterface = {
  explanation?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  metadata?: Maybe<Scalars['JSON']>;
  order: Scalars['Int'];
  private: Scalars['Boolean'];
  questionnaire: Questionnaire;
  text: Scalars['String'];
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};

export type QuestionTurnout = {
  __typename?: 'QuestionTurnout';
  skipped: Scalars['Int'];
  submitted: Scalars['Int'];
  unattributed: Scalars['Int'];
};

export type QuestionTypeChoice = QuestionInterface & {
  __typename?: 'QuestionTypeChoice';
  cardinality: Scalars['Int'];
  explanation?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  metadata?: Maybe<Scalars['JSON']>;
  options: Array<QuestionTypeChoiceOption>;
  order: Scalars['Int'];
  private: Scalars['Boolean'];
  questionnaire: Questionnaire;
  result?: Maybe<Array<QuestionTypeChoiceResult>>;
  text: Scalars['String'];
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};


export type QuestionTypeChoiceResultArgs = {
  min?: InputMaybe<Scalars['Int']>;
  top?: InputMaybe<Scalars['Int']>;
};

export type QuestionTypeChoiceOption = {
  __typename?: 'QuestionTypeChoiceOption';
  category?: Maybe<Scalars['String']>;
  label: Scalars['String'];
  requireAddress?: Maybe<Scalars['Boolean']>;
  value: Scalars['ID'];
};

export type QuestionTypeChoiceResult = {
  __typename?: 'QuestionTypeChoiceResult';
  count: Scalars['Int'];
  option: QuestionTypeChoiceOption;
};

export type QuestionTypeDocument = QuestionInterface & {
  __typename?: 'QuestionTypeDocument';
  explanation?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  metadata?: Maybe<Scalars['JSON']>;
  order: Scalars['Int'];
  private: Scalars['Boolean'];
  questionnaire: Questionnaire;
  result?: Maybe<Array<QuestionTypeDocumentResult>>;
  template?: Maybe<Scalars['String']>;
  text: Scalars['String'];
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};


export type QuestionTypeDocumentResultArgs = {
  min?: InputMaybe<Scalars['Int']>;
  top?: InputMaybe<Scalars['Int']>;
};

export type QuestionTypeDocumentResult = {
  __typename?: 'QuestionTypeDocumentResult';
  count: Scalars['Int'];
  document?: Maybe<Document>;
};

export type QuestionTypeImageChoice = QuestionInterface & {
  __typename?: 'QuestionTypeImageChoice';
  cardinality: Scalars['Int'];
  explanation?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  metadata?: Maybe<Scalars['JSON']>;
  options: Array<QuestionTypeImageChoiceOption>;
  order: Scalars['Int'];
  private: Scalars['Boolean'];
  questionnaire: Questionnaire;
  result?: Maybe<Array<QuestionTypeImageChoiceResult>>;
  text: Scalars['String'];
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};


export type QuestionTypeImageChoiceResultArgs = {
  min?: InputMaybe<Scalars['Int']>;
  top?: InputMaybe<Scalars['Int']>;
};

export type QuestionTypeImageChoiceOption = {
  __typename?: 'QuestionTypeImageChoiceOption';
  category?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  label: Scalars['String'];
  requireAddress?: Maybe<Scalars['Boolean']>;
  value: Scalars['ID'];
};

export type QuestionTypeImageChoiceResult = {
  __typename?: 'QuestionTypeImageChoiceResult';
  count: Scalars['Int'];
  option: QuestionTypeImageChoiceOption;
};

export type QuestionTypeRange = QuestionInterface & {
  __typename?: 'QuestionTypeRange';
  explanation?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  kind: QuestionTypeRangeKind;
  metadata?: Maybe<Scalars['JSON']>;
  order: Scalars['Int'];
  private: Scalars['Boolean'];
  questionnaire: Questionnaire;
  result?: Maybe<QuestionTypeRangeResult>;
  text: Scalars['String'];
  ticks: Array<QuestionTypeRangeTick>;
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};

export enum QuestionTypeRangeKind {
  Continous = 'continous',
  Discrete = 'discrete'
}

export type QuestionTypeRangeResult = {
  __typename?: 'QuestionTypeRangeResult';
  deviation?: Maybe<Scalars['Float']>;
  histogram: Array<QuestionTypeRangeResultBin>;
  mean: Scalars['Float'];
  median: Scalars['Float'];
};


export type QuestionTypeRangeResultHistogramArgs = {
  ticks?: InputMaybe<Scalars['Int']>;
};

export type QuestionTypeRangeResultBin = {
  __typename?: 'QuestionTypeRangeResultBin';
  count: Scalars['Int'];
  x0: Scalars['Float'];
  x1: Scalars['Float'];
};

export type QuestionTypeRangeTick = {
  __typename?: 'QuestionTypeRangeTick';
  label: Scalars['String'];
  value: Scalars['Int'];
};

export type QuestionTypeText = QuestionInterface & {
  __typename?: 'QuestionTypeText';
  explanation?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  maxLength?: Maybe<Scalars['Int']>;
  metadata?: Maybe<Scalars['JSON']>;
  order: Scalars['Int'];
  private: Scalars['Boolean'];
  questionnaire: Questionnaire;
  text: Scalars['String'];
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};

export type Questionnaire = {
  __typename?: 'Questionnaire';
  allowedMemberships?: Maybe<Array<VotingMembershipRequirement>>;
  allowedRoles?: Maybe<Array<Scalars['String']>>;
  beginDate: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  endDate: Scalars['DateTime'];
  id: Scalars['ID'];
  questions: Array<QuestionInterface>;
  resubmitAnswers: Scalars['Boolean'];
  revokeSubmissions: Scalars['Boolean'];
  slug: Scalars['String'];
  submissions?: Maybe<SubmissionConnection>;
  submitAnswersImmediately: Scalars['Boolean'];
  turnout?: Maybe<QuestionnaireTurnout>;
  unattributedAnswers: Scalars['Boolean'];
  userHasSubmitted?: Maybe<Scalars['Boolean']>;
  userIsEligible?: Maybe<Scalars['Boolean']>;
  userSubmissionId?: Maybe<Scalars['ID']>;
  userSubmitDate?: Maybe<Scalars['DateTime']>;
};


export type QuestionnaireQuestionsArgs = {
  orderFilter?: InputMaybe<Array<Scalars['Int']>>;
  shuffle?: InputMaybe<Scalars['Int']>;
};


export type QuestionnaireSubmissionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<SubmissionsFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<SubmissionsSortInput>;
  value?: InputMaybe<Scalars['String']>;
};

export type QuestionnaireTurnout = {
  __typename?: 'QuestionnaireTurnout';
  eligible: Scalars['Int'];
  submitted: Scalars['Int'];
};

export type Redirection = {
  __typename?: 'Redirection';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  resource?: Maybe<Scalars['JSON']>;
  source: Scalars['String'];
  status: Scalars['Int'];
  target: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type RedirectionConnection = {
  __typename?: 'RedirectionConnection';
  nodes: Array<Redirection>;
  pageInfo: RedirectionPageInfo;
  totalCount: Scalars['Int'];
};

export type RedirectionPageInfo = {
  __typename?: 'RedirectionPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type Repo = {
  __typename?: 'Repo';
  commit?: Maybe<Commit>;
  commits: CommitConnection;
  currentPhase: RepoPhase;
  files: Array<RepoFile>;
  id: Scalars['ID'];
  isArchived: Scalars['Boolean'];
  isTemplate: Scalars['Boolean'];
  latestCommit: Commit;
  latestPublications: Array<Maybe<Publication>>;
  memos: Array<Memo>;
  meta: RepoMeta;
  milestones: Array<Milestone>;
  uncommittedChanges: Array<User>;
};


export type RepoCommitArgs = {
  id: Scalars['ID'];
};


export type RepoCommitsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
};

export type RepoChange = {
  __typename?: 'RepoChange';
  commit?: Maybe<Commit>;
  milestone?: Maybe<Milestone>;
  mutation: RepoChangeMutationType;
  repo?: Maybe<Repo>;
};

export enum RepoChangeMutationType {
  Created = 'CREATED',
  Deleted = 'DELETED',
  Updated = 'UPDATED'
}

export type RepoConnection = {
  __typename?: 'RepoConnection';
  nodes?: Maybe<Array<Maybe<Repo>>>;
  pageInfo: PublikatorPageInfo;
  phases?: Maybe<Array<Maybe<RepoPhaseWithCount>>>;
  totalCount: Scalars['Int'];
  /** @deprecated Do not use anymore. Part of GitHub heydays. */
  totalDiskUsage?: Maybe<Scalars['Int']>;
};

export type RepoFile = {
  __typename?: 'RepoFile';
  author: Author;
  createdAt: Scalars['DateTime'];
  destroyedAt?: Maybe<Scalars['DateTime']>;
  error?: Maybe<Scalars['String']>;
  failedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  readyAt?: Maybe<Scalars['DateTime']>;
  status: RepoFileStatus;
  updatedAt: Scalars['DateTime'];
  /** If file is not ready, returns an upload URL */
  url?: Maybe<Scalars['String']>;
};

export enum RepoFileStatus {
  Destroyed = 'Destroyed',
  Failure = 'Failure',
  Pending = 'Pending',
  Private = 'Private',
  Public = 'Public'
}

export type RepoMeta = {
  __typename?: 'RepoMeta';
  briefingUrl?: Maybe<Scalars['String']>;
  creationDeadline?: Maybe<Scalars['DateTime']>;
  productionDeadline?: Maybe<Scalars['DateTime']>;
  publishDate?: Maybe<Scalars['DateTime']>;
};

export type RepoOrderBy = {
  direction: OrderDirection;
  field: RepoOrderField;
};

export enum RepoOrderField {
  CreatedAt = 'CREATED_AT',
  Name = 'NAME',
  PushedAt = 'PUSHED_AT',
  Stargazers = 'STARGAZERS',
  UpdatedAt = 'UPDATED_AT'
}

export type RepoPhase = RepoPhaseInterface & {
  __typename?: 'RepoPhase';
  color: Scalars['String'];
  key: RepoPhaseKey;
  label: Scalars['String'];
  lock: Scalars['Boolean'];
};

export type RepoPhaseInterface = {
  color: Scalars['String'];
  key: RepoPhaseKey;
  label: Scalars['String'];
  lock: Scalars['Boolean'];
};

export enum RepoPhaseKey {
  Cr = 'cr',
  Creation = 'creation',
  Draft = 'draft',
  FinalControl = 'finalControl',
  FinalEditing = 'finalEditing',
  Production = 'production',
  ProofReading = 'proofReading',
  Published = 'published',
  Ready = 'ready',
  Scheduled = 'scheduled',
  Tc = 'tc'
}

export type RepoPhaseWithCount = RepoPhaseInterface & {
  __typename?: 'RepoPhaseWithCount';
  color: Scalars['String'];
  count: Scalars['Int'];
  key: RepoPhaseKey;
  label: Scalars['String'];
  lock: Scalars['Boolean'];
};

export type RepoPublishDateRange = {
  from: Scalars['DateTime'];
  until: Scalars['DateTime'];
};

export type RequestInfo = {
  __typename?: 'RequestInfo';
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  ipAddress: Scalars['String'];
  isApp: Scalars['Boolean'];
  userAgent?: Maybe<Scalars['String']>;
};

export type RequiredUserFields = {
  firstName: Scalars['String'];
  lastName: Scalars['String'];
};

export type RevenueStats = {
  __typename?: 'RevenueStats';
  /** Returns revenue segments */
  segments: RevenueStatsSegments;
  /**
   * Returns surplus, an amount of money payments exceeds their pledge values ("revenue").
   * Example: [pledge total] - [memerships] - [goodies] = [surplus].
   */
  surplus: RevenueStatsSurplus;
};


export type RevenueStatsSurplusArgs = {
  max?: InputMaybe<Scalars['DateTime']>;
  min: Scalars['DateTime'];
};

export type RevenueStatsSegments = {
  __typename?: 'RevenueStatsSegments';
  buckets: Array<RevenueStatsSegmentsDateBucket>;
  updatedAt: Scalars['DateTime'];
};

export type RevenueStatsSegmentsBucket = {
  __typename?: 'RevenueStatsSegmentsBucket';
  key: Scalars['String'];
  label: Scalars['String'];
  /** Share */
  share: Scalars['Float'];
};

export type RevenueStatsSegmentsDateBucket = {
  __typename?: 'RevenueStatsSegmentsDateBucket';
  buckets: Array<RevenueStatsSegmentsBucket>;
  key: Scalars['String'];
};

export type RevenueStatsSurplus = {
  __typename?: 'RevenueStatsSurplus';
  total: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};

export type Reward = Goodie | MembershipType;

export type RoleStats = {
  __typename?: 'RoleStats';
  count?: Maybe<Scalars['Int']>;
};

export type SearchAggregation = {
  __typename?: 'SearchAggregation';
  buckets?: Maybe<Array<SearchAggregationBucket>>;
  count?: Maybe<Scalars['Int']>;
  key: Scalars['String'];
  label: Scalars['String'];
};

export type SearchAggregationBucket = {
  __typename?: 'SearchAggregationBucket';
  count: Scalars['Int'];
  label: Scalars['String'];
  value: Scalars['String'];
};

export type SearchConnection = {
  __typename?: 'SearchConnection';
  aggregations: Array<SearchAggregation>;
  nodes: Array<SearchNode>;
  pageInfo: SearchPageInfo;
  totalCount: Scalars['Int'];
  trackingId?: Maybe<Scalars['ID']>;
};


export type SearchConnectionAggregationsArgs = {
  keys?: InputMaybe<Array<Scalars['String']>>;
};

export type SearchEntity = Comment | Document | DocumentZone | User;

export type SearchFilterInput = {
  audioSourceKind?: InputMaybe<AudioSourceKind>;
  author?: InputMaybe<Scalars['String']>;
  discussion?: InputMaybe<Scalars['Boolean']>;
  dossier?: InputMaybe<Scalars['String']>;
  feed?: InputMaybe<Scalars['Boolean']>;
  format?: InputMaybe<Scalars['String']>;
  formats?: InputMaybe<Array<Scalars['String']>>;
  hasAudio?: InputMaybe<Scalars['Boolean']>;
  hasDossier?: InputMaybe<Scalars['Boolean']>;
  hasFormat?: InputMaybe<Scalars['Boolean']>;
  hasVideo?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['ID']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  isSeriesEpisode?: InputMaybe<Scalars['Boolean']>;
  isSeriesMaster?: InputMaybe<Scalars['Boolean']>;
  publishedAt?: InputMaybe<DateRangeInput>;
  repoIds?: InputMaybe<Array<Scalars['ID']>>;
  scheduledAt?: InputMaybe<DateRangeInput>;
  template?: InputMaybe<Scalars['String']>;
  textLength?: InputMaybe<DocumentTextLengths>;
  type?: InputMaybe<SearchTypes>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type SearchGenericFilterInput = {
  key: Scalars['String'];
  not?: InputMaybe<Scalars['Boolean']>;
  value: Scalars['String'];
};

export type SearchHighlight = {
  __typename?: 'SearchHighlight';
  fragments: Array<Scalars['String']>;
  path: Scalars['String'];
};

export type SearchNode = {
  __typename?: 'SearchNode';
  entity: SearchEntity;
  highlights: Array<SearchHighlight>;
  score?: Maybe<Scalars['Float']>;
};

export type SearchPageInfo = {
  __typename?: 'SearchPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export enum SearchProcessor {
  FormatFeedSamples = 'formatFeedSamples'
}

export type SearchSortInput = {
  direction?: InputMaybe<OrderDirection>;
  key: SearchSortKey;
};

export enum SearchSortKey {
  MostDebated = 'mostDebated',
  MostRead = 'mostRead',
  PublishedAt = 'publishedAt',
  Relevance = 'relevance'
}

export enum SearchTypes {
  Comment = 'Comment',
  Document = 'Document',
  DocumentZone = 'DocumentZone',
  User = 'User'
}

export type Series = {
  __typename?: 'Series';
  description?: Maybe<Scalars['String']>;
  episodes: Array<Episode>;
  logo?: Maybe<Scalars['String']>;
  logoDark?: Maybe<Scalars['String']>;
  overview?: Maybe<Document>;
  title: Scalars['String'];
};

export type Session = {
  __typename?: 'Session';
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  device?: Maybe<Device>;
  email: Scalars['String'];
  expiresAt: Scalars['DateTime'];
  id: Scalars['ID'];
  ipAddress: Scalars['String'];
  isCurrent: Scalars['Boolean'];
  phrase?: Maybe<Scalars['String']>;
  userAgent?: Maybe<Scalars['String']>;
};

export enum Sex {
  Both = 'BOTH',
  Female = 'FEMALE',
  Male = 'MALE'
}

export type SharedSecretResponse = {
  __typename?: 'SharedSecretResponse';
  otpAuthUrl: Scalars['String'];
  secret: Scalars['String'];
  svg: Scalars['String'];
};


export type SharedSecretResponseSvgArgs = {
  errorCorrectionLevel?: InputMaybe<QrCodeErrorCorrectionLevel>;
};

export type SignInNotification = {
  __typename?: 'SignInNotification';
  body: Scalars['String'];
  expiresAt: Scalars['DateTime'];
  title: Scalars['String'];
  verificationUrl: Scalars['String'];
};

export type SignInResponse = {
  __typename?: 'SignInResponse';
  alternativeFirstFactors: Array<SignInTokenType>;
  expiresAt: Scalars['DateTime'];
  phrase: Scalars['String'];
  tokenType: SignInTokenType;
};

export type SignInToken = {
  payload: Scalars['String'];
  type: SignInTokenType;
};

export enum SignInTokenType {
  AccessToken = 'ACCESS_TOKEN',
  App = 'APP',
  EmailCode = 'EMAIL_CODE',
  EmailToken = 'EMAIL_TOKEN',
  Sms = 'SMS',
  Totp = 'TOTP'
}

export type StatementUser = {
  __typename?: 'StatementUser';
  credentials: Array<Credential>;
  hasPublicProfile: Scalars['Boolean'];
  id: Scalars['ID'];
  name: Scalars['String'];
  portrait?: Maybe<Scalars['String']>;
  sequenceNumber?: Maybe<Scalars['Int']>;
  slug?: Maybe<Scalars['String']>;
  statement?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


export type StatementUserPortraitArgs = {
  properties?: InputMaybe<ImageProperties>;
};

export type StatementUserConnection = {
  __typename?: 'StatementUserConnection';
  nodes: Array<StatementUser>;
  pageInfo?: Maybe<PageInfo>;
  totalCount: Scalars['Int'];
};

export type StringArrayFilter = {
  field: Field;
  values: Array<Scalars['String']>;
};

export type Submission = {
  __typename?: 'Submission';
  answers: AnswerConnection;
  createdAt: Scalars['DateTime'];
  displayAuthor: DisplayUser;
  id: Scalars['ID'];
  questionnaire: Questionnaire;
  updatedAt: Scalars['DateTime'];
};

export type SubmissionConnection = {
  __typename?: 'SubmissionConnection';
  nodes: Array<Submission>;
  pageInfo: SubmissionPageInfo;
  totalCount: Scalars['Int'];
};

export type SubmissionFilterAnswer = {
  /** Question wich must be answered */
  questionId: Scalars['ID'];
  /** Expected amount of characters in answer given */
  valueLength?: InputMaybe<SubmissionFilterAnswerValueLength>;
};

export type SubmissionFilterAnswerValueLength = {
  /** Expect a maximum amount of characters in answer given */
  max?: InputMaybe<Scalars['Int']>;
  /** Expect a minimum amount of characters in answer given */
  min?: InputMaybe<Scalars['Int']>;
};

export type SubmissionPageInfo = {
  __typename?: 'SubmissionPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type SubmissionsFilterInput = {
  /** Return only submissions with these answered questions */
  answers?: InputMaybe<Array<InputMaybe<SubmissionFilterAnswer>>>;
  /** Return only submission with this ID */
  id?: InputMaybe<Scalars['ID']>;
  /** Omit submission with this ID */
  not?: InputMaybe<Scalars['ID']>;
  /** Omit submissions with these IDs */
  notSubmissionIds?: InputMaybe<Array<Scalars['ID']>>;
  /** Return only submissions with these IDs */
  submissionIds?: InputMaybe<Array<Scalars['ID']>>;
  /** Return submission by these user IDs */
  userIds?: InputMaybe<Array<Scalars['ID']>>;
};

export enum SubmissionsSortBy {
  CreatedAt = 'createdAt',
  Random = 'random'
}

export type SubmissionsSortInput = {
  by: SubmissionsSortBy;
  direction?: InputMaybe<OrderDirection>;
};

export type Subscription = {
  __typename?: 'Subscription';
  active: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  filters?: Maybe<Array<EventObjectType>>;
  id: Scalars['ID'];
  isEligibleForNotifications: Scalars['Boolean'];
  object?: Maybe<SubscriptionObject>;
  subject: User;
  updatedAt: Scalars['DateTime'];
};

export type SubscriptionConnection = {
  __typename?: 'SubscriptionConnection';
  nodes: Array<Subscription>;
  pageInfo?: Maybe<SubscriptionPageInfo>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type SubscriptionObject = Discussion | Document | User;

export enum SubscriptionObjectType {
  Document = 'Document',
  User = 'User'
}

export type SubscriptionPageInfo = {
  __typename?: 'SubscriptionPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type SyncPledgeResponse = {
  __typename?: 'SyncPledgeResponse';
  pledgeStatus: PledgeStatus;
  updatedPledge: Scalars['Boolean'];
};

export type TwitterEmbed = {
  __typename?: 'TwitterEmbed';
  createdAt: Scalars['DateTime'];
  html: Scalars['String'];
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  more?: Maybe<Scalars['String']>;
  playable: Scalars['Boolean'];
  retrievedAt: Scalars['DateTime'];
  text: Scalars['String'];
  url: Scalars['String'];
  userId: Scalars['String'];
  userName: Scalars['String'];
  userProfileImageUrl: Scalars['String'];
  userScreenName: Scalars['String'];
};

export type UnauthorizedSession = {
  __typename?: 'UnauthorizedSession';
  enabledSecondFactors: Array<Maybe<SignInTokenType>>;
  newUser?: Maybe<Scalars['Boolean']>;
  requiredConsents: Array<Scalars['String']>;
  requiredFields: Array<Scalars['String']>;
  session: Session;
};

export type UncommittedChangeUpdate = {
  __typename?: 'UncommittedChangeUpdate';
  action: Action;
  repoId: Scalars['ID'];
  user: User;
};

export type Update = {
  __typename?: 'Update';
  metaDescription?: Maybe<Scalars['String']>;
  publishedDateTime?: Maybe<Scalars['DateTime']>;
  slug?: Maybe<Scalars['String']>;
  socialMediaImage?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  /** List of granted memberships by User */
  accessCampaigns?: Maybe<Array<AccessCampaign>>;
  /** List of memberships a User was granted */
  accessGrants?: Maybe<Array<AccessGrant>>;
  accessToken?: Maybe<Scalars['ID']>;
  activeMembership?: Maybe<Membership>;
  address?: Maybe<Address>;
  adminNotes?: Maybe<Scalars['String']>;
  age?: Maybe<Scalars['Int']>;
  ageAccessRole?: Maybe<AccessRole>;
  /**
   * Returns a queue with audio items point to playable content. Use
   * mutations `addAudioQueueItem`, `moveAudioQueueItem`,
   * `removeAudioQueueItem` or `clearAudioQueue` to modify queue.
   */
  audioQueue?: Maybe<Array<AudioQueueItem>>;
  badges?: Maybe<Array<Maybe<Badge>>>;
  biography?: Maybe<Scalars['String']>;
  biographyContent?: Maybe<Scalars['JSON']>;
  birthday?: Maybe<Scalars['Date']>;
  calendar?: Maybe<Calendar>;
  /**
   * Call to actions for a user based on events, campaigns, etc.
   * Can target a specific user or a group of users.
   */
  callToActions: Array<CallToAction>;
  candidacies: Array<Candidacy>;
  cards: CardConnection;
  checkMembershipSubscriptions: Scalars['Boolean'];
  collection?: Maybe<Collection>;
  collectionItems: CollectionItemConnection;
  collections: Array<Collection>;
  comments: CommentConnection;
  createdAt: Scalars['DateTime'];
  credentials: Array<Credential>;
  customPackages?: Maybe<Array<Package>>;
  defaultDiscussionNotificationOption?: Maybe<DiscussionNotificationOption>;
  defaultPaymentSource?: Maybe<PaymentSource>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  devices: Array<Device>;
  disclosures?: Maybe<Scalars['String']>;
  discussionNotificationChannels: Array<DiscussionNotificationChannel>;
  documents: DocumentConnection;
  email?: Maybe<Scalars['String']>;
  emailAccessRole?: Maybe<AccessRole>;
  enabledFirstFactors: Array<SignInTokenType>;
  enabledSecondFactors: Array<SignInTokenType>;
  facebookId?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  futureCampaignAboCount?: Maybe<Scalars['Int']>;
  gender?: Maybe<Scalars['String']>;
  hasAddress?: Maybe<Scalars['Boolean']>;
  hasConsentedTo?: Maybe<Scalars['Boolean']>;
  hasDormantMembership: Scalars['Boolean'];
  hasPublicProfile?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  initials?: Maybe<Scalars['String']>;
  isAdminUnlisted?: Maybe<Scalars['Boolean']>;
  isBonusEligable: Scalars['Boolean'];
  isEligibleForProfile?: Maybe<Scalars['Boolean']>;
  isListed: Scalars['Boolean'];
  isSuspended?: Maybe<Scalars['Boolean']>;
  isUserOfCurrentSession: Scalars['Boolean'];
  lastName?: Maybe<Scalars['String']>;
  mailbox?: Maybe<MailboxConnection>;
  memberships: Array<Membership>;
  name?: Maybe<Scalars['String']>;
  newsletterSettings: NewsletterSettings;
  /** @deprecated use `defaultPaymentSource` instead */
  paymentSources: Array<PaymentSource>;
  pgpPublicKey?: Maybe<Scalars['String']>;
  pgpPublicKeyId?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  phoneNumberAccessRole?: Maybe<AccessRole>;
  phoneNumberNote?: Maybe<Scalars['String']>;
  pledges: Array<Pledge>;
  portrait?: Maybe<Scalars['String']>;
  preferredFirstFactor?: Maybe<SignInTokenType>;
  prolitterisId?: Maybe<Scalars['String']>;
  prolongBeforeDate?: Maybe<Scalars['DateTime']>;
  publicUrl?: Maybe<Scalars['String']>;
  roles: Array<Scalars['String']>;
  sequenceNumber?: Maybe<Scalars['Int']>;
  sessions?: Maybe<Array<Session>>;
  slug?: Maybe<Scalars['String']>;
  statement?: Maybe<Scalars['String']>;
  subscribedBy: SubscriptionConnection;
  subscribedByMe?: Maybe<Subscription>;
  subscribedTo: SubscriptionConnection;
  suspendedUntil?: Maybe<Scalars['DateTime']>;
  suspensions?: Maybe<Array<DiscussionSuspension>>;
  twitterHandle?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  username?: Maybe<Scalars['String']>;
};


export type UserAccessCampaignsArgs = {
  withPast?: InputMaybe<Scalars['Boolean']>;
};


export type UserAccessGrantsArgs = {
  withPast?: InputMaybe<Scalars['Boolean']>;
};


export type UserAccessTokenArgs = {
  scope: AccessTokenScope;
};


export type UserCalendarArgs = {
  slug: Scalars['String'];
};


export type UserCardsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<CardFiltersInput>;
  first?: InputMaybe<Scalars['Int']>;
  focus?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<CardSortInput>;
};


export type UserCollectionArgs = {
  name: Scalars['String'];
};


export type UserCollectionItemsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  lastDays?: InputMaybe<Scalars['Int']>;
  names: Array<Scalars['String']>;
  progress?: InputMaybe<ProgressState>;
  uniqueDocuments?: InputMaybe<Scalars['Boolean']>;
};


export type UserCommentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
};


export type UserCustomPackagesArgs = {
  crowdfundingName?: InputMaybe<Scalars['String']>;
};


export type UserDocumentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  feed?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type UserHasConsentedToArgs = {
  name: Scalars['String'];
};


export type UserMailboxArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<MailboxFiltersInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type UserPortraitArgs = {
  properties?: InputMaybe<ImageProperties>;
  size?: InputMaybe<PortraitSize>;
};


export type UserSubscribedByArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  onlyMe?: InputMaybe<Scalars['Boolean']>;
};


export type UserSubscribedToArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  objectType?: InputMaybe<SubscriptionObjectType>;
};


export type UserSuspensionsArgs = {
  withInactive?: InputMaybe<Scalars['Boolean']>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  nodes: Array<Maybe<User>>;
  pageInfo?: Maybe<PageInfo>;
  totalCount: Scalars['Int'];
};

export type UserInput = {
  birthday?: InputMaybe<Scalars['Date']>;
  email: Scalars['String'];
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
};

export type Users = {
  __typename?: 'Users';
  count: Scalars['Int'];
  items: Array<User>;
};

export type Video = {
  __typename?: 'Video';
  hls: Scalars['String'];
  mp4: Scalars['String'];
  poster?: Maybe<Scalars['String']>;
  subtitles?: Maybe<Scalars['String']>;
  youtube?: Maybe<Scalars['String']>;
};

export type VideoInput = {
  hls: Scalars['String'];
  mp4: Scalars['String'];
  poster?: InputMaybe<Scalars['String']>;
  subtitles?: InputMaybe<Scalars['String']>;
  youtube?: InputMaybe<Scalars['String']>;
};

export type VimeoEmbed = PlayableMedia & {
  __typename?: 'VimeoEmbed';
  aspectRatio?: Maybe<Scalars['Float']>;
  createdAt: Scalars['DateTime'];
  durationMs: Scalars['Int'];
  id: Scalars['ID'];
  mediaId: Scalars['ID'];
  platform: Scalars['String'];
  retrievedAt: Scalars['DateTime'];
  src?: Maybe<VimeoSrc>;
  thumbnail: Scalars['String'];
  title: Scalars['String'];
  userName: Scalars['String'];
  userProfileImageUrl?: Maybe<Scalars['String']>;
  userProgress?: Maybe<MediaProgress>;
  userUrl: Scalars['String'];
};

export type VimeoSrc = {
  __typename?: 'VimeoSrc';
  hls?: Maybe<Scalars['String']>;
  mp4?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
};

export type Voting = VotingInterface & {
  __typename?: 'Voting';
  allowEmptyBallots: Scalars['Boolean'];
  allowedMemberships?: Maybe<Array<VotingMembershipRequirement>>;
  allowedRoles?: Maybe<Array<Scalars['String']>>;
  beginDate: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  discussion?: Maybe<Discussion>;
  endDate: Scalars['DateTime'];
  groupSlug?: Maybe<Scalars['String']>;
  groupTurnout?: Maybe<VotingTurnout>;
  id: Scalars['ID'];
  liveResult: Scalars['Boolean'];
  name: Scalars['String'];
  options: Array<VotingOption>;
  requireAddress: Scalars['Boolean'];
  result?: Maybe<VotingResult>;
  slug: Scalars['String'];
  turnout: VotingTurnout;
  userHasSubmitted?: Maybe<Scalars['Boolean']>;
  userIsEligible?: Maybe<Scalars['Boolean']>;
  userSubmitDate?: Maybe<Scalars['DateTime']>;
};

export type VotingBallotInput = {
  optionId?: InputMaybe<Scalars['ID']>;
  votingId: Scalars['ID'];
};

export type VotingInput = {
  allowEmptyBallots?: InputMaybe<Scalars['Boolean']>;
  allowedMemberships?: InputMaybe<Array<VotingMembershipRequirementInput>>;
  allowedRoles?: InputMaybe<Array<Scalars['String']>>;
  beginDate: Scalars['DateTime'];
  description: Scalars['String'];
  endDate: Scalars['DateTime'];
  groupSlug?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  options: Array<VotingOptionInput>;
  slug: Scalars['String'];
};

export type VotingInterface = {
  allowEmptyBallots: Scalars['Boolean'];
  allowedMemberships?: Maybe<Array<VotingMembershipRequirement>>;
  allowedRoles?: Maybe<Array<Scalars['String']>>;
  beginDate: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  endDate: Scalars['DateTime'];
  id: Scalars['ID'];
  requireAddress: Scalars['Boolean'];
  slug: Scalars['String'];
  userHasSubmitted?: Maybe<Scalars['Boolean']>;
  userIsEligible?: Maybe<Scalars['Boolean']>;
  userSubmitDate?: Maybe<Scalars['DateTime']>;
};

export type VotingMembershipRequirement = {
  __typename?: 'VotingMembershipRequirement';
  createdBefore: Scalars['DateTime'];
  membershipTypeId: Scalars['ID'];
};

export type VotingMembershipRequirementInput = {
  createdBefore: Scalars['DateTime'];
  membershipTypeId: Scalars['ID'];
};

export type VotingOption = {
  __typename?: 'VotingOption';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  label: Scalars['String'];
  name: Scalars['String'];
};

export type VotingOptionInput = {
  description?: InputMaybe<Scalars['String']>;
  label?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type VotingOptionResult = {
  __typename?: 'VotingOptionResult';
  count: Scalars['Int'];
  option?: Maybe<VotingOption>;
  winner?: Maybe<Scalars['Boolean']>;
};

export type VotingResult = {
  __typename?: 'VotingResult';
  createdAt: Scalars['DateTime'];
  groupTurnout?: Maybe<VotingTurnout>;
  message?: Maybe<Scalars['String']>;
  options: Array<VotingOptionResult>;
  turnout: VotingTurnout;
  updatedAt: Scalars['DateTime'];
  video?: Maybe<Video>;
};

export type VotingTurnout = {
  __typename?: 'VotingTurnout';
  eligible: Scalars['Int'];
  submitted: Scalars['Int'];
};

export type WebNotification = {
  __typename?: 'WebNotification';
  body: Scalars['String'];
  icon: Scalars['String'];
  tag: Scalars['String'];
  title: Scalars['String'];
  url: Scalars['String'];
};

export type YoutubeEmbed = PlayableMedia & {
  __typename?: 'YoutubeEmbed';
  aspectRatio?: Maybe<Scalars['Float']>;
  createdAt: Scalars['DateTime'];
  durationMs: Scalars['Int'];
  id: Scalars['ID'];
  mediaId: Scalars['ID'];
  platform: Scalars['String'];
  retrievedAt: Scalars['DateTime'];
  thumbnail: Scalars['String'];
  title: Scalars['String'];
  userName: Scalars['String'];
  userProfileImageUrl?: Maybe<Scalars['String']>;
  userProgress?: Maybe<MediaProgress>;
  userUrl: Scalars['String'];
};

export type Mutations = {
  __typename?: 'mutations';
  acknowledgeCallToAction: CallToAction;
  activateMembership: Membership;
  /**
   * Add an item to `User.audioQueue`.
   * If `sequence` number is not provided, item will be appended.
   * An item might get a different `sequence` number assigned then provided.
   */
  addAudioQueueItem: Array<AudioQueueItem>;
  addDocumentToCollection: CollectionItem;
  addPaymentMethod: AddPaymentMethodResponse;
  addPaymentSource: Array<PaymentSource>;
  addRedirection: Redirection;
  addUserToRole: User;
  anonymizeUserAnswers: Questionnaire;
  appendPeriod: Membership;
  archive: RepoConnection;
  authorizeSession: Scalars['Boolean'];
  bookCalendarSlot: CalendarSlot;
  cancelCalendarSlot: CalendarSlot;
  cancelCandidacy: Election;
  cancelMembership: Membership;
  cancelPledge?: Maybe<Pledge>;
  /** Claim a granted membership with a voucher code */
  claimAccess: AccessGrant;
  claimCard: Card;
  claimMembership: Scalars['Boolean'];
  /** Clear all items in `User.audioQueue`. */
  clearAudioQueue: Array<AudioQueueItem>;
  clearCollection: Collection;
  clearProgress: Collection;
  clearSession: Scalars['Boolean'];
  clearSessions: Scalars['Boolean'];
  commit: Commit;
  createDiscussion: Scalars['ID'];
  createElection: Election;
  createVoting: Voting;
  deleteRedirection: Scalars['Boolean'];
  deleteUser?: Maybe<User>;
  denySession: Scalars['Boolean'];
  downvoteComment: Comment;
  editComment: Comment;
  editMemo: Memo;
  editRepoMeta: Repo;
  featureComment: Comment;
  finalizeElection: ElectionResult;
  finalizeQuestionnaire: Scalars['JSON'];
  finalizeVoting: VotingResult;
  generateDerivative: Derivative;
  generateMembership: Membership;
  /** Grant a membership */
  grantAccess: AccessGrant;
  hidePostfinancePayment: PostfinancePayment;
  importPostfinanceCSV: Scalars['String'];
  initTOTPSharedSecret: SharedSecretResponse;
  /** Invalidate access grant */
  invalidateAccess: Scalars['Boolean'];
  manuallyMatchPostfinancePayment: PostfinancePayment;
  markAllNotificationsAsRead: Array<Notification>;
  markNotificationAsRead: Notification;
  mergeUsers: User;
  /**
   * Move an existing item within `User.audioQueue`.
   * Unless `sequence` number exceeds maximum `sequence` number, an item will put onto `sequence` number.
   */
  moveAudioQueueItem: Array<AudioQueueItem>;
  moveMembership: Membership;
  movePledge: Pledge;
  payPledge: PledgeResponse;
  placeMilestone: Milestone;
  preferredFirstFactor: User;
  publish: PublishResponse;
  publishCredential?: Maybe<Credential>;
  publishMemo: Memo;
  reactivateMembership: Membership;
  reclaimPledge: Scalars['Boolean'];
  refreshQuestionnaireResult?: Maybe<Questionnaire>;
  rematchPayments: Scalars['String'];
  /** Move an existing item from `User.audioQueue`. */
  removeAudioQueueItem: Array<AudioQueueItem>;
  removeCredentialVerification?: Maybe<Credential>;
  removeDevice: Scalars['Boolean'];
  removeDocumentFromCollection?: Maybe<CollectionItem>;
  removeDocumentProgress?: Maybe<DocumentProgress>;
  removeMediaProgress?: Maybe<MediaProgress>;
  removeMilestone: Scalars['Boolean'];
  removeUserFromRole: User;
  /**
   * Reorder existing items at once.
   * A non-existant item ID will be ignored.
   * If an item exists in queue but its ID is not submitted, it will be deleted.
   */
  reorderAudioQueue: Array<AudioQueueItem>;
  /** Destroy repo file */
  repoFileDestroy: RepoFile;
  /** Make repo file public */
  repoFileMakePublic: RepoFile;
  /** Abort an upload, flags file as failed */
  repoFileUploadAbort: RepoFile;
  /** Begin an upload, returns an upload URL to PUT file to */
  repoFileUploadBegin: RepoFile;
  /** Commit an upload to file */
  repoFileUploadCommit: RepoFile;
  reportComment: Comment;
  reportUser: Scalars['Boolean'];
  /** Request access for one-self */
  requestAccess: AccessGrant;
  requestNewsletterSubscription: Scalars['Boolean'];
  resetAnswer: QuestionInterface;
  resetMembership: Membership;
  resetQuestionnaire: Questionnaire;
  resolvePledgeToPayment: Pledge;
  resubscribeEmail: NewsletterSettings;
  /** Revoke a granted membership */
  revokeAccess: Scalars['Boolean'];
  revokeConsent: User;
  revokeQuestionnaire: Questionnaire;
  rollAccessKey: User;
  /** @deprecated not used in app anymore. Will be evicted if no API calls are tracked anymore. */
  rollDeviceToken: Device;
  sendPaymentReminders: Scalars['String'];
  sendPhoneNumberVerificationCode: Scalars['Boolean'];
  sendTestNotification: Scalars['Boolean'];
  sendTestPushNotification: Scalars['Boolean'];
  setDefaultPaymentMethod: Array<PaymentSource>;
  setDiscussionPreferences: Discussion;
  setMembershipAutoPay: Membership;
  signIn: SignInResponse;
  signOut: Scalars['Boolean'];
  startChallenge: Scalars['Boolean'];
  submitAnswer: QuestionInterface;
  submitAnswerUnattributed: QuestionInterface;
  submitCandidacy: Candidacy;
  submitComment: Comment;
  submitConsent: User;
  submitElectionBallot: Election;
  submitPledge: PledgeResponse;
  submitQuestionnaire: Questionnaire;
  submitVotingBallot: Voting;
  subscribe: Subscription;
  suspendUser: User;
  syncPaymentIntent: SyncPledgeResponse;
  uncommittedChanges: Scalars['Boolean'];
  unpublish: Scalars['Boolean'];
  unpublishComment: Comment;
  unpublishMemo: Memo;
  unsubscribe: Subscription;
  unsuspendUser: User;
  unvoteComment: Comment;
  updateAddress: Address;
  updateAdminNotes: User;
  updateCard: Card;
  updateDiscussion: Discussion;
  updateEmail: User;
  updateMe: User;
  updateMembershipCancellation: Cancellation;
  updateNewsletterSubscription: NewsletterSubscription;
  updateNotificationSettings: User;
  updatePayment: PledgePayment;
  updatePostfinancePayment: PostfinancePayment;
  updateRedirection: Redirection;
  updateTwoFactorAuthentication: Scalars['Boolean'];
  updateUser: User;
  upsertDevice: Device;
  upsertDocumentProgress: DocumentProgress;
  upsertMediaProgress: MediaProgress;
  upvoteComment: Comment;
  validateTOTPSharedSecret: Scalars['Boolean'];
  verifyCredential?: Maybe<Credential>;
  verifyPhoneNumber: Scalars['Boolean'];
};


export type MutationsAcknowledgeCallToActionArgs = {
  id: Scalars['ID'];
  response?: InputMaybe<Scalars['JSON']>;
};


export type MutationsActivateMembershipArgs = {
  id: Scalars['ID'];
};


export type MutationsAddAudioQueueItemArgs = {
  entity: AudioQueueEntityInput;
  sequence?: InputMaybe<Scalars['Int']>;
};


export type MutationsAddDocumentToCollectionArgs = {
  collectionName: Scalars['String'];
  documentId: Scalars['ID'];
};


export type MutationsAddPaymentMethodArgs = {
  companyId: Scalars['ID'];
  stripePlatformPaymentMethodId: Scalars['ID'];
};


export type MutationsAddPaymentSourceArgs = {
  pspPayload: Scalars['JSON'];
  sourceId: Scalars['String'];
};


export type MutationsAddRedirectionArgs = {
  resource?: InputMaybe<Scalars['JSON']>;
  source: Scalars['String'];
  status?: InputMaybe<Scalars['Int']>;
  target: Scalars['String'];
};


export type MutationsAddUserToRoleArgs = {
  role: Scalars['String'];
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsAnonymizeUserAnswersArgs = {
  questionnaireId: Scalars['ID'];
};


export type MutationsAppendPeriodArgs = {
  duration: Scalars['Int'];
  durationUnit: MembershipTypeInterval;
  id: Scalars['ID'];
};


export type MutationsArchiveArgs = {
  repoIds: Array<Scalars['ID']>;
  unpublish?: InputMaybe<Scalars['Boolean']>;
};


export type MutationsAuthorizeSessionArgs = {
  consents?: InputMaybe<Array<Scalars['String']>>;
  email: Scalars['String'];
  requiredFields?: InputMaybe<RequiredUserFields>;
  tokens: Array<SignInToken>;
};


export type MutationsBookCalendarSlotArgs = {
  id: Scalars['ID'];
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsCancelCalendarSlotArgs = {
  id: Scalars['ID'];
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsCancelCandidacyArgs = {
  slug: Scalars['String'];
};


export type MutationsCancelMembershipArgs = {
  details: CancellationInput;
  id: Scalars['ID'];
  immediately?: InputMaybe<Scalars['Boolean']>;
};


export type MutationsCancelPledgeArgs = {
  pledgeId: Scalars['ID'];
};


export type MutationsClaimAccessArgs = {
  payload?: InputMaybe<Scalars['JSON']>;
  voucherCode: Scalars['String'];
};


export type MutationsClaimCardArgs = {
  accessToken: Scalars['ID'];
  id: Scalars['ID'];
  payload?: InputMaybe<Scalars['JSON']>;
  portrait?: InputMaybe<Scalars['String']>;
  statement: Scalars['String'];
};


export type MutationsClaimMembershipArgs = {
  voucherCode: Scalars['String'];
};


export type MutationsClearCollectionArgs = {
  collectionName: Scalars['String'];
};


export type MutationsClearSessionArgs = {
  sessionId: Scalars['ID'];
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsClearSessionsArgs = {
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsCommitArgs = {
  document: DocumentInput;
  isTemplate?: InputMaybe<Scalars['Boolean']>;
  message: Scalars['String'];
  parentId?: InputMaybe<Scalars['ID']>;
  repoId: Scalars['ID'];
};


export type MutationsCreateDiscussionArgs = {
  anonymity: Permission;
  maxLength?: InputMaybe<Scalars['Int']>;
  minInterval?: InputMaybe<Scalars['Int']>;
  tagRequired: Scalars['Boolean'];
  tags?: InputMaybe<Array<Scalars['String']>>;
  title?: InputMaybe<Scalars['String']>;
};


export type MutationsCreateElectionArgs = {
  electionInput: ElectionInput;
};


export type MutationsCreateVotingArgs = {
  votingInput: VotingInput;
};


export type MutationsDeleteRedirectionArgs = {
  id: Scalars['ID'];
};


export type MutationsDeleteUserArgs = {
  unpublishComments?: InputMaybe<Scalars['Boolean']>;
  userId: Scalars['ID'];
};


export type MutationsDenySessionArgs = {
  email: Scalars['String'];
  token: SignInToken;
};


export type MutationsDownvoteCommentArgs = {
  id: Scalars['ID'];
};


export type MutationsEditCommentArgs = {
  content: Scalars['String'];
  id: Scalars['ID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};


export type MutationsEditMemoArgs = {
  id?: InputMaybe<Scalars['ID']>;
  text: Scalars['String'];
};


export type MutationsEditRepoMetaArgs = {
  briefingUrl?: InputMaybe<Scalars['String']>;
  creationDeadline?: InputMaybe<Scalars['DateTime']>;
  productionDeadline?: InputMaybe<Scalars['DateTime']>;
  publishDate?: InputMaybe<Scalars['DateTime']>;
  repoId: Scalars['ID'];
};


export type MutationsFeatureCommentArgs = {
  content?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  targets?: InputMaybe<Array<CommentFeaturedTarget>>;
};


export type MutationsFinalizeElectionArgs = {
  candidacyIds?: InputMaybe<Array<Scalars['ID']>>;
  dry: Scalars['Boolean'];
  message?: InputMaybe<Scalars['String']>;
  slug: Scalars['String'];
  video?: InputMaybe<VideoInput>;
};


export type MutationsFinalizeQuestionnaireArgs = {
  dry: Scalars['Boolean'];
  slug: Scalars['String'];
};


export type MutationsFinalizeVotingArgs = {
  dry: Scalars['Boolean'];
  message?: InputMaybe<Scalars['String']>;
  slug: Scalars['String'];
  video?: InputMaybe<VideoInput>;
  winner?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateDerivativeArgs = {
  commitId: Scalars['ID'];
};


export type MutationsGenerateMembershipArgs = {
  userId: Scalars['ID'];
};


export type MutationsGrantAccessArgs = {
  campaignId: Scalars['ID'];
  email?: InputMaybe<Scalars['String']>;
  message?: InputMaybe<Scalars['String']>;
};


export type MutationsHidePostfinancePaymentArgs = {
  id: Scalars['ID'];
};


export type MutationsImportPostfinanceCsvArgs = {
  csv: Scalars['String'];
};


export type MutationsInvalidateAccessArgs = {
  id: Scalars['ID'];
};


export type MutationsManuallyMatchPostfinancePaymentArgs = {
  id: Scalars['ID'];
};


export type MutationsMarkNotificationAsReadArgs = {
  id: Scalars['ID'];
};


export type MutationsMergeUsersArgs = {
  sourceUserId: Scalars['ID'];
  targetUserId: Scalars['ID'];
};


export type MutationsMoveAudioQueueItemArgs = {
  id: Scalars['ID'];
  sequence: Scalars['Int'];
};


export type MutationsMoveMembershipArgs = {
  membershipId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type MutationsMovePledgeArgs = {
  pledgeId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type MutationsPayPledgeArgs = {
  pledgePayment?: InputMaybe<PledgePaymentInput>;
};


export type MutationsPlaceMilestoneArgs = {
  commitId: Scalars['ID'];
  message: Scalars['String'];
  name: Scalars['String'];
  repoId: Scalars['ID'];
};


export type MutationsPreferredFirstFactorArgs = {
  tokenType?: InputMaybe<SignInTokenType>;
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsPublishArgs = {
  commitId: Scalars['ID'];
  repoId: Scalars['ID'];
  settings: PublishSettings;
};


export type MutationsPublishCredentialArgs = {
  description?: InputMaybe<Scalars['String']>;
};


export type MutationsPublishMemoArgs = {
  commitId?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
  parentId?: InputMaybe<Scalars['ID']>;
  repoId: Scalars['ID'];
  text: Scalars['String'];
};


export type MutationsReactivateMembershipArgs = {
  id: Scalars['ID'];
};


export type MutationsReclaimPledgeArgs = {
  pledgeId: Scalars['ID'];
};


export type MutationsRefreshQuestionnaireResultArgs = {
  slug: Scalars['String'];
};


export type MutationsRemoveAudioQueueItemArgs = {
  id: Scalars['ID'];
};


export type MutationsRemoveCredentialVerificationArgs = {
  id: Scalars['ID'];
};


export type MutationsRemoveDeviceArgs = {
  id: Scalars['ID'];
};


export type MutationsRemoveDocumentFromCollectionArgs = {
  collectionName: Scalars['String'];
  documentId: Scalars['ID'];
};


export type MutationsRemoveDocumentProgressArgs = {
  documentId: Scalars['ID'];
};


export type MutationsRemoveMediaProgressArgs = {
  mediaId: Scalars['ID'];
};


export type MutationsRemoveMilestoneArgs = {
  name: Scalars['String'];
  repoId: Scalars['ID'];
};


export type MutationsRemoveUserFromRoleArgs = {
  role: Scalars['String'];
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsReorderAudioQueueArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationsRepoFileDestroyArgs = {
  id: Scalars['ID'];
};


export type MutationsRepoFileMakePublicArgs = {
  id: Scalars['ID'];
};


export type MutationsRepoFileUploadAbortArgs = {
  error: Scalars['String'];
  id: Scalars['ID'];
};


export type MutationsRepoFileUploadBeginArgs = {
  name: Scalars['String'];
  repoId: Scalars['ID'];
};


export type MutationsRepoFileUploadCommitArgs = {
  id: Scalars['ID'];
};


export type MutationsReportCommentArgs = {
  id: Scalars['ID'];
};


export type MutationsReportUserArgs = {
  reason: Scalars['String'];
  userId: Scalars['ID'];
};


export type MutationsRequestAccessArgs = {
  campaignId: Scalars['ID'];
  payload?: InputMaybe<Scalars['JSON']>;
};


export type MutationsRequestNewsletterSubscriptionArgs = {
  context: Scalars['String'];
  email: Scalars['String'];
  name: NewsletterName;
};


export type MutationsResetAnswerArgs = {
  id: Scalars['ID'];
};


export type MutationsResetMembershipArgs = {
  id: Scalars['ID'];
};


export type MutationsResetQuestionnaireArgs = {
  id: Scalars['ID'];
};


export type MutationsResolvePledgeToPaymentArgs = {
  pledgeId: Scalars['ID'];
  reason: Scalars['String'];
};


export type MutationsResubscribeEmailArgs = {
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsRevokeAccessArgs = {
  id: Scalars['ID'];
};


export type MutationsRevokeConsentArgs = {
  name: Scalars['String'];
};


export type MutationsRevokeQuestionnaireArgs = {
  id: Scalars['ID'];
};


export type MutationsRollAccessKeyArgs = {
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsRollDeviceTokenArgs = {
  newToken: Scalars['String'];
  oldToken?: InputMaybe<Scalars['String']>;
};


export type MutationsSendPaymentRemindersArgs = {
  dryRun: Scalars['Boolean'];
};


export type MutationsSendTestNotificationArgs = {
  commentId?: InputMaybe<Scalars['ID']>;
  repoId?: InputMaybe<Scalars['ID']>;
  simulateAllPossibleSubscriptions?: InputMaybe<Scalars['Boolean']>;
};


export type MutationsSendTestPushNotificationArgs = {
  body?: InputMaybe<Scalars['String']>;
  tag?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};


export type MutationsSetDefaultPaymentMethodArgs = {
  stripePlatformPaymentMethodId: Scalars['ID'];
};


export type MutationsSetDiscussionPreferencesArgs = {
  discussionPreferences: DiscussionPreferencesInput;
  id: Scalars['ID'];
};


export type MutationsSetMembershipAutoPayArgs = {
  autoPay: Scalars['Boolean'];
  id: Scalars['ID'];
};


export type MutationsSignInArgs = {
  accessToken?: InputMaybe<Scalars['ID']>;
  consents?: InputMaybe<Array<Scalars['String']>>;
  context?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  tokenType?: InputMaybe<SignInTokenType>;
};


export type MutationsStartChallengeArgs = {
  sessionId: Scalars['ID'];
  type: SignInTokenType;
};


export type MutationsSubmitAnswerArgs = {
  answer: AnswerInput;
};


export type MutationsSubmitAnswerUnattributedArgs = {
  answer: AnswerInput;
  pseudonym: Scalars['ID'];
};


export type MutationsSubmitCandidacyArgs = {
  credential: Scalars['String'];
  slug: Scalars['String'];
};


export type MutationsSubmitCommentArgs = {
  content: Scalars['String'];
  discussionId: Scalars['ID'];
  discussionPreferences?: InputMaybe<DiscussionPreferencesInput>;
  id?: InputMaybe<Scalars['ID']>;
  parentId?: InputMaybe<Scalars['ID']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
};


export type MutationsSubmitConsentArgs = {
  name: Scalars['String'];
};


export type MutationsSubmitElectionBallotArgs = {
  candidacyIds: Array<Scalars['ID']>;
  electionId: Scalars['ID'];
};


export type MutationsSubmitPledgeArgs = {
  consents?: InputMaybe<Array<Scalars['String']>>;
  pledge?: InputMaybe<PledgeInput>;
};


export type MutationsSubmitQuestionnaireArgs = {
  id: Scalars['ID'];
};


export type MutationsSubmitVotingBallotArgs = {
  optionId?: InputMaybe<Scalars['ID']>;
  votingId: Scalars['ID'];
};


export type MutationsSubscribeArgs = {
  filters?: InputMaybe<Array<EventObjectType>>;
  objectId: Scalars['ID'];
  type: SubscriptionObjectType;
};


export type MutationsSuspendUserArgs = {
  id: Scalars['ID'];
  interval?: InputMaybe<Scalars['String']>;
  intervalAmount?: InputMaybe<Scalars['Int']>;
  reason?: InputMaybe<Scalars['String']>;
};


export type MutationsSyncPaymentIntentArgs = {
  companyId: Scalars['ID'];
  stripePaymentIntentId: Scalars['ID'];
};


export type MutationsUncommittedChangesArgs = {
  action: Action;
  repoId: Scalars['ID'];
};


export type MutationsUnpublishArgs = {
  repoId: Scalars['ID'];
};


export type MutationsUnpublishCommentArgs = {
  id: Scalars['ID'];
};


export type MutationsUnpublishMemoArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationsUnsubscribeArgs = {
  filters?: InputMaybe<Array<EventObjectType>>;
  subscriptionId: Scalars['ID'];
};


export type MutationsUnsuspendUserArgs = {
  id: Scalars['ID'];
};


export type MutationsUnvoteCommentArgs = {
  id: Scalars['ID'];
};


export type MutationsUpdateAddressArgs = {
  address: AddressInput;
  id: Scalars['ID'];
};


export type MutationsUpdateAdminNotesArgs = {
  notes?: InputMaybe<Scalars['String']>;
  userId: Scalars['ID'];
};


export type MutationsUpdateCardArgs = {
  id: Scalars['ID'];
  payload?: InputMaybe<Scalars['JSON']>;
  portrait?: InputMaybe<Scalars['String']>;
  statement: Scalars['String'];
};


export type MutationsUpdateDiscussionArgs = {
  closed?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['ID'];
};


export type MutationsUpdateEmailArgs = {
  email: Scalars['String'];
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsUpdateMeArgs = {
  address?: InputMaybe<AddressInput>;
  ageAccessRole?: InputMaybe<AccessRole>;
  biography?: InputMaybe<Scalars['String']>;
  birthday?: InputMaybe<Scalars['Date']>;
  disclosures?: InputMaybe<Scalars['String']>;
  emailAccessRole?: InputMaybe<AccessRole>;
  facebookId?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Scalars['String']>;
  hasPublicProfile?: InputMaybe<Scalars['Boolean']>;
  isListed?: InputMaybe<Scalars['Boolean']>;
  lastName?: InputMaybe<Scalars['String']>;
  pgpPublicKey?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  phoneNumberAccessRole?: InputMaybe<AccessRole>;
  phoneNumberNote?: InputMaybe<Scalars['String']>;
  portrait?: InputMaybe<Scalars['String']>;
  prolitterisId?: InputMaybe<Scalars['String']>;
  publicUrl?: InputMaybe<Scalars['String']>;
  statement?: InputMaybe<Scalars['String']>;
  twitterHandle?: InputMaybe<Scalars['String']>;
  username?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateMembershipCancellationArgs = {
  details: CancellationInput;
  id: Scalars['ID'];
};


export type MutationsUpdateNewsletterSubscriptionArgs = {
  consents?: InputMaybe<Array<Scalars['String']>>;
  email?: InputMaybe<Scalars['String']>;
  mac?: InputMaybe<Scalars['String']>;
  name: NewsletterName;
  subscribed: Scalars['Boolean'];
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationsUpdateNotificationSettingsArgs = {
  defaultDiscussionNotificationOption?: InputMaybe<DiscussionNotificationOption>;
  discussionNotificationChannels?: InputMaybe<Array<DiscussionNotificationChannel>>;
};


export type MutationsUpdatePaymentArgs = {
  paymentId: Scalars['ID'];
  reason?: InputMaybe<Scalars['String']>;
  status: PaymentStatus;
};


export type MutationsUpdatePostfinancePaymentArgs = {
  mitteilung: Scalars['String'];
  pfpId: Scalars['ID'];
};


export type MutationsUpdateRedirectionArgs = {
  id: Scalars['ID'];
  resource?: InputMaybe<Scalars['JSON']>;
  source?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<Scalars['Int']>;
  target?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateTwoFactorAuthenticationArgs = {
  enabled: Scalars['Boolean'];
  type: SignInTokenType;
};


export type MutationsUpdateUserArgs = {
  address?: InputMaybe<AddressInput>;
  birthday?: InputMaybe<Scalars['Date']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  userId: Scalars['ID'];
};


export type MutationsUpsertDeviceArgs = {
  information: DeviceInformationInput;
  token: Scalars['ID'];
};


export type MutationsUpsertDocumentProgressArgs = {
  documentId: Scalars['ID'];
  nodeId: Scalars['String'];
  percentage: Scalars['Float'];
};


export type MutationsUpsertMediaProgressArgs = {
  mediaId: Scalars['ID'];
  secs: Scalars['Float'];
};


export type MutationsUpvoteCommentArgs = {
  id: Scalars['ID'];
};


export type MutationsValidateTotpSharedSecretArgs = {
  totp?: InputMaybe<Scalars['String']>;
};


export type MutationsVerifyCredentialArgs = {
  id: Scalars['ID'];
};


export type MutationsVerifyPhoneNumberArgs = {
  verificationCode: Scalars['String'];
};

export type Queries = {
  __typename?: 'queries';
  accessGrantInfo?: Maybe<AccessGrantInfo>;
  accessGrantStats: AccessGrantStats;
  activeDiscussions: Array<CommentAggregation>;
  adminUsers: Users;
  cancellationCategories: Array<CancellationCategory>;
  card?: Maybe<Card>;
  cardGroup?: Maybe<CardGroup>;
  cardGroups: CardGroupConnection;
  cards: CardConnection;
  checkUsername?: Maybe<Scalars['Boolean']>;
  collectionsStats: CollectionsStats;
  comment: Comment;
  commentPreview: Comment;
  comments: CommentConnection;
  crowdfunding: Crowdfunding;
  crowdfundings?: Maybe<Array<Maybe<Crowdfunding>>>;
  discussion?: Maybe<Discussion>;
  discussions: Array<Discussion>;
  discussionsStats: DiscussionsStats;
  document?: Maybe<Document>;
  documents: DocumentConnection;
  draftPledge: Pledge;
  echo: RequestInfo;
  election?: Maybe<Election>;
  elections: Array<Election>;
  embed: Embed;
  employees: Array<Employee>;
  events: Array<Event>;
  faqs: Array<Faq>;
  greeting?: Maybe<Greeting>;
  mailbox?: Maybe<MailboxConnection>;
  me?: Maybe<User>;
  mediaProgress?: Maybe<MediaProgress>;
  mediaResponses: Array<MediaResponse>;
  memberStats: MemberStats;
  membershipPotStats: MembershipPotStats;
  membershipStats: MembershipStats;
  nextStatement: StatementUser;
  notifications?: Maybe<NotificationConnection>;
  payments: PledgePayments;
  paymentsCSV: Scalars['String'];
  pendingAppSignIn?: Maybe<SignInNotification>;
  pledge?: Maybe<Pledge>;
  pledges: Array<Pledge>;
  postfinancePayments: PostfinancePayments;
  questionnaire?: Maybe<Questionnaire>;
  questionnaires: Array<Questionnaire>;
  redirection?: Maybe<Redirection>;
  redirections: RedirectionConnection;
  repo: Repo;
  /**
   * This query is a cached version of repos query. It uses cached information
   * about repositories.
   */
  reposSearch: RepoConnection;
  revenueStats: RevenueStats;
  roleStats: RoleStats;
  search: SearchConnection;
  statements: StatementUserConnection;
  unauthorizedSession?: Maybe<UnauthorizedSession>;
  updates: Array<Update>;
  user?: Maybe<User>;
  users: Array<Maybe<User>>;
  voting?: Maybe<Voting>;
  votings: Array<Voting>;
};


export type QueriesAccessGrantInfoArgs = {
  id: Scalars['ID'];
};


export type QueriesActiveDiscussionsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  lastDays: Scalars['Int'];
};


export type QueriesAdminUsersArgs = {
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
};


export type QueriesCancellationCategoriesArgs = {
  showMore?: InputMaybe<Scalars['Boolean']>;
};


export type QueriesCardArgs = {
  accessToken?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueriesCardGroupArgs = {
  id?: InputMaybe<Scalars['ID']>;
  slug?: InputMaybe<Scalars['String']>;
};


export type QueriesCardGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueriesCardsArgs = {
  accessToken?: InputMaybe<Scalars['ID']>;
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<CardFiltersInput>;
  first?: InputMaybe<Scalars['Int']>;
  focus?: InputMaybe<Array<Scalars['ID']>>;
  id?: InputMaybe<Scalars['ID']>;
  last?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<CardSortInput>;
};


export type QueriesCheckUsernameArgs = {
  username?: InputMaybe<Scalars['String']>;
};


export type QueriesCommentArgs = {
  id: Scalars['ID'];
};


export type QueriesCommentPreviewArgs = {
  content: Scalars['String'];
  discussionId: Scalars['ID'];
  id?: InputMaybe<Scalars['ID']>;
  parentId?: InputMaybe<Scalars['ID']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
};


export type QueriesCommentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  discussionId?: InputMaybe<Scalars['ID']>;
  discussionIds?: InputMaybe<Array<Scalars['ID']>>;
  featured?: InputMaybe<Scalars['Boolean']>;
  featuredTarget?: InputMaybe<CommentFeaturedTarget>;
  first?: InputMaybe<Scalars['Int']>;
  focusId?: InputMaybe<Scalars['ID']>;
  lastId?: InputMaybe<Scalars['ID']>;
  orderBy?: InputMaybe<DiscussionOrder>;
  orderDirection?: InputMaybe<OrderDirection>;
  toDepth?: InputMaybe<Scalars['Int']>;
};


export type QueriesCrowdfundingArgs = {
  name: Scalars['String'];
};


export type QueriesDiscussionArgs = {
  id: Scalars['ID'];
};


export type QueriesDocumentArgs = {
  apiKey?: InputMaybe<Scalars['String']>;
  path: Scalars['String'];
};


export type QueriesDocumentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  apiKey?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  dossier?: InputMaybe<Scalars['String']>;
  feed?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  format?: InputMaybe<Scalars['String']>;
  formats?: InputMaybe<Array<Scalars['String']>>;
  hasDossier?: InputMaybe<Scalars['Boolean']>;
  hasFormat?: InputMaybe<Scalars['Boolean']>;
  hasSection?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  repoIds?: InputMaybe<Array<Scalars['ID']>>;
  section?: InputMaybe<Scalars['String']>;
  template?: InputMaybe<Scalars['String']>;
};


export type QueriesDraftPledgeArgs = {
  id: Scalars['ID'];
};


export type QueriesElectionArgs = {
  slug: Scalars['String'];
};


export type QueriesEmbedArgs = {
  embedType: EmbedType;
  id: Scalars['ID'];
};


export type QueriesEmployeesArgs = {
  onlyPromotedAuthors?: InputMaybe<Scalars['Boolean']>;
  shuffle?: InputMaybe<Scalars['Int']>;
  withBoosted?: InputMaybe<Scalars['Boolean']>;
  withGreeting?: InputMaybe<Scalars['Boolean']>;
  withPitch?: InputMaybe<Scalars['Boolean']>;
};


export type QueriesMailboxArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<MailboxFiltersInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueriesMeArgs = {
  accessToken?: InputMaybe<Scalars['ID']>;
};


export type QueriesMediaProgressArgs = {
  mediaId: Scalars['ID'];
};


export type QueriesNextStatementArgs = {
  orderDirection: OrderDirection;
  sequenceNumber: Scalars['Int'];
};


export type QueriesNotificationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<EventObjectType>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  lastDays?: InputMaybe<Scalars['Int']>;
  onlyUnread?: InputMaybe<Scalars['Boolean']>;
};


export type QueriesPaymentsArgs = {
  booleanFilter?: InputMaybe<BooleanFilter>;
  dateRangeFilter?: InputMaybe<DateRangeFilter>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrderBy>;
  search?: InputMaybe<Scalars['String']>;
  stringArrayFilter?: InputMaybe<StringArrayFilter>;
};


export type QueriesPaymentsCsvArgs = {
  companyName: Scalars['String'];
  paymentIds?: InputMaybe<Array<Scalars['ID']>>;
};


export type QueriesPledgeArgs = {
  id: Scalars['ID'];
};


export type QueriesPostfinancePaymentsArgs = {
  booleanFilter?: InputMaybe<BooleanFilter>;
  dateRangeFilter?: InputMaybe<DateRangeFilter>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrderBy>;
  search?: InputMaybe<Scalars['String']>;
  stringArrayFilter?: InputMaybe<StringArrayFilter>;
};


export type QueriesQuestionnaireArgs = {
  slug: Scalars['String'];
};


export type QueriesRedirectionArgs = {
  externalBaseUrl?: InputMaybe<Scalars['String']>;
  path: Scalars['String'];
};


export type QueriesRedirectionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  externalBaseUrl?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueriesRepoArgs = {
  id: Scalars['ID'];
};


export type QueriesReposSearchArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  isSeriesEpisode?: InputMaybe<Scalars['Boolean']>;
  isSeriesMaster?: InputMaybe<Scalars['Boolean']>;
  isTemplate?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RepoOrderBy>;
  phases?: InputMaybe<Array<RepoPhaseKey>>;
  publishDateRange?: InputMaybe<RepoPublishDateRange>;
  search?: InputMaybe<Scalars['String']>;
  template?: InputMaybe<Scalars['String']>;
};


export type QueriesRoleStatsArgs = {
  role: Scalars['String'];
};


export type QueriesSearchArgs = {
  after?: InputMaybe<Scalars['String']>;
  apiKey?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<SearchFilterInput>;
  filters?: InputMaybe<Array<SearchGenericFilterInput>>;
  first?: InputMaybe<Scalars['Int']>;
  processor?: InputMaybe<SearchProcessor>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<SearchSortInput>;
  trackingId?: InputMaybe<Scalars['ID']>;
};


export type QueriesStatementsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  focus?: InputMaybe<Scalars['String']>;
  membershipAfter?: InputMaybe<Scalars['DateTime']>;
  search?: InputMaybe<Scalars['String']>;
  seed?: InputMaybe<Scalars['Float']>;
};


export type QueriesUnauthorizedSessionArgs = {
  email: Scalars['String'];
  token: SignInToken;
};


export type QueriesUserArgs = {
  accessToken?: InputMaybe<Scalars['ID']>;
  slug?: InputMaybe<Scalars['String']>;
};


export type QueriesUsersArgs = {
  hasPublicProfile?: InputMaybe<Scalars['Boolean']>;
  isListed?: InputMaybe<Scalars['Boolean']>;
  role?: InputMaybe<Scalars['String']>;
  search: Scalars['String'];
};


export type QueriesVotingArgs = {
  slug: Scalars['String'];
};

export type Subscriptions = {
  __typename?: 'subscriptions';
  comment: CommentUpdate;
  greeting: Greeting;
  notification: Notification;
  repoChange: RepoChange;
  /** @deprecated use `repoChange` subscrption instead */
  repoUpdate: Repo;
  uncommittedChanges: UncommittedChangeUpdate;
  webNotification: WebNotification;
};


export type SubscriptionsCommentArgs = {
  discussionId: Scalars['ID'];
};


export type SubscriptionsRepoChangeArgs = {
  repoId: Scalars['ID'];
};


export type SubscriptionsRepoUpdateArgs = {
  repoId?: InputMaybe<Scalars['ID']>;
};


export type SubscriptionsUncommittedChangesArgs = {
  repoId: Scalars['ID'];
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'queries', me?: { __typename?: 'User', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, roles: Array<string> } | null };


export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;