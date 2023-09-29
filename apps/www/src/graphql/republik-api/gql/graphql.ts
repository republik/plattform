/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date (format %d.%m.%Y) */
  Date: { input: string; output: string; }
  /** DateTime (format ISO-8601) */
  DateTime: { input: string; output: string; }
  JSON: { input: any; output: any; }
  /** String or number (input is casted to string) */
  StringOrNumber: { input: any; output: any; }
  /** YearMonthDate (format YYYY-MM) */
  YearMonthDate: { input: any; output: any; }
};

/** Entity describing ability and terms of granting a membership */
export type AccessCampaign = {
  __typename?: 'AccessCampaign';
  /** Begin of campaign */
  beginAt: Scalars['DateTime']['output'];
  defaultMessage?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** End of campaign */
  endAt: Scalars['DateTime']['output'];
  grants: Array<AccessGrant>;
  id: Scalars['ID']['output'];
  perks: AccessCampaignPerks;
  slots: AccessCampaignSlots;
  title: Scalars['String']['output'];
};


/** Entity describing ability and terms of granting a membership */
export type AccessCampaignGrantsArgs = {
  withInvalidated?: InputMaybe<Scalars['Boolean']['input']>;
  withRevoked?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Entity describing available perks */
export type AccessCampaignPerks = {
  __typename?: 'AccessCampaignPerks';
  giftableMemberships?: Maybe<Scalars['Int']['output']>;
};

/** Entity describing state of slots: total, used and free */
export type AccessCampaignSlots = {
  __typename?: 'AccessCampaignSlots';
  free: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  used: Scalars['Int']['output'];
};

/** Entity describing an event that occured, linked to an AccessGrant */
export type AccessEvent = {
  __typename?: 'AccessEvent';
  createdAt: Scalars['DateTime']['output'];
  event: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

/** Entity representing a future, current or passed granted membership */
export type AccessGrant = {
  __typename?: 'AccessGrant';
  /** Beginning of sharing period */
  beginAt?: Maybe<Scalars['DateTime']['output']>;
  /** Sharing period must begin before */
  beginBefore: Scalars['DateTime']['output'];
  /** Campaign this membership grant belongs to */
  campaign: AccessCampaign;
  createdAt: Scalars['DateTime']['output'];
  /** Original recipient email address of grant. */
  email?: Maybe<Scalars['String']['output']>;
  /** Ending of sharing period */
  endAt?: Maybe<Scalars['DateTime']['output']>;
  /** Events (Admin only) */
  events?: Maybe<Array<Maybe<AccessEvent>>>;
  followupAt?: Maybe<Scalars['DateTime']['output']>;
  /** Entity who granted membership (Admin only) */
  granter?: Maybe<User>;
  /** Name or email address of entity who granted membership */
  granterName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Date when grant was rendered invalid */
  invalidatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Entity who received granted membership (Admin only) */
  recipient?: Maybe<User>;
  /** Name or email address of entity who received granted access */
  recipientName?: Maybe<Scalars['String']['output']>;
  /** Date when grant was revoked */
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Status (Admin only) */
  status?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  /** Voucher code claim this grant */
  voucherCode?: Maybe<Scalars['String']['output']>;
};

export type AccessGrantInfo = {
  __typename?: 'AccessGrantInfo';
  granter: User;
  granterName: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
};

export type AccessGrantStats = {
  __typename?: 'AccessGrantStats';
  /** Returns events on access grants in daily buckets */
  events: AccessGrantStatsEvents;
  /** Returns access grant states per in daily buckets. */
  evolution: AccessGrantStatsEvolution;
};


export type AccessGrantStatsEventsArgs = {
  accessCampaignId: Scalars['ID']['input'];
  max: Scalars['Date']['input'];
  min: Scalars['Date']['input'];
};


export type AccessGrantStatsEvolutionArgs = {
  accessCampaignId: Scalars['ID']['input'];
  max: Scalars['Date']['input'];
  min: Scalars['Date']['input'];
};

export type AccessGrantStatsEvents = {
  __typename?: 'AccessGrantStatsEvents';
  buckets?: Maybe<Array<AccessGrantStatsEventsBucket>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AccessGrantStatsEventsBucket = {
  __typename?: 'AccessGrantStatsEventsBucket';
  claims: Scalars['Int']['output'];
  date: Scalars['Date']['output'];
  invites: Scalars['Int']['output'];
  key: Scalars['String']['output'];
  pledges: Scalars['Int']['output'];
  revenue: Scalars['Int']['output'];
};

export type AccessGrantStatsEvolution = {
  __typename?: 'AccessGrantStatsEvolution';
  buckets?: Maybe<Array<AccessGrantStatsPeriodBucket>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AccessGrantStatsPeriodBucket = {
  __typename?: 'AccessGrantStatsPeriodBucket';
  active: Scalars['Int']['output'];
  activeUnconverted: Scalars['Int']['output'];
  converted: Scalars['Int']['output'];
  date: Scalars['Date']['output'];
  key: Scalars['String']['output'];
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
  stripeClientSecret?: Maybe<Scalars['String']['output']>;
  stripePublishableKey?: Maybe<Scalars['String']['output']>;
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  line1: Scalars['String']['output'];
  line2?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  postalCode: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AddressInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  line1: Scalars['String']['input'];
  line2?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  postalCode: Scalars['String']['input'];
};

export type AnserPageInfo = {
  __typename?: 'AnserPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Answer = {
  __typename?: 'Answer';
  drafted?: Maybe<Scalars['Boolean']['output']>;
  hasMatched?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  payload: Scalars['JSON']['output'];
  question: QuestionInterface;
  submitted: Scalars['Boolean']['output'];
};

export type AnswerConnection = {
  __typename?: 'AnswerConnection';
  nodes: Array<Answer>;
  pageInfo: AnserPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AnswerInput = {
  id: Scalars['ID']['input'];
  payload?: InputMaybe<Scalars['JSON']['input']>;
  questionId: Scalars['ID']['input'];
};

/** Provide an entitiy type (e. g. `Document`) and its ID */
export type AudioQueueEntityInput = {
  id: Scalars['ID']['input'];
  type: AudioQueueEntityType;
};

export enum AudioQueueEntityType {
  Document = 'Document'
}

/** An item in an audio queue. */
export type AudioQueueItem = CollectionItemInterface & {
  __typename?: 'AudioQueueItem';
  collection: Collection;
  createdAt: Scalars['DateTime']['output'];
  document: Document;
  id: Scalars['ID']['output'];
  /** Sequence number of this item */
  sequence: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AudioSource = PlayableMedia & {
  __typename?: 'AudioSource';
  aac?: Maybe<Scalars['String']['output']>;
  durationMs: Scalars['Int']['output'];
  kind?: Maybe<AudioSourceKind>;
  mediaId: Scalars['ID']['output'];
  mp3?: Maybe<Scalars['String']['output']>;
  ogg?: Maybe<Scalars['String']['output']>;
  userProgress?: Maybe<MediaProgress>;
};

export enum AudioSourceKind {
  Podcast = 'podcast',
  ReadAloud = 'readAloud',
  SyntheticReadAloud = 'syntheticReadAloud'
}

export type Author = {
  __typename?: 'Author';
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
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
  value: Scalars['Boolean']['input'];
};

export type Calendar = {
  __typename?: 'Calendar';
  id: Scalars['ID']['output'];
  slots?: Maybe<Array<CalendarSlot>>;
  slug: Scalars['String']['output'];
};


export type CalendarSlotsArgs = {
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CalendarSlot = {
  __typename?: 'CalendarSlot';
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  userCanBook: Scalars['Boolean']['output'];
  userCanCancel: Scalars['Boolean']['output'];
  userHasBooked: Scalars['Boolean']['output'];
  users: Array<User>;
};

export type CallToAction = {
  __typename?: 'CallToAction';
  /** Timestamp when User acknowledged call to action */
  acknowledgedAt?: Maybe<Scalars['DateTime']['output']>;
  beginAt: Scalars['DateTime']['output'];
  createdAt: Scalars['DateTime']['output'];
  endAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  payload: CallToActionPayload;
  response?: Maybe<Scalars['JSON']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CallToActionBasicPayload = {
  __typename?: 'CallToActionBasicPayload';
  linkHref: Scalars['String']['output'];
  linkLabel: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type CallToActionComponentPayload = {
  __typename?: 'CallToActionComponentPayload';
  customComponent: CallToActionCustomComponent;
};

export type CallToActionCustomComponent = {
  __typename?: 'CallToActionCustomComponent';
  args?: Maybe<Scalars['JSON']['output']>;
  key: Scalars['String']['output'];
};

export type CallToActionPayload = CallToActionBasicPayload | CallToActionComponentPayload;

export type Cancellation = {
  __typename?: 'Cancellation';
  cancelledViaSupport: Scalars['Boolean']['output'];
  category: CancellationCategory;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
  suppressConfirmation: Scalars['Boolean']['output'];
  suppressWinback: Scalars['Boolean']['output'];
  winbackCanBeSent: Scalars['Boolean']['output'];
  winbackSentAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CancellationCategory = {
  __typename?: 'CancellationCategory';
  label: Scalars['String']['output'];
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
  reason?: InputMaybe<Scalars['String']['input']>;
  suppressConfirmation?: InputMaybe<Scalars['Boolean']['input']>;
  suppressWinback?: InputMaybe<Scalars['Boolean']['input']>;
  type: CancellationCategoryType;
};

export type Candidacy = {
  __typename?: 'Candidacy';
  city?: Maybe<Scalars['String']['output']>;
  comment: Comment;
  credential?: Maybe<Credential>;
  election: Election;
  id: Scalars['ID']['output'];
  isIncumbent?: Maybe<Scalars['Boolean']['output']>;
  postalCodeGeo?: Maybe<PostalCodeGeo>;
  recommendation?: Maybe<Scalars['String']['output']>;
  user: User;
  yearOfBirth?: Maybe<Scalars['Int']['output']>;
};

export type Card = {
  __typename?: 'Card';
  documents: DocumentConnection;
  group: CardGroup;
  id: Scalars['ID']['output'];
  payload: Scalars['JSON']['output'];
  statement?: Maybe<Comment>;
  user: User;
};


export type CardPayloadArgs = {
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type CardUserArgs = {
  accessToken?: InputMaybe<Scalars['ID']['input']>;
};

export type CardAggregation = {
  __typename?: 'CardAggregation';
  buckets: Array<CardAggregationBucket>;
  key: Scalars['String']['output'];
};

export type CardAggregationBucket = {
  __typename?: 'CardAggregationBucket';
  cards: CardConnection;
  value: Scalars['String']['output'];
};


export type CardAggregationBucketCardsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
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
  totalCount: Scalars['Int']['output'];
};


export type CardConnectionAggregationsArgs = {
  keys?: InputMaybe<Array<CardAggregationKeys>>;
};

export type CardFiltersInput = {
  candidacies?: InputMaybe<Array<Scalars['String']['input']>>;
  elected?: InputMaybe<Scalars['Boolean']['input']>;
  elects?: InputMaybe<Array<Scalars['String']['input']>>;
  fractions?: InputMaybe<Array<Scalars['String']['input']>>;
  mustHave?: InputMaybe<Array<CardFiltersMustHaveInput>>;
  parties?: InputMaybe<Array<Scalars['String']['input']>>;
  subscribedByMe?: InputMaybe<Scalars['Boolean']['input']>;
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
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};


export type CardGroupCardsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<CardFiltersInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  focus?: InputMaybe<Array<Scalars['ID']['input']>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<CardSortInput>;
};

export type CardGroupConnection = {
  __typename?: 'CardGroupConnection';
  nodes: Array<CardGroup>;
  pageInfo: CardGroupPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CardGroupPageInfo = {
  __typename?: 'CardGroupPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type CardMedians = {
  __typename?: 'CardMedians';
  smartspider?: Maybe<Array<Scalars['Float']['output']>>;
};

export type CardPageInfo = {
  __typename?: 'CardPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type CardSortInput = {
  smartspider?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export type Collection = {
  __typename?: 'Collection';
  id: Scalars['ID']['output'];
  items: CollectionItemConnection;
  name: Scalars['String']['output'];
};


export type CollectionItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type CollectionItem = CollectionItemInterface & {
  __typename?: 'CollectionItem';
  collection: Collection;
  createdAt: Scalars['DateTime']['output'];
  document?: Maybe<Document>;
  id: Scalars['ID']['output'];
};

export type CollectionItemConnection = {
  __typename?: 'CollectionItemConnection';
  nodes: Array<CollectionItem>;
  pageInfo: CollectionItemPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CollectionItemInterface = {
  collection: Collection;
  createdAt: Scalars['DateTime']['output'];
  document?: Maybe<Document>;
  id: Scalars['ID']['output'];
};

export type CollectionItemPageInfo = {
  __typename?: 'CollectionItemPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type CollectionsStats = {
  __typename?: 'CollectionsStats';
  evolution: CollectionsStatsEvolution;
  last: CollectionsStatsBucket;
};


export type CollectionsStatsEvolutionArgs = {
  max: Scalars['YearMonthDate']['input'];
  min: Scalars['YearMonthDate']['input'];
  name: Scalars['String']['input'];
};


export type CollectionsStatsLastArgs = {
  name: Scalars['String']['input'];
};

export type CollectionsStatsBucket = {
  __typename?: 'CollectionsStatsBucket';
  /** Amount of documents */
  documents: Scalars['Int']['output'];
  /** Bucket key (YYYY-MM) */
  key: Scalars['String']['output'];
  /** Amount of media */
  medias: Scalars['Int']['output'];
  /** Amount of records */
  records: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** Amount of unqiue users */
  users: Scalars['Int']['output'];
};

export type CollectionsStatsEvolution = {
  __typename?: 'CollectionsStatsEvolution';
  buckets?: Maybe<Array<CollectionsStatsBucket>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type Comment = {
  __typename?: 'Comment';
  adminUnpublished?: Maybe<Scalars['Boolean']['output']>;
  author?: Maybe<User>;
  comments: CommentConnection;
  content?: Maybe<Scalars['JSON']['output']>;
  contentLength?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  depth: Scalars['Int']['output'];
  discussion: Discussion;
  displayAuthor: DisplayUser;
  downVotes: Scalars['Int']['output'];
  embed?: Maybe<Embed>;
  featuredAt?: Maybe<Scalars['DateTime']['output']>;
  featuredTargets?: Maybe<Array<CommentFeaturedTarget>>;
  featuredText?: Maybe<Scalars['String']['output']>;
  hotness: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  mentioningDocument?: Maybe<MentioningDocument>;
  numReports?: Maybe<Scalars['Int']['output']>;
  parent?: Maybe<Comment>;
  parentIds: Array<Scalars['ID']['output']>;
  preview?: Maybe<Preview>;
  published: Scalars['Boolean']['output'];
  score: Scalars['Int']['output'];
  tags: Array<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  unreadNotifications?: Maybe<NotificationConnection>;
  upVotes: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userCanEdit?: Maybe<Scalars['Boolean']['output']>;
  userCanReport: Scalars['Boolean']['output'];
  userReportedAt?: Maybe<Scalars['DateTime']['output']>;
  userVote?: Maybe<CommentVote>;
};


export type CommentPreviewArgs = {
  length?: InputMaybe<Scalars['Int']['input']>;
};

export type CommentAggregation = {
  __typename?: 'CommentAggregation';
  beginDate?: Maybe<Scalars['Date']['output']>;
  count: Scalars['Int']['output'];
  discussion: Discussion;
  endDate?: Maybe<Scalars['Date']['output']>;
};

export type CommentConnection = {
  __typename?: 'CommentConnection';
  directTotalCount?: Maybe<Scalars['Int']['output']>;
  focus?: Maybe<Comment>;
  id: Scalars['ID']['output'];
  nodes: Array<Maybe<Comment>>;
  pageInfo?: Maybe<DiscussionPageInfo>;
  resolvedOrderBy?: Maybe<DiscussionOrder>;
  totalCount: Scalars['Int']['output'];
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
  canDerive: Scalars['Boolean']['output'];
  date: Scalars['DateTime']['output'];
  derivatives?: Maybe<Array<Derivative>>;
  document: Document;
  id: Scalars['ID']['output'];
  markdown: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  parentIds: Array<Scalars['ID']['output']>;
  repo: Repo;
};


export type CommitCanDeriveArgs = {
  type: DerivativeType;
};

export type CommitConnection = {
  __typename?: 'CommitConnection';
  nodes: Array<Commit>;
  pageInfo: PublikatorPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Company = {
  __typename?: 'Company';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Contributor = {
  __typename?: 'Contributor';
  kind?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  user?: Maybe<User>;
};

export type Credential = {
  __typename?: 'Credential';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isListed: Scalars['Boolean']['output'];
  verified: Scalars['Boolean']['output'];
};

export type Crop = {
  __typename?: 'Crop';
  height?: Maybe<Scalars['Int']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
  x?: Maybe<Scalars['Int']['output']>;
  y?: Maybe<Scalars['Int']['output']>;
};

export type Crowdfunding = {
  __typename?: 'Crowdfunding';
  beginDate: Scalars['DateTime']['output'];
  createdAt: Scalars['DateTime']['output'];
  endDate: Scalars['DateTime']['output'];
  endVideo?: Maybe<Video>;
  goals: Array<CrowdfundingGoal>;
  hasEnded: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  packages: Array<Package>;
  status: CrowdfundingStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type CrowdfundingGoal = {
  __typename?: 'CrowdfundingGoal';
  description?: Maybe<Scalars['String']['output']>;
  memberships?: Maybe<Scalars['Int']['output']>;
  money: Scalars['Int']['output'];
  people: Scalars['Int']['output'];
};

export type CrowdfundingStatus = {
  __typename?: 'CrowdfundingStatus';
  memberships: Scalars['Int']['output'];
  money: Scalars['Int']['output'];
  people: Scalars['Int']['output'];
};

export type DateRangeFilter = {
  field: Field;
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
};

export type DateRangeInput = {
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type Derivative = {
  __typename?: 'Derivative';
  createdAt: Scalars['DateTime']['output'];
  destroyedAt?: Maybe<Scalars['DateTime']['output']>;
  failedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  readyAt?: Maybe<Scalars['DateTime']['output']>;
  result?: Maybe<Scalars['JSON']['output']>;
  status: DerivativeStatus;
  type: DerivativeType;
  updatedAt: Scalars['DateTime']['output'];
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
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  information: DeviceInformation;
  lastSeen: Scalars['DateTime']['output'];
  user: User;
};

export type DeviceInformation = {
  __typename?: 'DeviceInformation';
  appVersion: Scalars['String']['output'];
  model: Scalars['String']['output'];
  os: OsType;
  osVersion: Scalars['String']['output'];
};

export type DeviceInformationInput = {
  appVersion: Scalars['String']['input'];
  model: Scalars['String']['input'];
  os: OsType;
  osVersion: Scalars['StringOrNumber']['input'];
  userAgent?: InputMaybe<Scalars['String']['input']>;
};

export type Discussion = {
  __typename?: 'Discussion';
  closed: Scalars['Boolean']['output'];
  collapsable: Scalars['Boolean']['output'];
  comments: CommentConnection;
  displayAuthor?: Maybe<DisplayUser>;
  document?: Maybe<Document>;
  id: Scalars['ID']['output'];
  isBoard: Scalars['Boolean']['output'];
  path?: Maybe<Scalars['String']['output']>;
  rules: DiscussionRules;
  tagBuckets: Array<DiscussionTagBucket>;
  tagRequired: Scalars['Boolean']['output'];
  tags: Array<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  userCanComment: Scalars['Boolean']['output'];
  userPreference?: Maybe<DiscussionPreferences>;
  userSubscriptionsForCommenters: SubscriptionConnection;
  userWaitUntil?: Maybe<Scalars['DateTime']['output']>;
};


export type DiscussionCommentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  flatDepth?: InputMaybe<Scalars['Int']['input']>;
  focusId?: InputMaybe<Scalars['ID']['input']>;
  includeParent?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<DiscussionOrder>;
  orderDirection?: InputMaybe<OrderDirection>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
};


export type DiscussionUserSubscriptionsForCommentersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
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
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
};

export type DiscussionPreferences = {
  __typename?: 'DiscussionPreferences';
  anonymity: Scalars['Boolean']['output'];
  credential?: Maybe<Credential>;
  notifications?: Maybe<DiscussionNotificationOption>;
};

export type DiscussionPreferencesInput = {
  anonymity?: InputMaybe<Scalars['Boolean']['input']>;
  credential?: InputMaybe<Scalars['String']['input']>;
  notifications?: InputMaybe<DiscussionNotificationOption>;
};

export type DiscussionRules = {
  __typename?: 'DiscussionRules';
  allowedRoles: Array<Scalars['String']['output']>;
  anonymity: Permission;
  disableTopLevelComments?: Maybe<Scalars['Boolean']['output']>;
  maxLength?: Maybe<Scalars['Int']['output']>;
  minInterval?: Maybe<Scalars['Int']['output']>;
};

export type DiscussionSuspension = {
  __typename?: 'DiscussionSuspension';
  beginAt: Scalars['DateTime']['output'];
  createdAt: Scalars['DateTime']['output'];
  endAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  issuer?: Maybe<User>;
  reason?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type DiscussionTagBucket = {
  __typename?: 'DiscussionTagBucket';
  count: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

export type DiscussionsStats = {
  __typename?: 'DiscussionsStats';
  evolution: DiscussionsStatsEvolution;
  last: DiscussionsStatsBucket;
};


export type DiscussionsStatsEvolutionArgs = {
  max: Scalars['YearMonthDate']['input'];
  min: Scalars['YearMonthDate']['input'];
};

export type DiscussionsStatsBucket = {
  __typename?: 'DiscussionsStatsBucket';
  /** Amount of comments */
  comments: Scalars['Int']['output'];
  /** Amount of discussions */
  discussions: Scalars['Int']['output'];
  /** Bucket key (YYYY-MM) */
  key: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** Amount of unqiue users */
  users: Scalars['Int']['output'];
  /** Amount of unqiue users which posted a comment */
  usersPosted: Scalars['Int']['output'];
  /** Amount of unqiue users which voted on a comment */
  usersVoted: Scalars['Int']['output'];
};

export type DiscussionsStatsEvolution = {
  __typename?: 'DiscussionsStatsEvolution';
  buckets?: Maybe<Array<DiscussionsStatsBucket>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type DisplayUser = {
  __typename?: 'DisplayUser';
  anonymity: Scalars['Boolean']['output'];
  credential?: Maybe<Credential>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  profilePicture?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  /** @deprecated use `slug` instead */
  username?: Maybe<Scalars['String']['output']>;
};

export enum DocumenSchemaType {
  Mdast = 'mdast',
  Slate = 'slate'
}

export type Document = {
  __typename?: 'Document';
  children: DocumentNodeConnection;
  content: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  issuedForUserId?: Maybe<Scalars['ID']['output']>;
  linkedDocuments: DocumentConnection;
  meta: Meta;
  repoId: Scalars['ID']['output'];
  subscribedBy: SubscriptionConnection;
  /** @deprecated use `subscribedBy` with `onlyMe: true` instead */
  subscribedByMe?: Maybe<Subscription>;
  type: DocumenSchemaType;
  unreadNotifications?: Maybe<NotificationConnection>;
  userCollectionItem?: Maybe<CollectionItem>;
  userCollectionItems: Array<CollectionItem>;
  userProgress?: Maybe<DocumentProgress>;
};


export type DocumentChildrenArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  only?: InputMaybe<Scalars['ID']['input']>;
};


export type DocumentLinkedDocumentsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  feed?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type DocumentSubscribedByArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<EventObjectType>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  includeParents?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  onlyEligibles?: InputMaybe<Scalars['Boolean']['input']>;
  onlyMe?: InputMaybe<Scalars['Boolean']['input']>;
  uniqueUsers?: InputMaybe<Scalars['Boolean']['input']>;
};


export type DocumentSubscribedByMeArgs = {
  includeParents?: InputMaybe<Scalars['Boolean']['input']>;
};


export type DocumentUserCollectionItemArgs = {
  collectionName: Scalars['String']['input'];
};

export type DocumentConnection = {
  __typename?: 'DocumentConnection';
  nodes: Array<Document>;
  pageInfo: DocumentPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DocumentInput = {
  content: Scalars['JSON']['input'];
  type?: InputMaybe<DocumenSchemaType>;
};

export type DocumentNode = {
  __typename?: 'DocumentNode';
  body: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
};

export type DocumentNodeConnection = {
  __typename?: 'DocumentNodeConnection';
  nodes: Array<DocumentNode>;
  pageInfo: DocumentNodePageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DocumentNodePageInfo = {
  __typename?: 'DocumentNodePageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type DocumentPageInfo = {
  __typename?: 'DocumentPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type DocumentProgress = CollectionItemInterface & {
  __typename?: 'DocumentProgress';
  collection: Collection;
  createdAt: Scalars['DateTime']['output'];
  document?: Maybe<Document>;
  id: Scalars['ID']['output'];
  max?: Maybe<DocumentProgress>;
  nodeId: Scalars['String']['output'];
  percentage: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum DocumentTextLengths {
  Long = 'LONG',
  Medium = 'MEDIUM',
  Short = 'SHORT'
}

export type DocumentZone = {
  __typename?: 'DocumentZone';
  data: Scalars['JSON']['output'];
  document?: Maybe<Document>;
  hash: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  identifier: Scalars['String']['output'];
  node: Scalars['JSON']['output'];
  text?: Maybe<Scalars['String']['output']>;
  type: DocumenSchemaType;
};

export type Election = VotingInterface & {
  __typename?: 'Election';
  allowEmptyBallots: Scalars['Boolean']['output'];
  allowedMemberships?: Maybe<Array<VotingMembershipRequirement>>;
  allowedRoles?: Maybe<Array<Scalars['String']['output']>>;
  beginDate: Scalars['DateTime']['output'];
  candidacies: Array<Candidacy>;
  candidacyBeginDate: Scalars['DateTime']['output'];
  candidacyEndDate: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  discussion: Discussion;
  endDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  liveResult: Scalars['Boolean']['output'];
  numSeats: Scalars['Int']['output'];
  requireAddress: Scalars['Boolean']['output'];
  result?: Maybe<ElectionResult>;
  slug: Scalars['String']['output'];
  turnout: ElectionTurnout;
  userHasSubmitted?: Maybe<Scalars['Boolean']['output']>;
  userIsEligible?: Maybe<Scalars['Boolean']['output']>;
  userSubmitDate?: Maybe<Scalars['DateTime']['output']>;
};

export type ElectionBallotInput = {
  candidacyIds: Array<Scalars['ID']['input']>;
  electionId: Scalars['ID']['input'];
};

export type ElectionCandidacyResult = {
  __typename?: 'ElectionCandidacyResult';
  candidacy?: Maybe<Candidacy>;
  count: Scalars['Int']['output'];
  elected?: Maybe<Scalars['Boolean']['output']>;
};

export type ElectionInput = {
  allowEmptyBallots?: InputMaybe<Scalars['Boolean']['input']>;
  allowedMemberships?: InputMaybe<Array<VotingMembershipRequirementInput>>;
  allowedRoles?: InputMaybe<Array<Scalars['String']['input']>>;
  beginDate: Scalars['DateTime']['input'];
  candidacyBeginDate: Scalars['DateTime']['input'];
  candidacyEndDate: Scalars['DateTime']['input'];
  description: Scalars['String']['input'];
  endDate: Scalars['DateTime']['input'];
  groupSlug?: InputMaybe<Scalars['String']['input']>;
  numSeats: Scalars['Int']['input'];
  slug: Scalars['String']['input'];
};

export type ElectionResult = {
  __typename?: 'ElectionResult';
  candidacies: Array<ElectionCandidacyResult>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  turnout: ElectionTurnout;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  video?: Maybe<Video>;
};

export type ElectionTurnout = {
  __typename?: 'ElectionTurnout';
  eligible: Scalars['Int']['output'];
  submitted: Scalars['Int']['output'];
};

export type Embed = LinkPreview | TwitterEmbed | VimeoEmbed | YoutubeEmbed;

export enum EmbedType {
  TwitterEmbed = 'TwitterEmbed',
  VimeoEmbed = 'VimeoEmbed',
  YoutubeEmbed = 'YoutubeEmbed'
}

export type Employee = {
  __typename?: 'Employee';
  greeting?: Maybe<Scalars['String']['output']>;
  group?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  pitch?: Maybe<Scalars['String']['output']>;
  subgroup?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type Episode = {
  __typename?: 'Episode';
  document?: Maybe<Document>;
  image?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  lead?: Maybe<Scalars['String']['output']>;
  publishDate?: Maybe<Scalars['DateTime']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type Event = {
  __typename?: 'Event';
  date?: Maybe<Scalars['Date']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  link?: Maybe<Scalars['String']['output']>;
  locationLink?: Maybe<Scalars['String']['output']>;
  metaDescription?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  socialMediaImage?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  where?: Maybe<Scalars['String']['output']>;
};

export type EventObject = Comment | Document;

export enum EventObjectType {
  Comment = 'Comment',
  Document = 'Document',
  ReadAloud = 'ReadAloud'
}

export type Faq = {
  __typename?: 'Faq';
  answer?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  question?: Maybe<Scalars['String']['output']>;
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
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  requireAddress: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Greeting = {
  __typename?: 'Greeting';
  id: Scalars['ID']['output'];
  text: Scalars['String']['output'];
};

export type ImageProperties = {
  bw?: InputMaybe<Scalars['Boolean']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type LinkPreview = {
  __typename?: 'LinkPreview';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageAlt?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  siteImageUrl?: Maybe<Scalars['String']['output']>;
  siteName: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
};

export type MailboxAddress = {
  __typename?: 'MailboxAddress';
  address: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type MailboxConnection = {
  __typename?: 'MailboxConnection';
  nodes: Array<MailboxRecord>;
  pageInfo: MailboxPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type MailboxFiltersInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  hasError?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type MailboxLink = {
  __typename?: 'MailboxLink';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  type: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type MailboxPageInfo = {
  __typename?: 'MailboxPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type MailboxRecord = {
  __typename?: 'MailboxRecord';
  bcc?: Maybe<Array<MailboxAddress>>;
  cc?: Maybe<Array<MailboxAddress>>;
  date: Scalars['DateTime']['output'];
  error?: Maybe<Scalars['String']['output']>;
  from?: Maybe<MailboxAddress>;
  hasHtml: Scalars['Boolean']['output'];
  html?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  links?: Maybe<Array<MailboxLink>>;
  status?: Maybe<Scalars['String']['output']>;
  subject?: Maybe<Scalars['String']['output']>;
  template?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Array<MailboxAddress>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type MediaProgress = CollectionItemInterface & {
  __typename?: 'MediaProgress';
  collection: Collection;
  createdAt: Scalars['DateTime']['output'];
  document?: Maybe<Document>;
  id: Scalars['ID']['output'];
  max?: Maybe<MediaProgress>;
  mediaId: Scalars['ID']['output'];
  secs: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MediaResponse = {
  __typename?: 'MediaResponse';
  medium?: Maybe<Scalars['String']['output']>;
  publishDate?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type MemberStats = {
  __typename?: 'MemberStats';
  count: Scalars['Int']['output'];
};

export type Membership = {
  __typename?: 'Membership';
  accessGranted: Scalars['Boolean']['output'];
  active: Scalars['Boolean']['output'];
  autoPay: Scalars['Boolean']['output'];
  autoPayIsMutable: Scalars['Boolean']['output'];
  canAppendPeriod: Scalars['Boolean']['output'];
  canProlong: Scalars['Boolean']['output'];
  canReset: Scalars['Boolean']['output'];
  cancellations: Array<Cancellation>;
  claimerName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  endDate?: Maybe<Scalars['DateTime']['output']>;
  giverName?: Maybe<Scalars['String']['output']>;
  graceEndDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  initialInterval: MembershipTypeInterval;
  initialPeriods: Scalars['Int']['output'];
  messageToClaimers?: Maybe<Scalars['String']['output']>;
  overdue: Scalars['Boolean']['output'];
  periods: Array<Maybe<MembershipPeriod>>;
  pledge: Pledge;
  reducedPrice: Scalars['Boolean']['output'];
  renew: Scalars['Boolean']['output'];
  sequenceNumber?: Maybe<Scalars['Int']['output']>;
  type: MembershipType;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  voucherCode?: Maybe<Scalars['String']['output']>;
};

export type MembershipPeriod = {
  __typename?: 'MembershipPeriod';
  beginDate: Scalars['DateTime']['output'];
  createdAt: Scalars['DateTime']['output'];
  endDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isCurrent: Scalars['Boolean']['output'];
  kind: MembershipPeriodKind;
  membership: Membership;
  updatedAt: Scalars['DateTime']['output'];
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
  id: Scalars['ID']['output'];
  totalMemberships: Scalars['Int']['output'];
};

export type MembershipPeriodStatsDay = {
  __typename?: 'MembershipPeriodStatsDay';
  cancelCount: Scalars['Int']['output'];
  date: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  prolongCount: Scalars['Int']['output'];
};

export type MembershipPotStats = {
  __typename?: 'MembershipPotStats';
  donatedAmountOfMemberships: Scalars['Int']['output'];
  generatedAmountOfMemberships: Scalars['Int']['output'];
  surplusAmountOfDonatedMemberships: Scalars['Int']['output'];
  totalDonated: Scalars['Int']['output'];
};

export type MembershipStats = {
  __typename?: 'MembershipStats';
  /** Returns age distribution for users with active memberships */
  ages: MembershipStatsAges;
  count: Scalars['Int']['output'];
  countRange: Scalars['Int']['output'];
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
  max: Scalars['DateTime']['input'];
  min: Scalars['DateTime']['input'];
};


export type MembershipStatsEvolutionArgs = {
  max: Scalars['YearMonthDate']['input'];
  min: Scalars['YearMonthDate']['input'];
};


export type MembershipStatsLastSeenArgs = {
  max: Scalars['YearMonthDate']['input'];
  min: Scalars['YearMonthDate']['input'];
};


export type MembershipStatsNamesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type MembershipStatsPeriodsArgs = {
  maxEndDate: Scalars['Date']['input'];
  membershipTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  minEndDate: Scalars['Date']['input'];
};

export type MembershipStatsAges = {
  __typename?: 'MembershipStatsAges';
  averageAge?: Maybe<Scalars['Float']['output']>;
  buckets: Array<MembershipStatsAgesBucket>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MembershipStatsAgesBucket = {
  __typename?: 'MembershipStatsAgesBucket';
  count: Scalars['Int']['output'];
  key?: Maybe<Scalars['Int']['output']>;
};

export type MembershipStatsEvolution = {
  __typename?: 'MembershipStatsEvolution';
  buckets?: Maybe<Array<MembershipStatsEvolutionBucket>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MembershipStatsEvolutionBucket = {
  __typename?: 'MembershipStatsEvolutionBucket';
  /** Amount of memberships which are active (periods) */
  active: Scalars['Int']['output'];
  /** Amount of active memberships at beginning of month */
  activeBeginningOfMonth: Scalars['Int']['output'];
  /** Amount of still or again active crowdfunding memberships (periods) */
  activeCrowdfunders: Scalars['Int']['output'];
  /** Amount of still or again active crowdfunding memberships at end of month */
  activeCrowdfundersEndOfMonth: Scalars['Int']['output'];
  /** Amount of active memberships at end of month */
  activeEndOfMonth: Scalars['Int']['output'];
  /** Amount of active memberships at end of month with a donation */
  activeEndOfMonthWithDonation: Scalars['Int']['output'];
  /** Amount of active memberships at end of month without a donation */
  activeEndOfMonthWithoutDonation: Scalars['Int']['output'];
  /** Amount of still or again active loyalist memberships (periods) */
  activeLoyalists: Scalars['Int']['output'];
  /** Amount of still or again active loyalist memberships at end of month */
  activeLoyalistsEndOfMonth: Scalars['Int']['output'];
  /** Amount of memberships which ended and were cancelled as of now */
  cancelled: Scalars['Int']['output'];
  /** Amount of memberships ended during month due to cancellation */
  cancelledEndOfMonth: Scalars['Int']['output'];
  /** Amount of memberships which ended as of now */
  ended: Scalars['Int']['output'];
  /** Amount of memberships ended during month */
  endedEndOfMonth: Scalars['Int']['output'];
  /** Amount of memberships ending during month */
  ending: Scalars['Int']['output'];
  /** Amount of memberships which expired as of now */
  expired: Scalars['Int']['output'];
  /** Amount of memberships ended during month due to expiration */
  expiredEndOfMonth: Scalars['Int']['output'];
  /** Amount of memberships gained during month */
  gaining: Scalars['Int']['output'];
  /** Amount of memberships gained during month with donation */
  gainingWithDonation: Scalars['Int']['output'];
  /** Amount of memberships gained during month without donation */
  gainingWithoutDonation: Scalars['Int']['output'];
  /** Bucket key (YYYY-MM) */
  key: Scalars['String']['output'];
  /** Amount of memberships which are overdue */
  overdue: Scalars['Int']['output'];
  /** Amount of all memberships pending at end of month (ending but still prolongable) */
  pending: Scalars['Int']['output'];
  /** Amount of all subscriptions (e.g. MONTHLY_ABO) pending at end of month (ending but still prolongable) */
  pendingSubscriptionsOnly: Scalars['Int']['output'];
  /** Amount of memberships ending during month but still prolongable */
  prolongable: Scalars['Int']['output'];
};

export type MembershipStatsGeo = {
  __typename?: 'MembershipStatsGeo';
  buckets: Array<MembershipStatsGeoBucket>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MembershipStatsGeoBucket = {
  __typename?: 'MembershipStatsGeoBucket';
  buckets: Array<MembershipStatsGeoCountBucket>;
  country?: Maybe<Scalars['String']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  lat?: Maybe<Scalars['Float']['output']>;
  lon?: Maybe<Scalars['Float']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
};

export type MembershipStatsGeoCountBucket = {
  __typename?: 'MembershipStatsGeoCountBucket';
  count: Scalars['Int']['output'];
  key?: Maybe<Scalars['String']['output']>;
};

export type MembershipStatsLastSeen = {
  __typename?: 'MembershipStatsLastSeen';
  buckets?: Maybe<Array<MembershipStatsLastSeenBucket>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MembershipStatsLastSeenBucket = {
  __typename?: 'MembershipStatsLastSeenBucket';
  /** Bucket key (YYYY-MM) */
  key: Scalars['String']['output'];
  users: Scalars['Int']['output'];
};

export type MembershipStatsNames = {
  __typename?: 'MembershipStatsNames';
  buckets: Array<MembershipStatsNamesBucket>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MembershipStatsNamesBucket = {
  __typename?: 'MembershipStatsNamesBucket';
  count: Scalars['Int']['output'];
  key?: Maybe<Scalars['String']['output']>;
  sex?: Maybe<Sex>;
};

export type MembershipStatsgeoCities = {
  __typename?: 'MembershipStatsgeoCities';
  buckets: Array<MembershipStatsgeoCitiesBucket>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MembershipStatsgeoCitiesBucket = {
  __typename?: 'MembershipStatsgeoCitiesBucket';
  buckets: Array<MembershipStatsgeoCitiesCountBucket>;
  key?: Maybe<Scalars['String']['output']>;
};

export type MembershipStatsgeoCitiesCountBucket = {
  __typename?: 'MembershipStatsgeoCitiesCountBucket';
  count: Scalars['Int']['output'];
  key?: Maybe<Scalars['String']['output']>;
};

export type MembershipType = {
  __typename?: 'MembershipType';
  createdAt: Scalars['DateTime']['output'];
  defaultPeriods: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  interval: MembershipTypeInterval;
  maxPeriods: Scalars['Int']['output'];
  minPeriods: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  requireAddress: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
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
  content?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  parentIds: Array<Scalars['ID']['output']>;
  published: Scalars['Boolean']['output'];
  text?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MentioningDocument = {
  __typename?: 'MentioningDocument';
  document: Document;
  fragmentId?: Maybe<Scalars['String']['output']>;
  iconUrl: Scalars['String']['output'];
};

export type Meta = {
  __typename?: 'Meta';
  audioCover?: Maybe<Scalars['String']['output']>;
  audioCoverCrop?: Maybe<Crop>;
  audioSource?: Maybe<AudioSource>;
  color?: Maybe<Scalars['String']['output']>;
  contributors: Array<Contributor>;
  credits?: Maybe<Scalars['JSON']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  disableActionBar?: Maybe<Scalars['Boolean']['output']>;
  dossier?: Maybe<Document>;
  emailSubject?: Maybe<Scalars['String']['output']>;
  estimatedConsumptionMinutes?: Maybe<Scalars['Int']['output']>;
  estimatedReadingMinutes?: Maybe<Scalars['Int']['output']>;
  externalBaseUrl?: Maybe<Scalars['String']['output']>;
  facebookDescription?: Maybe<Scalars['String']['output']>;
  facebookImage?: Maybe<Scalars['String']['output']>;
  facebookTitle?: Maybe<Scalars['String']['output']>;
  feed?: Maybe<Scalars['Boolean']['output']>;
  format?: Maybe<Document>;
  gallery?: Maybe<Scalars['Boolean']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  indicateChart?: Maybe<Scalars['Boolean']['output']>;
  indicateGallery?: Maybe<Scalars['Boolean']['output']>;
  indicateVideo?: Maybe<Scalars['Boolean']['output']>;
  isRestricted?: Maybe<Scalars['Boolean']['output']>;
  kind?: Maybe<Scalars['String']['output']>;
  lastPublishedAt?: Maybe<Scalars['DateTime']['output']>;
  linkedDiscussion?: Maybe<Discussion>;
  newsletter?: Maybe<Newsletter>;
  ownDiscussion?: Maybe<Discussion>;
  path?: Maybe<Scalars['String']['output']>;
  paynoteMode?: Maybe<PaynoteMode>;
  paynotes?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  podcast?: Maybe<Podcast>;
  prepublication?: Maybe<Scalars['Boolean']['output']>;
  publishDate?: Maybe<Scalars['DateTime']['output']>;
  recommendations?: Maybe<DocumentConnection>;
  section?: Maybe<Document>;
  sendAsEmail?: Maybe<Scalars['Boolean']['output']>;
  seoDescription?: Maybe<Scalars['String']['output']>;
  seoTitle?: Maybe<Scalars['String']['output']>;
  series?: Maybe<Series>;
  shareBackgroundImage?: Maybe<Scalars['String']['output']>;
  shareBackgroundImageInverted?: Maybe<Scalars['String']['output']>;
  shareFontSize?: Maybe<Scalars['Int']['output']>;
  shareInverted?: Maybe<Scalars['Boolean']['output']>;
  shareLogo?: Maybe<Scalars['String']['output']>;
  shareText?: Maybe<Scalars['String']['output']>;
  shareTextPosition?: Maybe<Scalars['String']['output']>;
  shortTitle?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  /** @deprecated parse `Document.content` instead */
  subject?: Maybe<Scalars['String']['output']>;
  suggestSubscription?: Maybe<Scalars['Boolean']['output']>;
  template?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  twitterDescription?: Maybe<Scalars['String']['output']>;
  twitterImage?: Maybe<Scalars['String']['output']>;
  twitterTitle?: Maybe<Scalars['String']['output']>;
  willBeReadAloud?: Maybe<Scalars['Boolean']['output']>;
};


export type MetaAudioCoverArgs = {
  properties?: InputMaybe<ImageProperties>;
};

export type Milestone = MilestoneInterface & {
  __typename?: 'Milestone';
  author: Author;
  commit: Commit;
  date: Scalars['DateTime']['output'];
  immutable: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type MilestoneInterface = {
  author: Author;
  commit: Commit;
  date: Scalars['DateTime']['output'];
  name: Scalars['String']['output'];
};

export type MonthlyMembershipStat = {
  __typename?: 'MonthlyMembershipStat';
  day: Scalars['Date']['output'];
  newCount: Scalars['Int']['output'];
  renewableCount: Scalars['Int']['output'];
  renewedCount: Scalars['Int']['output'];
  renewedRatio: Scalars['Float']['output'];
};

export enum MutationType {
  Created = 'CREATED',
  Deleted = 'DELETED',
  Updated = 'UPDATED'
}

export type Newsletter = {
  __typename?: 'Newsletter';
  free?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export enum NewsletterName {
  Accomplice = 'ACCOMPLICE',
  Climate = 'CLIMATE',
  Daily = 'DAILY',
  Projectr = 'PROJECTR',
  Wdwww = 'WDWWW',
  Weekly = 'WEEKLY'
}

export type NewsletterSettings = {
  __typename?: 'NewsletterSettings';
  id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  subscriptions?: Maybe<Array<Maybe<NewsletterSubscription>>>;
};


export type NewsletterSettingsSubscriptionsArgs = {
  name?: InputMaybe<NewsletterName>;
};

export type NewsletterSubscription = {
  __typename?: 'NewsletterSubscription';
  id: Scalars['ID']['output'];
  /** @deprecated Eligability is handeld elsewhere. Subscription changes are always possible. */
  isEligible: Scalars['Boolean']['output'];
  name: NewsletterName;
  subscribed: Scalars['Boolean']['output'];
};

export type Notification = {
  __typename?: 'Notification';
  appPushesFailed?: Maybe<Scalars['Int']['output']>;
  appPushesSuccessful?: Maybe<Scalars['Int']['output']>;
  channels: Array<Maybe<DiscussionNotificationChannel>>;
  content: NotificationContent;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  object?: Maybe<EventObject>;
  readAt?: Maybe<Scalars['DateTime']['output']>;
  subscription?: Maybe<Subscription>;
};

export type NotificationConnection = {
  __typename?: 'NotificationConnection';
  nodes: Array<Notification>;
  pageInfo: SubscriptionPageInfo;
  totalCount: Scalars['Int']['output'];
  unreadCount: Scalars['Int']['output'];
};

export type NotificationContent = {
  __typename?: 'NotificationContent';
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
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
  createdAt: Scalars['DateTime']['output'];
  group: PackageGroup;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  options: Array<PackageOption>;
  paymentMethods: Array<PaymentMethod>;
  suggestedTotal?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export enum PackageGroup {
  Give = 'GIVE',
  Hidden = 'HIDDEN',
  Me = 'ME'
}

export type PackageOption = {
  __typename?: 'PackageOption';
  accessGranted?: Maybe<Scalars['Boolean']['output']>;
  additionalPeriods?: Maybe<Array<MembershipPeriod>>;
  amount?: Maybe<Scalars['Int']['output']>;
  autoPay?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['DateTime']['output'];
  defaultAmount: Scalars['Int']['output'];
  fixedPrice: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  maxAmount?: Maybe<Scalars['Int']['output']>;
  membership?: Maybe<Membership>;
  minAmount: Scalars['Int']['output'];
  minUserPrice: Scalars['Int']['output'];
  optionGroup?: Maybe<Scalars['String']['output']>;
  package: Package;
  payMoreSuggestion: Scalars['Boolean']['output'];
  periods?: Maybe<Scalars['Int']['output']>;
  price: Scalars['Int']['output'];
  reward?: Maybe<Reward>;
  templateId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userPrice: Scalars['Boolean']['output'];
  vat: Scalars['Int']['output'];
};

export type PackageOptionInput = {
  amount: Scalars['Int']['input'];
  autoPay?: InputMaybe<Scalars['Boolean']['input']>;
  membershipId?: InputMaybe<Scalars['ID']['input']>;
  periods?: InputMaybe<Scalars['Int']['input']>;
  price: Scalars['Int']['input'];
  templateId: Scalars['ID']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum PaymentMethod {
  Paymentslip = 'PAYMENTSLIP',
  Paypal = 'PAYPAL',
  Postfinancecard = 'POSTFINANCECARD',
  Stripe = 'STRIPE'
}

export type PaymentSource = {
  __typename?: 'PaymentSource';
  brand: Scalars['String']['output'];
  expMonth: Scalars['Int']['output'];
  expYear: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  isExpired: Scalars['Boolean']['output'];
  last4: Scalars['String']['output'];
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
  durationMs: Scalars['Int']['output'];
  mediaId: Scalars['ID']['output'];
  userProgress?: Maybe<MediaProgress>;
};

export type Pledge = {
  __typename?: 'Pledge';
  createdAt: Scalars['DateTime']['output'];
  donation: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  memberships: Array<Membership>;
  options: Array<PackageOption>;
  package: Package;
  payments: Array<PledgePayment>;
  reason?: Maybe<Scalars['String']['output']>;
  shippingAddress?: Maybe<Address>;
  status: PledgeStatus;
  total: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type PledgeInput = {
  accessToken?: InputMaybe<Scalars['ID']['input']>;
  address?: InputMaybe<AddressInput>;
  messageToClaimers?: InputMaybe<Scalars['String']['input']>;
  options: Array<PackageOptionInput>;
  payload?: InputMaybe<Scalars['JSON']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  shippingAddress?: InputMaybe<AddressInput>;
  total: Scalars['Int']['input'];
  user?: InputMaybe<UserInput>;
};

export type PledgePayment = {
  __typename?: 'PledgePayment';
  createdAt: Scalars['DateTime']['output'];
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  hrid?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  invoiceUrl?: Maybe<Scalars['String']['output']>;
  method: PaymentMethod;
  paperInvoice: Scalars['Boolean']['output'];
  paymentslipUrl?: Maybe<Scalars['String']['output']>;
  pspId?: Maybe<Scalars['String']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  remindersSentAt?: Maybe<Array<Scalars['DateTime']['output']>>;
  status: PaymentStatus;
  total: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
};


export type PledgePaymentReferenceArgs = {
  pretty?: InputMaybe<Scalars['Boolean']['input']>;
};

export type PledgePaymentInput = {
  address?: InputMaybe<AddressInput>;
  makeDefault?: InputMaybe<Scalars['Boolean']['input']>;
  method: PaymentMethod;
  paperInvoice?: InputMaybe<Scalars['Boolean']['input']>;
  pledgeId: Scalars['ID']['input'];
  pspPayload?: InputMaybe<Scalars['JSON']['input']>;
  shippingAddress?: InputMaybe<AddressInput>;
  sourceId?: InputMaybe<Scalars['String']['input']>;
};

export type PledgePayments = {
  __typename?: 'PledgePayments';
  count: Scalars['Int']['output'];
  items: Array<PledgePayment>;
};

export type PledgeResponse = {
  __typename?: 'PledgeResponse';
  companyId?: Maybe<Scalars['ID']['output']>;
  emailVerify?: Maybe<Scalars['Boolean']['output']>;
  pfAliasId?: Maybe<Scalars['String']['output']>;
  pfSHA?: Maybe<Scalars['String']['output']>;
  pledgeId?: Maybe<Scalars['ID']['output']>;
  stripeClientSecret?: Maybe<Scalars['String']['output']>;
  stripePaymentIntentId?: Maybe<Scalars['ID']['output']>;
  stripePublishableKey?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
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
  appleUrl?: Maybe<Scalars['String']['output']>;
  googleUrl?: Maybe<Scalars['String']['output']>;
  podigeeSlug?: Maybe<Scalars['String']['output']>;
  spotifyUrl?: Maybe<Scalars['String']['output']>;
};

export enum PortraitSize {
  /** @deprecated use `ImageProperties` instead */
  Share = 'SHARE',
  /** @deprecated use `ImageProperties` instead */
  Small = 'SMALL'
}

export type PostalCodeGeo = {
  __typename?: 'PostalCodeGeo';
  countryCode?: Maybe<Scalars['String']['output']>;
  countryName?: Maybe<Scalars['String']['output']>;
  lat?: Maybe<Scalars['Float']['output']>;
  lon?: Maybe<Scalars['Float']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
};

export type PostfinancePayment = {
  __typename?: 'PostfinancePayment';
  avisierungstext: Scalars['String']['output'];
  buchungsdatum: Scalars['Date']['output'];
  createdAt: Scalars['DateTime']['output'];
  debitorName?: Maybe<Scalars['String']['output']>;
  gutschrift: Scalars['Int']['output'];
  hidden: Scalars['Boolean']['output'];
  iban: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  konto: Scalars['String']['output'];
  matched: Scalars['Boolean']['output'];
  mitteilung?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  valuta: Scalars['Date']['output'];
};

export type PostfinancePayments = {
  __typename?: 'PostfinancePayments';
  count: Scalars['Int']['output'];
  items: Array<PostfinancePayment>;
};

export type Preview = {
  __typename?: 'Preview';
  more: Scalars['Boolean']['output'];
  string: Scalars['String']['output'];
};

export enum ProgressState {
  Finished = 'FINISHED',
  Unfinished = 'UNFINISHED'
}

export type Publication = MilestoneInterface & {
  __typename?: 'Publication';
  author: Author;
  commit: Commit;
  date: Scalars['DateTime']['output'];
  document?: Maybe<Document>;
  live: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  prepublication: Scalars['Boolean']['output'];
  scheduledAt?: Maybe<Scalars['DateTime']['output']>;
  sha: Scalars['String']['output'];
  updateMailchimp: Scalars['Boolean']['output'];
};

export type PublikatorPageInfo = {
  __typename?: 'PublikatorPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PublishResponse = {
  __typename?: 'PublishResponse';
  publication?: Maybe<Publication>;
  unresolvedRepoIds: Array<Scalars['ID']['output']>;
};

export type PublishSettings = {
  ignoreUnresolvedRepoIds?: InputMaybe<Scalars['Boolean']['input']>;
  notifyFilters?: InputMaybe<Array<EventObjectType>>;
  prepublication: Scalars['Boolean']['input'];
  scheduledAt?: InputMaybe<Scalars['DateTime']['input']>;
  updateMailchimp: Scalars['Boolean']['input'];
};

export enum QrCodeErrorCorrectionLevel {
  H = 'H',
  L = 'L',
  M = 'M',
  Q = 'Q'
}

export type QuestionInterface = {
  explanation?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  order: Scalars['Int']['output'];
  private: Scalars['Boolean']['output'];
  questionnaire: Questionnaire;
  text: Scalars['String']['output'];
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};

export type QuestionTurnout = {
  __typename?: 'QuestionTurnout';
  skipped: Scalars['Int']['output'];
  submitted: Scalars['Int']['output'];
  unattributed: Scalars['Int']['output'];
};

export type QuestionTypeChoice = QuestionInterface & {
  __typename?: 'QuestionTypeChoice';
  cardinality: Scalars['Int']['output'];
  explanation?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  options: Array<QuestionTypeChoiceOption>;
  order: Scalars['Int']['output'];
  private: Scalars['Boolean']['output'];
  questionnaire: Questionnaire;
  result?: Maybe<Array<QuestionTypeChoiceResult>>;
  text: Scalars['String']['output'];
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};


export type QuestionTypeChoiceResultArgs = {
  min?: InputMaybe<Scalars['Int']['input']>;
  top?: InputMaybe<Scalars['Int']['input']>;
};

export type QuestionTypeChoiceOption = {
  __typename?: 'QuestionTypeChoiceOption';
  category?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  requireAddress?: Maybe<Scalars['Boolean']['output']>;
  value: Scalars['ID']['output'];
};

export type QuestionTypeChoiceResult = {
  __typename?: 'QuestionTypeChoiceResult';
  count: Scalars['Int']['output'];
  option: QuestionTypeChoiceOption;
};

export type QuestionTypeDocument = QuestionInterface & {
  __typename?: 'QuestionTypeDocument';
  explanation?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  order: Scalars['Int']['output'];
  private: Scalars['Boolean']['output'];
  questionnaire: Questionnaire;
  result?: Maybe<Array<QuestionTypeDocumentResult>>;
  template?: Maybe<Scalars['String']['output']>;
  text: Scalars['String']['output'];
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};


export type QuestionTypeDocumentResultArgs = {
  min?: InputMaybe<Scalars['Int']['input']>;
  top?: InputMaybe<Scalars['Int']['input']>;
};

export type QuestionTypeDocumentResult = {
  __typename?: 'QuestionTypeDocumentResult';
  count: Scalars['Int']['output'];
  document?: Maybe<Document>;
};

export type QuestionTypeImageChoice = QuestionInterface & {
  __typename?: 'QuestionTypeImageChoice';
  cardinality: Scalars['Int']['output'];
  explanation?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  options: Array<QuestionTypeImageChoiceOption>;
  order: Scalars['Int']['output'];
  private: Scalars['Boolean']['output'];
  questionnaire: Questionnaire;
  result?: Maybe<Array<QuestionTypeImageChoiceResult>>;
  text: Scalars['String']['output'];
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};


export type QuestionTypeImageChoiceResultArgs = {
  min?: InputMaybe<Scalars['Int']['input']>;
  top?: InputMaybe<Scalars['Int']['input']>;
};

export type QuestionTypeImageChoiceOption = {
  __typename?: 'QuestionTypeImageChoiceOption';
  category?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  requireAddress?: Maybe<Scalars['Boolean']['output']>;
  value: Scalars['ID']['output'];
};

export type QuestionTypeImageChoiceResult = {
  __typename?: 'QuestionTypeImageChoiceResult';
  count: Scalars['Int']['output'];
  option: QuestionTypeImageChoiceOption;
};

export type QuestionTypeRange = QuestionInterface & {
  __typename?: 'QuestionTypeRange';
  explanation?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  kind: QuestionTypeRangeKind;
  metadata?: Maybe<Scalars['JSON']['output']>;
  order: Scalars['Int']['output'];
  private: Scalars['Boolean']['output'];
  questionnaire: Questionnaire;
  result?: Maybe<QuestionTypeRangeResult>;
  text: Scalars['String']['output'];
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
  deviation?: Maybe<Scalars['Float']['output']>;
  histogram: Array<QuestionTypeRangeResultBin>;
  mean: Scalars['Float']['output'];
  median: Scalars['Float']['output'];
};


export type QuestionTypeRangeResultHistogramArgs = {
  ticks?: InputMaybe<Scalars['Int']['input']>;
};

export type QuestionTypeRangeResultBin = {
  __typename?: 'QuestionTypeRangeResultBin';
  count: Scalars['Int']['output'];
  x0: Scalars['Float']['output'];
  x1: Scalars['Float']['output'];
};

export type QuestionTypeRangeTick = {
  __typename?: 'QuestionTypeRangeTick';
  label: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type QuestionTypeText = QuestionInterface & {
  __typename?: 'QuestionTypeText';
  explanation?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  maxLength?: Maybe<Scalars['Int']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  order: Scalars['Int']['output'];
  private: Scalars['Boolean']['output'];
  questionnaire: Questionnaire;
  text: Scalars['String']['output'];
  turnout: QuestionTurnout;
  userAnswer?: Maybe<Answer>;
};

export type Questionnaire = {
  __typename?: 'Questionnaire';
  allowedMemberships?: Maybe<Array<VotingMembershipRequirement>>;
  allowedRoles?: Maybe<Array<Scalars['String']['output']>>;
  beginDate: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  questions: Array<QuestionInterface>;
  resubmitAnswers: Scalars['Boolean']['output'];
  revokeSubmissions: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  submissions?: Maybe<SubmissionConnection>;
  submitAnswersImmediately: Scalars['Boolean']['output'];
  turnout?: Maybe<QuestionnaireTurnout>;
  unattributedAnswers: Scalars['Boolean']['output'];
  userHasSubmitted?: Maybe<Scalars['Boolean']['output']>;
  userIsEligible?: Maybe<Scalars['Boolean']['output']>;
  userSubmissionId?: Maybe<Scalars['ID']['output']>;
  userSubmitDate?: Maybe<Scalars['DateTime']['output']>;
};


export type QuestionnaireQuestionsArgs = {
  orderFilter?: InputMaybe<Array<Scalars['Int']['input']>>;
  shuffle?: InputMaybe<Scalars['Int']['input']>;
};


export type QuestionnaireSubmissionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<SubmissionsFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<SubmissionsSortInput>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type QuestionnaireTurnout = {
  __typename?: 'QuestionnaireTurnout';
  eligible: Scalars['Int']['output'];
  submitted: Scalars['Int']['output'];
};

export type Redirection = {
  __typename?: 'Redirection';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  resource?: Maybe<Scalars['JSON']['output']>;
  source: Scalars['String']['output'];
  status: Scalars['Int']['output'];
  target: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type RedirectionConnection = {
  __typename?: 'RedirectionConnection';
  nodes: Array<Redirection>;
  pageInfo: RedirectionPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type RedirectionPageInfo = {
  __typename?: 'RedirectionPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Repo = {
  __typename?: 'Repo';
  commit?: Maybe<Commit>;
  commits: CommitConnection;
  currentPhase: RepoPhase;
  files: Array<RepoFile>;
  id: Scalars['ID']['output'];
  isArchived: Scalars['Boolean']['output'];
  isTemplate: Scalars['Boolean']['output'];
  latestCommit: Commit;
  latestPublications: Array<Maybe<Publication>>;
  memos: Array<Memo>;
  meta: RepoMeta;
  milestones: Array<Milestone>;
  uncommittedChanges: Array<User>;
};


export type RepoCommitArgs = {
  id: Scalars['ID']['input'];
};


export type RepoCommitsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
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
  totalCount: Scalars['Int']['output'];
  /** @deprecated Do not use anymore. Part of GitHub heydays. */
  totalDiskUsage?: Maybe<Scalars['Int']['output']>;
};

export type RepoFile = {
  __typename?: 'RepoFile';
  author: Author;
  createdAt: Scalars['DateTime']['output'];
  destroyedAt?: Maybe<Scalars['DateTime']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  failedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  readyAt?: Maybe<Scalars['DateTime']['output']>;
  status: RepoFileStatus;
  updatedAt: Scalars['DateTime']['output'];
  /** If file is not ready, returns an upload URL */
  url?: Maybe<Scalars['String']['output']>;
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
  briefingUrl?: Maybe<Scalars['String']['output']>;
  creationDeadline?: Maybe<Scalars['DateTime']['output']>;
  productionDeadline?: Maybe<Scalars['DateTime']['output']>;
  publishDate?: Maybe<Scalars['DateTime']['output']>;
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
  color: Scalars['String']['output'];
  key: RepoPhaseKey;
  label: Scalars['String']['output'];
  lock: Scalars['Boolean']['output'];
};

export type RepoPhaseInterface = {
  color: Scalars['String']['output'];
  key: RepoPhaseKey;
  label: Scalars['String']['output'];
  lock: Scalars['Boolean']['output'];
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
  color: Scalars['String']['output'];
  count: Scalars['Int']['output'];
  key: RepoPhaseKey;
  label: Scalars['String']['output'];
  lock: Scalars['Boolean']['output'];
};

export type RepoPublishDateRange = {
  from: Scalars['DateTime']['input'];
  until: Scalars['DateTime']['input'];
};

export type RequestInfo = {
  __typename?: 'RequestInfo';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  ipAddress: Scalars['String']['output'];
  isApp: Scalars['Boolean']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type RequiredUserFields = {
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
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
  max?: InputMaybe<Scalars['DateTime']['input']>;
  min: Scalars['DateTime']['input'];
};

export type RevenueStatsSegments = {
  __typename?: 'RevenueStatsSegments';
  buckets: Array<RevenueStatsSegmentsDateBucket>;
  updatedAt: Scalars['DateTime']['output'];
};

export type RevenueStatsSegmentsBucket = {
  __typename?: 'RevenueStatsSegmentsBucket';
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  /** Share */
  share: Scalars['Float']['output'];
};

export type RevenueStatsSegmentsDateBucket = {
  __typename?: 'RevenueStatsSegmentsDateBucket';
  buckets: Array<RevenueStatsSegmentsBucket>;
  key: Scalars['String']['output'];
};

export type RevenueStatsSurplus = {
  __typename?: 'RevenueStatsSurplus';
  total: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Reward = Goodie | MembershipType;

export type RoleStats = {
  __typename?: 'RoleStats';
  count?: Maybe<Scalars['Int']['output']>;
};

export type SearchAggregation = {
  __typename?: 'SearchAggregation';
  buckets?: Maybe<Array<SearchAggregationBucket>>;
  count?: Maybe<Scalars['Int']['output']>;
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type SearchAggregationBucket = {
  __typename?: 'SearchAggregationBucket';
  count: Scalars['Int']['output'];
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type SearchConnection = {
  __typename?: 'SearchConnection';
  aggregations: Array<SearchAggregation>;
  nodes: Array<SearchNode>;
  pageInfo: SearchPageInfo;
  totalCount: Scalars['Int']['output'];
  trackingId?: Maybe<Scalars['ID']['output']>;
};


export type SearchConnectionAggregationsArgs = {
  keys?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SearchEntity = Comment | Document | DocumentZone | User;

export type SearchFilterInput = {
  audioSourceKind?: InputMaybe<AudioSourceKind>;
  author?: InputMaybe<Scalars['String']['input']>;
  discussion?: InputMaybe<Scalars['Boolean']['input']>;
  dossier?: InputMaybe<Scalars['String']['input']>;
  feed?: InputMaybe<Scalars['Boolean']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  formats?: InputMaybe<Array<Scalars['String']['input']>>;
  hasAudio?: InputMaybe<Scalars['Boolean']['input']>;
  hasDossier?: InputMaybe<Scalars['Boolean']['input']>;
  hasFormat?: InputMaybe<Scalars['Boolean']['input']>;
  hasVideo?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  isSeriesEpisode?: InputMaybe<Scalars['Boolean']['input']>;
  isSeriesMaster?: InputMaybe<Scalars['Boolean']['input']>;
  publishedAt?: InputMaybe<DateRangeInput>;
  repoIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  scheduledAt?: InputMaybe<DateRangeInput>;
  template?: InputMaybe<Scalars['String']['input']>;
  textLength?: InputMaybe<DocumentTextLengths>;
  type?: InputMaybe<SearchTypes>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type SearchGenericFilterInput = {
  key: Scalars['String']['input'];
  not?: InputMaybe<Scalars['Boolean']['input']>;
  value: Scalars['String']['input'];
};

export type SearchHighlight = {
  __typename?: 'SearchHighlight';
  fragments: Array<Scalars['String']['output']>;
  path: Scalars['String']['output'];
};

export type SearchNode = {
  __typename?: 'SearchNode';
  entity: SearchEntity;
  highlights: Array<SearchHighlight>;
  score?: Maybe<Scalars['Float']['output']>;
};

export type SearchPageInfo = {
  __typename?: 'SearchPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
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
  description?: Maybe<Scalars['String']['output']>;
  episodes: Array<Episode>;
  logo?: Maybe<Scalars['String']['output']>;
  logoDark?: Maybe<Scalars['String']['output']>;
  overview?: Maybe<Document>;
  title: Scalars['String']['output'];
};

export type Session = {
  __typename?: 'Session';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  device?: Maybe<Device>;
  email: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  ipAddress: Scalars['String']['output'];
  isCurrent: Scalars['Boolean']['output'];
  phrase?: Maybe<Scalars['String']['output']>;
  userAgent?: Maybe<Scalars['String']['output']>;
};

export enum Sex {
  Both = 'BOTH',
  Female = 'FEMALE',
  Male = 'MALE'
}

export type SharedSecretResponse = {
  __typename?: 'SharedSecretResponse';
  otpAuthUrl: Scalars['String']['output'];
  secret: Scalars['String']['output'];
  svg: Scalars['String']['output'];
};


export type SharedSecretResponseSvgArgs = {
  errorCorrectionLevel?: InputMaybe<QrCodeErrorCorrectionLevel>;
};

export type SignInNotification = {
  __typename?: 'SignInNotification';
  body: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  verificationUrl: Scalars['String']['output'];
};

export type SignInResponse = {
  __typename?: 'SignInResponse';
  alternativeFirstFactors: Array<SignInTokenType>;
  expiresAt: Scalars['DateTime']['output'];
  phrase: Scalars['String']['output'];
  tokenType: SignInTokenType;
};

export type SignInToken = {
  payload: Scalars['String']['input'];
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
  hasPublicProfile: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  portrait?: Maybe<Scalars['String']['output']>;
  sequenceNumber?: Maybe<Scalars['Int']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  statement?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};


export type StatementUserPortraitArgs = {
  properties?: InputMaybe<ImageProperties>;
};

export type StatementUserConnection = {
  __typename?: 'StatementUserConnection';
  nodes: Array<StatementUser>;
  pageInfo?: Maybe<PageInfo>;
  totalCount: Scalars['Int']['output'];
};

export type StringArrayFilter = {
  field: Field;
  values: Array<Scalars['String']['input']>;
};

export type Submission = {
  __typename?: 'Submission';
  answers: AnswerConnection;
  createdAt: Scalars['DateTime']['output'];
  displayAuthor: DisplayUser;
  id: Scalars['ID']['output'];
  questionnaire: Questionnaire;
  updatedAt: Scalars['DateTime']['output'];
};

export type SubmissionConnection = {
  __typename?: 'SubmissionConnection';
  nodes: Array<Submission>;
  pageInfo: SubmissionPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SubmissionFilterAnswer = {
  /** Question wich must be answered */
  questionId: Scalars['ID']['input'];
  /** Expected amount of characters in answer given */
  valueLength?: InputMaybe<SubmissionFilterAnswerValueLength>;
};

export type SubmissionFilterAnswerValueLength = {
  /** Expect a maximum amount of characters in answer given */
  max?: InputMaybe<Scalars['Int']['input']>;
  /** Expect a minimum amount of characters in answer given */
  min?: InputMaybe<Scalars['Int']['input']>;
};

export type SubmissionPageInfo = {
  __typename?: 'SubmissionPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type SubmissionsFilterInput = {
  /** Return only submissions with these answered questions */
  answers?: InputMaybe<Array<InputMaybe<SubmissionFilterAnswer>>>;
  /** Return only submission with this ID */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** Omit submission with this ID */
  not?: InputMaybe<Scalars['ID']['input']>;
  /** Omit submissions with these IDs */
  notSubmissionIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Return only submissions with these IDs */
  submissionIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Return submission by these user IDs */
  userIds?: InputMaybe<Array<Scalars['ID']['input']>>;
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
  active: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  filters?: Maybe<Array<EventObjectType>>;
  id: Scalars['ID']['output'];
  isEligibleForNotifications: Scalars['Boolean']['output'];
  object?: Maybe<SubscriptionObject>;
  subject: User;
  updatedAt: Scalars['DateTime']['output'];
};

export type SubscriptionConnection = {
  __typename?: 'SubscriptionConnection';
  nodes: Array<Subscription>;
  pageInfo?: Maybe<SubscriptionPageInfo>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type SubscriptionObject = Discussion | Document | User;

export enum SubscriptionObjectType {
  Document = 'Document',
  User = 'User'
}

export type SubscriptionPageInfo = {
  __typename?: 'SubscriptionPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type SyncPledgeResponse = {
  __typename?: 'SyncPledgeResponse';
  pledgeStatus: PledgeStatus;
  updatedPledge: Scalars['Boolean']['output'];
};

export type TwitterEmbed = {
  __typename?: 'TwitterEmbed';
  createdAt: Scalars['DateTime']['output'];
  html: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  more?: Maybe<Scalars['String']['output']>;
  playable: Scalars['Boolean']['output'];
  retrievedAt: Scalars['DateTime']['output'];
  text: Scalars['String']['output'];
  url: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  userName: Scalars['String']['output'];
  userProfileImageUrl: Scalars['String']['output'];
  userScreenName: Scalars['String']['output'];
};

export type UnauthorizedSession = {
  __typename?: 'UnauthorizedSession';
  enabledSecondFactors: Array<Maybe<SignInTokenType>>;
  newUser?: Maybe<Scalars['Boolean']['output']>;
  requiredConsents: Array<Scalars['String']['output']>;
  requiredFields: Array<Scalars['String']['output']>;
  session: Session;
};

export type UncommittedChangeUpdate = {
  __typename?: 'UncommittedChangeUpdate';
  action: Action;
  repoId: Scalars['ID']['output'];
  user: User;
};

export type Update = {
  __typename?: 'Update';
  metaDescription?: Maybe<Scalars['String']['output']>;
  publishedDateTime?: Maybe<Scalars['DateTime']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  socialMediaImage?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type User = {
  __typename?: 'User';
  /** List of granted memberships by User */
  accessCampaigns?: Maybe<Array<AccessCampaign>>;
  /** List of memberships a User was granted */
  accessGrants?: Maybe<Array<AccessGrant>>;
  accessToken?: Maybe<Scalars['ID']['output']>;
  activeMembership?: Maybe<Membership>;
  address?: Maybe<Address>;
  adminNotes?: Maybe<Scalars['String']['output']>;
  age?: Maybe<Scalars['Int']['output']>;
  ageAccessRole?: Maybe<AccessRole>;
  /**
   * Returns a queue with audio items point to playable content. Use
   * mutations `addAudioQueueItem`, `moveAudioQueueItem`,
   * `removeAudioQueueItem` or `clearAudioQueue` to modify queue.
   */
  audioQueue?: Maybe<Array<AudioQueueItem>>;
  badges?: Maybe<Array<Maybe<Badge>>>;
  biography?: Maybe<Scalars['String']['output']>;
  biographyContent?: Maybe<Scalars['JSON']['output']>;
  birthday?: Maybe<Scalars['Date']['output']>;
  calendar?: Maybe<Calendar>;
  /**
   * Call to actions for a user based on events, campaigns, etc.
   * Can target a specific user or a group of users.
   */
  callToActions: Array<CallToAction>;
  candidacies: Array<Candidacy>;
  cards: CardConnection;
  checkMembershipSubscriptions: Scalars['Boolean']['output'];
  collection?: Maybe<Collection>;
  collectionItems: CollectionItemConnection;
  collections: Array<Collection>;
  comments: CommentConnection;
  createdAt: Scalars['DateTime']['output'];
  credentials: Array<Credential>;
  customPackages?: Maybe<Array<Package>>;
  defaultDiscussionNotificationOption?: Maybe<DiscussionNotificationOption>;
  defaultPaymentSource?: Maybe<PaymentSource>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  devices: Array<Device>;
  disclosures?: Maybe<Scalars['String']['output']>;
  discussionNotificationChannels: Array<DiscussionNotificationChannel>;
  documents: DocumentConnection;
  email?: Maybe<Scalars['String']['output']>;
  emailAccessRole?: Maybe<AccessRole>;
  enabledFirstFactors: Array<SignInTokenType>;
  enabledSecondFactors: Array<SignInTokenType>;
  facebookId?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  futureCampaignAboCount?: Maybe<Scalars['Int']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  hasAddress?: Maybe<Scalars['Boolean']['output']>;
  hasConsentedTo?: Maybe<Scalars['Boolean']['output']>;
  hasDormantMembership: Scalars['Boolean']['output'];
  hasPublicProfile?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  initials?: Maybe<Scalars['String']['output']>;
  isAdminUnlisted?: Maybe<Scalars['Boolean']['output']>;
  isBonusEligable: Scalars['Boolean']['output'];
  isEligibleForProfile?: Maybe<Scalars['Boolean']['output']>;
  isListed: Scalars['Boolean']['output'];
  isSuspended?: Maybe<Scalars['Boolean']['output']>;
  isUserOfCurrentSession: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  mailbox?: Maybe<MailboxConnection>;
  memberships: Array<Membership>;
  name?: Maybe<Scalars['String']['output']>;
  newsletterSettings: NewsletterSettings;
  /** @deprecated use `defaultPaymentSource` instead */
  paymentSources: Array<PaymentSource>;
  pgpPublicKey?: Maybe<Scalars['String']['output']>;
  pgpPublicKeyId?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  phoneNumberAccessRole?: Maybe<AccessRole>;
  phoneNumberNote?: Maybe<Scalars['String']['output']>;
  pledges: Array<Pledge>;
  portrait?: Maybe<Scalars['String']['output']>;
  preferredFirstFactor?: Maybe<SignInTokenType>;
  prolitterisId?: Maybe<Scalars['String']['output']>;
  prolongBeforeDate?: Maybe<Scalars['DateTime']['output']>;
  publicUrl?: Maybe<Scalars['String']['output']>;
  roles: Array<Scalars['String']['output']>;
  sequenceNumber?: Maybe<Scalars['Int']['output']>;
  sessions?: Maybe<Array<Session>>;
  slug?: Maybe<Scalars['String']['output']>;
  statement?: Maybe<Scalars['String']['output']>;
  subscribedBy: SubscriptionConnection;
  subscribedByMe?: Maybe<Subscription>;
  subscribedTo: SubscriptionConnection;
  suspendedUntil?: Maybe<Scalars['DateTime']['output']>;
  suspensions?: Maybe<Array<DiscussionSuspension>>;
  twitterHandle?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  username?: Maybe<Scalars['String']['output']>;
};


export type UserAccessCampaignsArgs = {
  withPast?: InputMaybe<Scalars['Boolean']['input']>;
};


export type UserAccessGrantsArgs = {
  withPast?: InputMaybe<Scalars['Boolean']['input']>;
};


export type UserAccessTokenArgs = {
  scope: AccessTokenScope;
};


export type UserCalendarArgs = {
  slug: Scalars['String']['input'];
};


export type UserCardsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<CardFiltersInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  focus?: InputMaybe<Array<Scalars['ID']['input']>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<CardSortInput>;
};


export type UserCollectionArgs = {
  name: Scalars['String']['input'];
};


export type UserCollectionItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  lastDays?: InputMaybe<Scalars['Int']['input']>;
  names: Array<Scalars['String']['input']>;
  progress?: InputMaybe<ProgressState>;
  uniqueDocuments?: InputMaybe<Scalars['Boolean']['input']>;
};


export type UserCommentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type UserCustomPackagesArgs = {
  crowdfundingName?: InputMaybe<Scalars['String']['input']>;
};


export type UserDocumentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  feed?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type UserHasConsentedToArgs = {
  name: Scalars['String']['input'];
};


export type UserMailboxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<MailboxFiltersInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type UserPortraitArgs = {
  properties?: InputMaybe<ImageProperties>;
  size?: InputMaybe<PortraitSize>;
};


export type UserSubscribedByArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  onlyMe?: InputMaybe<Scalars['Boolean']['input']>;
};


export type UserSubscribedToArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  objectType?: InputMaybe<SubscriptionObjectType>;
};


export type UserSuspensionsArgs = {
  withInactive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  nodes: Array<Maybe<User>>;
  pageInfo?: Maybe<PageInfo>;
  totalCount: Scalars['Int']['output'];
};

export type UserInput = {
  birthday?: InputMaybe<Scalars['Date']['input']>;
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type Users = {
  __typename?: 'Users';
  count: Scalars['Int']['output'];
  items: Array<User>;
};

export type Video = {
  __typename?: 'Video';
  hls: Scalars['String']['output'];
  mp4: Scalars['String']['output'];
  poster?: Maybe<Scalars['String']['output']>;
  subtitles?: Maybe<Scalars['String']['output']>;
  youtube?: Maybe<Scalars['String']['output']>;
};

export type VideoInput = {
  hls: Scalars['String']['input'];
  mp4: Scalars['String']['input'];
  poster?: InputMaybe<Scalars['String']['input']>;
  subtitles?: InputMaybe<Scalars['String']['input']>;
  youtube?: InputMaybe<Scalars['String']['input']>;
};

export type VimeoEmbed = PlayableMedia & {
  __typename?: 'VimeoEmbed';
  aspectRatio?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  durationMs: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  mediaId: Scalars['ID']['output'];
  platform: Scalars['String']['output'];
  retrievedAt: Scalars['DateTime']['output'];
  src?: Maybe<VimeoSrc>;
  thumbnail: Scalars['String']['output'];
  title: Scalars['String']['output'];
  userName: Scalars['String']['output'];
  userProfileImageUrl?: Maybe<Scalars['String']['output']>;
  userProgress?: Maybe<MediaProgress>;
  userUrl: Scalars['String']['output'];
};

export type VimeoSrc = {
  __typename?: 'VimeoSrc';
  hls?: Maybe<Scalars['String']['output']>;
  mp4?: Maybe<Scalars['String']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
};

export type Voting = VotingInterface & {
  __typename?: 'Voting';
  allowEmptyBallots: Scalars['Boolean']['output'];
  allowedMemberships?: Maybe<Array<VotingMembershipRequirement>>;
  allowedRoles?: Maybe<Array<Scalars['String']['output']>>;
  beginDate: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  discussion?: Maybe<Discussion>;
  endDate: Scalars['DateTime']['output'];
  groupSlug?: Maybe<Scalars['String']['output']>;
  groupTurnout?: Maybe<VotingTurnout>;
  id: Scalars['ID']['output'];
  liveResult: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  options: Array<VotingOption>;
  requireAddress: Scalars['Boolean']['output'];
  result?: Maybe<VotingResult>;
  slug: Scalars['String']['output'];
  turnout: VotingTurnout;
  userHasSubmitted?: Maybe<Scalars['Boolean']['output']>;
  userIsEligible?: Maybe<Scalars['Boolean']['output']>;
  userSubmitDate?: Maybe<Scalars['DateTime']['output']>;
};

export type VotingBallotInput = {
  optionId?: InputMaybe<Scalars['ID']['input']>;
  votingId: Scalars['ID']['input'];
};

export type VotingInput = {
  allowEmptyBallots?: InputMaybe<Scalars['Boolean']['input']>;
  allowedMemberships?: InputMaybe<Array<VotingMembershipRequirementInput>>;
  allowedRoles?: InputMaybe<Array<Scalars['String']['input']>>;
  beginDate: Scalars['DateTime']['input'];
  description: Scalars['String']['input'];
  endDate: Scalars['DateTime']['input'];
  groupSlug?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  options: Array<VotingOptionInput>;
  slug: Scalars['String']['input'];
};

export type VotingInterface = {
  allowEmptyBallots: Scalars['Boolean']['output'];
  allowedMemberships?: Maybe<Array<VotingMembershipRequirement>>;
  allowedRoles?: Maybe<Array<Scalars['String']['output']>>;
  beginDate: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  requireAddress: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  userHasSubmitted?: Maybe<Scalars['Boolean']['output']>;
  userIsEligible?: Maybe<Scalars['Boolean']['output']>;
  userSubmitDate?: Maybe<Scalars['DateTime']['output']>;
};

export type VotingMembershipRequirement = {
  __typename?: 'VotingMembershipRequirement';
  createdBefore: Scalars['DateTime']['output'];
  membershipTypeId: Scalars['ID']['output'];
};

export type VotingMembershipRequirementInput = {
  createdBefore: Scalars['DateTime']['input'];
  membershipTypeId: Scalars['ID']['input'];
};

export type VotingOption = {
  __typename?: 'VotingOption';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type VotingOptionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type VotingOptionResult = {
  __typename?: 'VotingOptionResult';
  count: Scalars['Int']['output'];
  option?: Maybe<VotingOption>;
  winner?: Maybe<Scalars['Boolean']['output']>;
};

export type VotingResult = {
  __typename?: 'VotingResult';
  createdAt: Scalars['DateTime']['output'];
  groupTurnout?: Maybe<VotingTurnout>;
  message?: Maybe<Scalars['String']['output']>;
  options: Array<VotingOptionResult>;
  turnout: VotingTurnout;
  updatedAt: Scalars['DateTime']['output'];
  video?: Maybe<Video>;
};

export type VotingTurnout = {
  __typename?: 'VotingTurnout';
  eligible: Scalars['Int']['output'];
  submitted: Scalars['Int']['output'];
};

export type WebNotification = {
  __typename?: 'WebNotification';
  body: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  tag: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type YoutubeEmbed = PlayableMedia & {
  __typename?: 'YoutubeEmbed';
  aspectRatio?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  durationMs: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  mediaId: Scalars['ID']['output'];
  platform: Scalars['String']['output'];
  retrievedAt: Scalars['DateTime']['output'];
  thumbnail: Scalars['String']['output'];
  title: Scalars['String']['output'];
  userName: Scalars['String']['output'];
  userProfileImageUrl?: Maybe<Scalars['String']['output']>;
  userProgress?: Maybe<MediaProgress>;
  userUrl: Scalars['String']['output'];
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
  authorizeSession: Scalars['Boolean']['output'];
  bookCalendarSlot: CalendarSlot;
  cancelCalendarSlot: CalendarSlot;
  cancelCandidacy: Election;
  cancelMembership: Membership;
  cancelPledge?: Maybe<Pledge>;
  /** Claim a granted membership with a voucher code */
  claimAccess: AccessGrant;
  claimCard: Card;
  claimMembership: Scalars['Boolean']['output'];
  /** Clear all items in `User.audioQueue`. */
  clearAudioQueue: Array<AudioQueueItem>;
  clearCollection: Collection;
  clearProgress: Collection;
  clearSession: Scalars['Boolean']['output'];
  clearSessions: Scalars['Boolean']['output'];
  commit: Commit;
  createDiscussion: Scalars['ID']['output'];
  createElection: Election;
  createVoting: Voting;
  deleteRedirection: Scalars['Boolean']['output'];
  deleteUser?: Maybe<User>;
  denySession: Scalars['Boolean']['output'];
  downvoteComment: Comment;
  editComment: Comment;
  editMemo: Memo;
  editRepoMeta: Repo;
  featureComment: Comment;
  finalizeElection: ElectionResult;
  finalizeQuestionnaire: Scalars['JSON']['output'];
  finalizeVoting: VotingResult;
  generateDerivative: Derivative;
  generateMembership: Membership;
  /** Grant a membership */
  grantAccess: AccessGrant;
  hidePostfinancePayment: PostfinancePayment;
  importPostfinanceCSV: Scalars['String']['output'];
  initTOTPSharedSecret: SharedSecretResponse;
  /** Invalidate access grant */
  invalidateAccess: Scalars['Boolean']['output'];
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
  reclaimPledge: Scalars['Boolean']['output'];
  refreshQuestionnaireResult?: Maybe<Questionnaire>;
  rematchPayments: Scalars['String']['output'];
  /** Move an existing item from `User.audioQueue`. */
  removeAudioQueueItem: Array<AudioQueueItem>;
  removeCredentialVerification?: Maybe<Credential>;
  removeDevice: Scalars['Boolean']['output'];
  removeDocumentFromCollection?: Maybe<CollectionItem>;
  removeDocumentProgress?: Maybe<DocumentProgress>;
  removeMediaProgress?: Maybe<MediaProgress>;
  removeMilestone: Scalars['Boolean']['output'];
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
  reportUser: Scalars['Boolean']['output'];
  /** Request access for one-self */
  requestAccess: AccessGrant;
  requestNewsletterSubscription: Scalars['Boolean']['output'];
  resetAnswer: QuestionInterface;
  resetMembership: Membership;
  resetQuestionnaire: Questionnaire;
  resolvePledgeToPayment: Pledge;
  resubscribeEmail: NewsletterSettings;
  /** Revoke a granted membership */
  revokeAccess: Scalars['Boolean']['output'];
  revokeConsent: User;
  revokeQuestionnaire: Questionnaire;
  rollAccessKey: User;
  /** @deprecated not used in app anymore. Will be evicted if no API calls are tracked anymore. */
  rollDeviceToken: Device;
  sendPaymentReminders: Scalars['String']['output'];
  sendPhoneNumberVerificationCode: Scalars['Boolean']['output'];
  sendTestNotification: Scalars['Boolean']['output'];
  sendTestPushNotification: Scalars['Boolean']['output'];
  setDefaultPaymentMethod: Array<PaymentSource>;
  setDiscussionPreferences: Discussion;
  setMembershipAutoPay: Membership;
  signIn: SignInResponse;
  signOut: Scalars['Boolean']['output'];
  startChallenge: Scalars['Boolean']['output'];
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
  uncommittedChanges: Scalars['Boolean']['output'];
  unpublish: Scalars['Boolean']['output'];
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
  updateTwoFactorAuthentication: Scalars['Boolean']['output'];
  updateUser: User;
  upsertDevice: Device;
  upsertDocumentProgress: DocumentProgress;
  upsertMediaProgress: MediaProgress;
  upvoteComment: Comment;
  validateTOTPSharedSecret: Scalars['Boolean']['output'];
  verifyCredential?: Maybe<Credential>;
  verifyPhoneNumber: Scalars['Boolean']['output'];
};


export type MutationsAcknowledgeCallToActionArgs = {
  id: Scalars['ID']['input'];
  response?: InputMaybe<Scalars['JSON']['input']>;
};


export type MutationsActivateMembershipArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsAddAudioQueueItemArgs = {
  entity: AudioQueueEntityInput;
  sequence?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationsAddDocumentToCollectionArgs = {
  collectionName: Scalars['String']['input'];
  documentId: Scalars['ID']['input'];
};


export type MutationsAddPaymentMethodArgs = {
  companyId: Scalars['ID']['input'];
  stripePlatformPaymentMethodId: Scalars['ID']['input'];
};


export type MutationsAddPaymentSourceArgs = {
  pspPayload: Scalars['JSON']['input'];
  sourceId: Scalars['String']['input'];
};


export type MutationsAddRedirectionArgs = {
  resource?: InputMaybe<Scalars['JSON']['input']>;
  source: Scalars['String']['input'];
  status?: InputMaybe<Scalars['Int']['input']>;
  target: Scalars['String']['input'];
};


export type MutationsAddUserToRoleArgs = {
  role: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsAnonymizeUserAnswersArgs = {
  questionnaireId: Scalars['ID']['input'];
};


export type MutationsAppendPeriodArgs = {
  duration: Scalars['Int']['input'];
  durationUnit: MembershipTypeInterval;
  id: Scalars['ID']['input'];
};


export type MutationsArchiveArgs = {
  repoIds: Array<Scalars['ID']['input']>;
  unpublish?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationsAuthorizeSessionArgs = {
  consents?: InputMaybe<Array<Scalars['String']['input']>>;
  email: Scalars['String']['input'];
  requiredFields?: InputMaybe<RequiredUserFields>;
  tokens: Array<SignInToken>;
};


export type MutationsBookCalendarSlotArgs = {
  id: Scalars['ID']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsCancelCalendarSlotArgs = {
  id: Scalars['ID']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsCancelCandidacyArgs = {
  slug: Scalars['String']['input'];
};


export type MutationsCancelMembershipArgs = {
  details: CancellationInput;
  id: Scalars['ID']['input'];
  immediately?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationsCancelPledgeArgs = {
  pledgeId: Scalars['ID']['input'];
};


export type MutationsClaimAccessArgs = {
  payload?: InputMaybe<Scalars['JSON']['input']>;
  voucherCode: Scalars['String']['input'];
};


export type MutationsClaimCardArgs = {
  accessToken: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  payload?: InputMaybe<Scalars['JSON']['input']>;
  portrait?: InputMaybe<Scalars['String']['input']>;
  statement: Scalars['String']['input'];
};


export type MutationsClaimMembershipArgs = {
  voucherCode: Scalars['String']['input'];
};


export type MutationsClearCollectionArgs = {
  collectionName: Scalars['String']['input'];
};


export type MutationsClearSessionArgs = {
  sessionId: Scalars['ID']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsClearSessionsArgs = {
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsCommitArgs = {
  document: DocumentInput;
  isTemplate?: InputMaybe<Scalars['Boolean']['input']>;
  message: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['ID']['input']>;
  repoId: Scalars['ID']['input'];
};


export type MutationsCreateDiscussionArgs = {
  anonymity: Permission;
  maxLength?: InputMaybe<Scalars['Int']['input']>;
  minInterval?: InputMaybe<Scalars['Int']['input']>;
  tagRequired: Scalars['Boolean']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationsCreateElectionArgs = {
  electionInput: ElectionInput;
};


export type MutationsCreateVotingArgs = {
  votingInput: VotingInput;
};


export type MutationsDeleteRedirectionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsDeleteUserArgs = {
  unpublishComments?: InputMaybe<Scalars['Boolean']['input']>;
  userId: Scalars['ID']['input'];
};


export type MutationsDenySessionArgs = {
  email: Scalars['String']['input'];
  token: SignInToken;
};


export type MutationsDownvoteCommentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsEditCommentArgs = {
  content: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationsEditMemoArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  text: Scalars['String']['input'];
};


export type MutationsEditRepoMetaArgs = {
  briefingUrl?: InputMaybe<Scalars['String']['input']>;
  creationDeadline?: InputMaybe<Scalars['DateTime']['input']>;
  productionDeadline?: InputMaybe<Scalars['DateTime']['input']>;
  publishDate?: InputMaybe<Scalars['DateTime']['input']>;
  repoId: Scalars['ID']['input'];
};


export type MutationsFeatureCommentArgs = {
  content?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  targets?: InputMaybe<Array<CommentFeaturedTarget>>;
};


export type MutationsFinalizeElectionArgs = {
  candidacyIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  dry: Scalars['Boolean']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  video?: InputMaybe<VideoInput>;
};


export type MutationsFinalizeQuestionnaireArgs = {
  dry: Scalars['Boolean']['input'];
  slug: Scalars['String']['input'];
};


export type MutationsFinalizeVotingArgs = {
  dry: Scalars['Boolean']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  video?: InputMaybe<VideoInput>;
  winner?: InputMaybe<Scalars['String']['input']>;
};


export type MutationsGenerateDerivativeArgs = {
  commitId: Scalars['ID']['input'];
};


export type MutationsGenerateMembershipArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationsGrantAccessArgs = {
  campaignId: Scalars['ID']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
};


export type MutationsHidePostfinancePaymentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsImportPostfinanceCsvArgs = {
  csv: Scalars['String']['input'];
};


export type MutationsInvalidateAccessArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsManuallyMatchPostfinancePaymentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsMarkNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsMergeUsersArgs = {
  sourceUserId: Scalars['ID']['input'];
  targetUserId: Scalars['ID']['input'];
};


export type MutationsMoveAudioQueueItemArgs = {
  id: Scalars['ID']['input'];
  sequence: Scalars['Int']['input'];
};


export type MutationsMoveMembershipArgs = {
  membershipId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationsMovePledgeArgs = {
  pledgeId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationsPayPledgeArgs = {
  pledgePayment?: InputMaybe<PledgePaymentInput>;
};


export type MutationsPlaceMilestoneArgs = {
  commitId: Scalars['ID']['input'];
  message: Scalars['String']['input'];
  name: Scalars['String']['input'];
  repoId: Scalars['ID']['input'];
};


export type MutationsPreferredFirstFactorArgs = {
  tokenType?: InputMaybe<SignInTokenType>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsPublishArgs = {
  commitId: Scalars['ID']['input'];
  repoId: Scalars['ID']['input'];
  settings: PublishSettings;
};


export type MutationsPublishCredentialArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
};


export type MutationsPublishMemoArgs = {
  commitId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  repoId: Scalars['ID']['input'];
  text: Scalars['String']['input'];
};


export type MutationsReactivateMembershipArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsReclaimPledgeArgs = {
  pledgeId: Scalars['ID']['input'];
};


export type MutationsRefreshQuestionnaireResultArgs = {
  slug: Scalars['String']['input'];
};


export type MutationsRemoveAudioQueueItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsRemoveCredentialVerificationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsRemoveDeviceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsRemoveDocumentFromCollectionArgs = {
  collectionName: Scalars['String']['input'];
  documentId: Scalars['ID']['input'];
};


export type MutationsRemoveDocumentProgressArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationsRemoveMediaProgressArgs = {
  mediaId: Scalars['ID']['input'];
};


export type MutationsRemoveMilestoneArgs = {
  name: Scalars['String']['input'];
  repoId: Scalars['ID']['input'];
};


export type MutationsRemoveUserFromRoleArgs = {
  role: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsReorderAudioQueueArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationsRepoFileDestroyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsRepoFileMakePublicArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsRepoFileUploadAbortArgs = {
  error: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};


export type MutationsRepoFileUploadBeginArgs = {
  name: Scalars['String']['input'];
  repoId: Scalars['ID']['input'];
};


export type MutationsRepoFileUploadCommitArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsReportCommentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsReportUserArgs = {
  reason: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationsRequestAccessArgs = {
  campaignId: Scalars['ID']['input'];
  payload?: InputMaybe<Scalars['JSON']['input']>;
};


export type MutationsRequestNewsletterSubscriptionArgs = {
  context: Scalars['String']['input'];
  email: Scalars['String']['input'];
  name: NewsletterName;
};


export type MutationsResetAnswerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsResetMembershipArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsResetQuestionnaireArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsResolvePledgeToPaymentArgs = {
  pledgeId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationsResubscribeEmailArgs = {
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsRevokeAccessArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsRevokeConsentArgs = {
  name: Scalars['String']['input'];
};


export type MutationsRevokeQuestionnaireArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsRollAccessKeyArgs = {
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsRollDeviceTokenArgs = {
  newToken: Scalars['String']['input'];
  oldToken?: InputMaybe<Scalars['String']['input']>;
};


export type MutationsSendPaymentRemindersArgs = {
  dryRun: Scalars['Boolean']['input'];
};


export type MutationsSendTestNotificationArgs = {
  commentId?: InputMaybe<Scalars['ID']['input']>;
  repoId?: InputMaybe<Scalars['ID']['input']>;
  simulateAllPossibleSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationsSendTestPushNotificationArgs = {
  body?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};


export type MutationsSetDefaultPaymentMethodArgs = {
  stripePlatformPaymentMethodId: Scalars['ID']['input'];
};


export type MutationsSetDiscussionPreferencesArgs = {
  discussionPreferences: DiscussionPreferencesInput;
  id: Scalars['ID']['input'];
};


export type MutationsSetMembershipAutoPayArgs = {
  autoPay: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};


export type MutationsSignInArgs = {
  accessToken?: InputMaybe<Scalars['ID']['input']>;
  consents?: InputMaybe<Array<Scalars['String']['input']>>;
  context?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  tokenType?: InputMaybe<SignInTokenType>;
};


export type MutationsStartChallengeArgs = {
  sessionId: Scalars['ID']['input'];
  type: SignInTokenType;
};


export type MutationsSubmitAnswerArgs = {
  answer: AnswerInput;
};


export type MutationsSubmitAnswerUnattributedArgs = {
  answer: AnswerInput;
  pseudonym: Scalars['ID']['input'];
};


export type MutationsSubmitCandidacyArgs = {
  credential: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};


export type MutationsSubmitCommentArgs = {
  content: Scalars['String']['input'];
  discussionId: Scalars['ID']['input'];
  discussionPreferences?: InputMaybe<DiscussionPreferencesInput>;
  id?: InputMaybe<Scalars['ID']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationsSubmitConsentArgs = {
  name: Scalars['String']['input'];
};


export type MutationsSubmitElectionBallotArgs = {
  candidacyIds: Array<Scalars['ID']['input']>;
  electionId: Scalars['ID']['input'];
};


export type MutationsSubmitPledgeArgs = {
  consents?: InputMaybe<Array<Scalars['String']['input']>>;
  pledge?: InputMaybe<PledgeInput>;
};


export type MutationsSubmitQuestionnaireArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsSubmitVotingBallotArgs = {
  optionId?: InputMaybe<Scalars['ID']['input']>;
  votingId: Scalars['ID']['input'];
};


export type MutationsSubscribeArgs = {
  filters?: InputMaybe<Array<EventObjectType>>;
  objectId: Scalars['ID']['input'];
  type: SubscriptionObjectType;
};


export type MutationsSuspendUserArgs = {
  id: Scalars['ID']['input'];
  interval?: InputMaybe<Scalars['String']['input']>;
  intervalAmount?: InputMaybe<Scalars['Int']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationsSyncPaymentIntentArgs = {
  companyId: Scalars['ID']['input'];
  stripePaymentIntentId: Scalars['ID']['input'];
};


export type MutationsUncommittedChangesArgs = {
  action: Action;
  repoId: Scalars['ID']['input'];
};


export type MutationsUnpublishArgs = {
  repoId: Scalars['ID']['input'];
};


export type MutationsUnpublishCommentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsUnpublishMemoArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsUnsubscribeArgs = {
  filters?: InputMaybe<Array<EventObjectType>>;
  subscriptionId: Scalars['ID']['input'];
};


export type MutationsUnsuspendUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsUnvoteCommentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsUpdateAddressArgs = {
  address: AddressInput;
  id: Scalars['ID']['input'];
};


export type MutationsUpdateAdminNotesArgs = {
  notes?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
};


export type MutationsUpdateCardArgs = {
  id: Scalars['ID']['input'];
  payload?: InputMaybe<Scalars['JSON']['input']>;
  portrait?: InputMaybe<Scalars['String']['input']>;
  statement: Scalars['String']['input'];
};


export type MutationsUpdateDiscussionArgs = {
  closed?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationsUpdateEmailArgs = {
  email: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsUpdateMeArgs = {
  address?: InputMaybe<AddressInput>;
  ageAccessRole?: InputMaybe<AccessRole>;
  biography?: InputMaybe<Scalars['String']['input']>;
  birthday?: InputMaybe<Scalars['Date']['input']>;
  disclosures?: InputMaybe<Scalars['String']['input']>;
  emailAccessRole?: InputMaybe<AccessRole>;
  facebookId?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  hasPublicProfile?: InputMaybe<Scalars['Boolean']['input']>;
  isListed?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  pgpPublicKey?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  phoneNumberAccessRole?: InputMaybe<AccessRole>;
  phoneNumberNote?: InputMaybe<Scalars['String']['input']>;
  portrait?: InputMaybe<Scalars['String']['input']>;
  prolitterisId?: InputMaybe<Scalars['String']['input']>;
  publicUrl?: InputMaybe<Scalars['String']['input']>;
  statement?: InputMaybe<Scalars['String']['input']>;
  twitterHandle?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};


export type MutationsUpdateMembershipCancellationArgs = {
  details: CancellationInput;
  id: Scalars['ID']['input'];
};


export type MutationsUpdateNewsletterSubscriptionArgs = {
  consents?: InputMaybe<Array<Scalars['String']['input']>>;
  email?: InputMaybe<Scalars['String']['input']>;
  mac?: InputMaybe<Scalars['String']['input']>;
  name: NewsletterName;
  subscribed: Scalars['Boolean']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationsUpdateNotificationSettingsArgs = {
  defaultDiscussionNotificationOption?: InputMaybe<DiscussionNotificationOption>;
  discussionNotificationChannels?: InputMaybe<Array<DiscussionNotificationChannel>>;
};


export type MutationsUpdatePaymentArgs = {
  paymentId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  status: PaymentStatus;
};


export type MutationsUpdatePostfinancePaymentArgs = {
  mitteilung: Scalars['String']['input'];
  pfpId: Scalars['ID']['input'];
};


export type MutationsUpdateRedirectionArgs = {
  id: Scalars['ID']['input'];
  resource?: InputMaybe<Scalars['JSON']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
  target?: InputMaybe<Scalars['String']['input']>;
};


export type MutationsUpdateTwoFactorAuthenticationArgs = {
  enabled: Scalars['Boolean']['input'];
  type: SignInTokenType;
};


export type MutationsUpdateUserArgs = {
  address?: InputMaybe<AddressInput>;
  birthday?: InputMaybe<Scalars['Date']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
};


export type MutationsUpsertDeviceArgs = {
  information: DeviceInformationInput;
  token: Scalars['ID']['input'];
};


export type MutationsUpsertDocumentProgressArgs = {
  documentId: Scalars['ID']['input'];
  nodeId: Scalars['String']['input'];
  percentage: Scalars['Float']['input'];
};


export type MutationsUpsertMediaProgressArgs = {
  mediaId: Scalars['ID']['input'];
  secs: Scalars['Float']['input'];
};


export type MutationsUpvoteCommentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsValidateTotpSharedSecretArgs = {
  totp?: InputMaybe<Scalars['String']['input']>;
};


export type MutationsVerifyCredentialArgs = {
  id: Scalars['ID']['input'];
};


export type MutationsVerifyPhoneNumberArgs = {
  verificationCode: Scalars['String']['input'];
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
  checkUsername?: Maybe<Scalars['Boolean']['output']>;
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
  paymentsCSV: Scalars['String']['output'];
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
  id: Scalars['ID']['input'];
};


export type QueriesActiveDiscussionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  lastDays: Scalars['Int']['input'];
};


export type QueriesAdminUsersArgs = {
  limit: Scalars['Int']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueriesCancellationCategoriesArgs = {
  showMore?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueriesCardArgs = {
  accessToken?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueriesCardGroupArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueriesCardGroupsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueriesCardsArgs = {
  accessToken?: InputMaybe<Scalars['ID']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<CardFiltersInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  focus?: InputMaybe<Array<Scalars['ID']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<CardSortInput>;
};


export type QueriesCheckUsernameArgs = {
  username?: InputMaybe<Scalars['String']['input']>;
};


export type QueriesCommentArgs = {
  id: Scalars['ID']['input'];
};


export type QueriesCommentPreviewArgs = {
  content: Scalars['String']['input'];
  discussionId: Scalars['ID']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueriesCommentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  discussionId?: InputMaybe<Scalars['ID']['input']>;
  discussionIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  featuredTarget?: InputMaybe<CommentFeaturedTarget>;
  first?: InputMaybe<Scalars['Int']['input']>;
  focusId?: InputMaybe<Scalars['ID']['input']>;
  lastId?: InputMaybe<Scalars['ID']['input']>;
  orderBy?: InputMaybe<DiscussionOrder>;
  orderDirection?: InputMaybe<OrderDirection>;
  toDepth?: InputMaybe<Scalars['Int']['input']>;
};


export type QueriesCrowdfundingArgs = {
  name: Scalars['String']['input'];
};


export type QueriesDiscussionArgs = {
  id: Scalars['ID']['input'];
};


export type QueriesDocumentArgs = {
  apiKey?: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
};


export type QueriesDocumentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  apiKey?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  dossier?: InputMaybe<Scalars['String']['input']>;
  feed?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  formats?: InputMaybe<Array<Scalars['String']['input']>>;
  hasDossier?: InputMaybe<Scalars['Boolean']['input']>;
  hasFormat?: InputMaybe<Scalars['Boolean']['input']>;
  hasSection?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  repoIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  section?: InputMaybe<Scalars['String']['input']>;
  template?: InputMaybe<Scalars['String']['input']>;
};


export type QueriesDraftPledgeArgs = {
  id: Scalars['ID']['input'];
};


export type QueriesElectionArgs = {
  slug: Scalars['String']['input'];
};


export type QueriesEmbedArgs = {
  embedType: EmbedType;
  id: Scalars['ID']['input'];
};


export type QueriesEmployeesArgs = {
  onlyPromotedAuthors?: InputMaybe<Scalars['Boolean']['input']>;
  shuffle?: InputMaybe<Scalars['Int']['input']>;
  withBoosted?: InputMaybe<Scalars['Boolean']['input']>;
  withGreeting?: InputMaybe<Scalars['Boolean']['input']>;
  withPitch?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueriesMailboxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<MailboxFiltersInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueriesMeArgs = {
  accessToken?: InputMaybe<Scalars['ID']['input']>;
};


export type QueriesMediaProgressArgs = {
  mediaId: Scalars['ID']['input'];
};


export type QueriesNextStatementArgs = {
  orderDirection: OrderDirection;
  sequenceNumber: Scalars['Int']['input'];
};


export type QueriesNotificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<EventObjectType>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  lastDays?: InputMaybe<Scalars['Int']['input']>;
  onlyUnread?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueriesPaymentsArgs = {
  booleanFilter?: InputMaybe<BooleanFilter>;
  dateRangeFilter?: InputMaybe<DateRangeFilter>;
  limit: Scalars['Int']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<OrderBy>;
  search?: InputMaybe<Scalars['String']['input']>;
  stringArrayFilter?: InputMaybe<StringArrayFilter>;
};


export type QueriesPaymentsCsvArgs = {
  companyName: Scalars['String']['input'];
  paymentIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type QueriesPledgeArgs = {
  id: Scalars['ID']['input'];
};


export type QueriesPostfinancePaymentsArgs = {
  booleanFilter?: InputMaybe<BooleanFilter>;
  dateRangeFilter?: InputMaybe<DateRangeFilter>;
  limit: Scalars['Int']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<OrderBy>;
  search?: InputMaybe<Scalars['String']['input']>;
  stringArrayFilter?: InputMaybe<StringArrayFilter>;
};


export type QueriesQuestionnaireArgs = {
  slug: Scalars['String']['input'];
};


export type QueriesRedirectionArgs = {
  externalBaseUrl?: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
};


export type QueriesRedirectionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  externalBaseUrl?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueriesRepoArgs = {
  id: Scalars['ID']['input'];
};


export type QueriesReposSearchArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isSeriesEpisode?: InputMaybe<Scalars['Boolean']['input']>;
  isSeriesMaster?: InputMaybe<Scalars['Boolean']['input']>;
  isTemplate?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RepoOrderBy>;
  phases?: InputMaybe<Array<RepoPhaseKey>>;
  publishDateRange?: InputMaybe<RepoPublishDateRange>;
  search?: InputMaybe<Scalars['String']['input']>;
  template?: InputMaybe<Scalars['String']['input']>;
};


export type QueriesRoleStatsArgs = {
  role: Scalars['String']['input'];
};


export type QueriesSearchArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  apiKey?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<SearchFilterInput>;
  filters?: InputMaybe<Array<SearchGenericFilterInput>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  processor?: InputMaybe<SearchProcessor>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<SearchSortInput>;
  trackingId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueriesStatementsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  focus?: InputMaybe<Scalars['String']['input']>;
  membershipAfter?: InputMaybe<Scalars['DateTime']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  seed?: InputMaybe<Scalars['Float']['input']>;
};


export type QueriesUnauthorizedSessionArgs = {
  email: Scalars['String']['input'];
  token: SignInToken;
};


export type QueriesUserArgs = {
  accessToken?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueriesUsersArgs = {
  hasPublicProfile?: InputMaybe<Scalars['Boolean']['input']>;
  isListed?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  search: Scalars['String']['input'];
};


export type QueriesVotingArgs = {
  slug: Scalars['String']['input'];
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
  discussionId: Scalars['ID']['input'];
};


export type SubscriptionsRepoChangeArgs = {
  repoId: Scalars['ID']['input'];
};


export type SubscriptionsRepoUpdateArgs = {
  repoId?: InputMaybe<Scalars['ID']['input']>;
};


export type SubscriptionsUncommittedChangesArgs = {
  repoId: Scalars['ID']['input'];
};

export type ArticleTeaserQueryVariables = Exact<{
  path: Scalars['String']['input'];
}>;


export type ArticleTeaserQuery = { __typename?: 'queries', article?: { __typename?: 'Document', meta: { __typename?: 'Meta', title?: string | null, shortTitle?: string | null, image?: string | null, credits?: any | null } } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'queries', me?: { __typename?: 'User', id: string, username?: string | null, slug?: string | null, portrait?: string | null, name?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, initials?: string | null, roles: Array<string>, isListed: boolean, hasPublicProfile?: boolean | null, discussionNotificationChannels: Array<DiscussionNotificationChannel>, hasDormantMembership: boolean, prolongBeforeDate?: string | null, accessCampaigns?: Array<{ __typename?: 'AccessCampaign', id: string }> | null, activeMembership?: { __typename?: 'Membership', id: string, renew: boolean, endDate?: string | null, graceEndDate?: string | null, canProlong: boolean, type: { __typename?: 'MembershipType', name: string } } | null } | null };


export const ArticleTeaserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"articleTeaser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"article"},"name":{"kind":"Name","value":"document"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"shortTitle"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"credits"}}]}}]}}]}}]} as unknown as DocumentNode<ArticleTeaserQuery, ArticleTeaserQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"portrait"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"isListed"}},{"kind":"Field","name":{"kind":"Name","value":"hasPublicProfile"}},{"kind":"Field","name":{"kind":"Name","value":"discussionNotificationChannels"}},{"kind":"Field","name":{"kind":"Name","value":"accessCampaigns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasDormantMembership"}},{"kind":"Field","name":{"kind":"Name","value":"prolongBeforeDate"}},{"kind":"Field","name":{"kind":"Name","value":"activeMembership"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"renew"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"graceEndDate"}},{"kind":"Field","name":{"kind":"Name","value":"canProlong"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;