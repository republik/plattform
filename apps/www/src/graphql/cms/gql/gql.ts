/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "fragment EventRecordFields on EventRecord {\n  id\n  title\n  slug\n  description {\n    value\n  }\n  membersOnly\n  nonMemberCta {\n    value\n  }\n  fullyBooked\n  signUpLink\n  location\n  locationLink\n  startAt\n  endAt\n  _updatedAt\n  _status\n}": types.EventRecordFieldsFragmentDoc,
    "query ChallengeAcceptedHubMeta {\n  hub: challengeAcceptedHub {\n    id\n    metadata {\n      title\n      description\n      image {\n        url(imgixParams: {w: \"1500\"})\n      }\n    }\n  }\n}": types.ChallengeAcceptedHubMetaDocument,
    "query ChallengeAcceptedHub {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n    introduction {\n      value\n    }\n    outro {\n      value\n    }\n    newsletterSignupTagline\n    items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        slug\n        description {\n          value\n        }\n        membersOnly\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        locationLink\n        startAt\n        endAt\n        _updatedAt\n        _status\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n  }\n  people: allChallengeAcceptedPeople(first: 50) {\n    id\n    slug\n    name\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}": types.ChallengeAcceptedHubDocument,
    "query ChallengeAcceptedPersonList {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n  }\n  people: allChallengeAcceptedPeople(first: 50, orderBy: size_ASC) {\n    id\n    slug\n    name\n    size\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}": types.ChallengeAcceptedPersonListDocument,
    "query EventMeta($slug: String) {\n  event(filter: {slug: {eq: $slug}}) {\n    id\n    title\n    seo {\n      title\n      description\n      image {\n        url(imgixParams: {w: \"1500\"})\n      }\n    }\n  }\n}": types.EventMetaDocument,
    "query Event($slug: String) {\n  event(filter: {slug: {eq: $slug}}) {\n    ...EventRecordFields\n  }\n}": types.EventDocument,
    "query Events($today: DateTime!) {\n  events: allEvents(\n    filter: {AND: [{unlisted: {eq: false}}, {OR: [{startAt: {gte: $today}}, {endAt: {gte: $today}}]}]}\n    orderBy: startAt_ASC\n  ) {\n    ...EventRecordFields\n  }\n  pastEvents: allEvents(\n    filter: {AND: [{startAt: {lt: $today}}, {endAt: {lt: $today}}]}\n    orderBy: startAt_DESC\n  ) {\n    ...EventRecordFields\n  }\n}": types.EventsDocument,
    "query FAQ {\n  faq {\n    title\n    introduction {\n      value\n    }\n    entries {\n      answer {\n        value\n      }\n      question(markdown: false)\n      category\n    }\n  }\n}": types.FaqDocument,
    "query MarketingLandingPageCMS {\n  marketingLandingPage {\n    id\n    reasons {\n      id\n      title\n      description\n    }\n    formats {\n      imageDark {\n        responsiveImage(imgixParams: {w: 160}) {\n          src\n        }\n      }\n      imageBright {\n        responsiveImage(imgixParams: {w: 160}) {\n          src\n        }\n      }\n      title\n      description\n      color {\n        hex\n      }\n    }\n    sectionTeamTitle\n    sectionTeamDescription\n    sectionDialogTitle\n    sectionDialogDescription\n    sectionFormatsTitle\n    sectionFormatsDescription\n  }\n}": types.MarketingLandingPageCmsDocument,
    "query PersonDetail($slug: String!) {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n    newsletterSignupTagline\n  }\n  person: challengeAcceptedPerson(filter: {slug: {eq: $slug}}) {\n    id\n    name\n    slug\n    portrait {\n      alt\n      url\n      width\n      height\n      title\n    }\n    catchPhrase\n    bio {\n      value\n    }\n    items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        slug\n        description {\n          value\n        }\n        membersOnly\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        locationLink\n        startAt\n        endAt\n        _updatedAt\n        _status\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n  }\n}": types.PersonDetailDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "fragment EventRecordFields on EventRecord {\n  id\n  title\n  slug\n  description {\n    value\n  }\n  membersOnly\n  nonMemberCta {\n    value\n  }\n  fullyBooked\n  signUpLink\n  location\n  locationLink\n  startAt\n  endAt\n  _updatedAt\n  _status\n}"): (typeof documents)["fragment EventRecordFields on EventRecord {\n  id\n  title\n  slug\n  description {\n    value\n  }\n  membersOnly\n  nonMemberCta {\n    value\n  }\n  fullyBooked\n  signUpLink\n  location\n  locationLink\n  startAt\n  endAt\n  _updatedAt\n  _status\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query ChallengeAcceptedHubMeta {\n  hub: challengeAcceptedHub {\n    id\n    metadata {\n      title\n      description\n      image {\n        url(imgixParams: {w: \"1500\"})\n      }\n    }\n  }\n}"): (typeof documents)["query ChallengeAcceptedHubMeta {\n  hub: challengeAcceptedHub {\n    id\n    metadata {\n      title\n      description\n      image {\n        url(imgixParams: {w: \"1500\"})\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query ChallengeAcceptedHub {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n    introduction {\n      value\n    }\n    outro {\n      value\n    }\n    newsletterSignupTagline\n    items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        slug\n        description {\n          value\n        }\n        membersOnly\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        locationLink\n        startAt\n        endAt\n        _updatedAt\n        _status\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n  }\n  people: allChallengeAcceptedPeople(first: 50) {\n    id\n    slug\n    name\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}"): (typeof documents)["query ChallengeAcceptedHub {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n    introduction {\n      value\n    }\n    outro {\n      value\n    }\n    newsletterSignupTagline\n    items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        slug\n        description {\n          value\n        }\n        membersOnly\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        locationLink\n        startAt\n        endAt\n        _updatedAt\n        _status\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n  }\n  people: allChallengeAcceptedPeople(first: 50) {\n    id\n    slug\n    name\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query ChallengeAcceptedPersonList {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n  }\n  people: allChallengeAcceptedPeople(first: 50, orderBy: size_ASC) {\n    id\n    slug\n    name\n    size\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}"): (typeof documents)["query ChallengeAcceptedPersonList {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n  }\n  people: allChallengeAcceptedPeople(first: 50, orderBy: size_ASC) {\n    id\n    slug\n    name\n    size\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query EventMeta($slug: String) {\n  event(filter: {slug: {eq: $slug}}) {\n    id\n    title\n    seo {\n      title\n      description\n      image {\n        url(imgixParams: {w: \"1500\"})\n      }\n    }\n  }\n}"): (typeof documents)["query EventMeta($slug: String) {\n  event(filter: {slug: {eq: $slug}}) {\n    id\n    title\n    seo {\n      title\n      description\n      image {\n        url(imgixParams: {w: \"1500\"})\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query Event($slug: String) {\n  event(filter: {slug: {eq: $slug}}) {\n    ...EventRecordFields\n  }\n}"): (typeof documents)["query Event($slug: String) {\n  event(filter: {slug: {eq: $slug}}) {\n    ...EventRecordFields\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query Events($today: DateTime!) {\n  events: allEvents(\n    filter: {AND: [{unlisted: {eq: false}}, {OR: [{startAt: {gte: $today}}, {endAt: {gte: $today}}]}]}\n    orderBy: startAt_ASC\n  ) {\n    ...EventRecordFields\n  }\n  pastEvents: allEvents(\n    filter: {AND: [{startAt: {lt: $today}}, {endAt: {lt: $today}}]}\n    orderBy: startAt_DESC\n  ) {\n    ...EventRecordFields\n  }\n}"): (typeof documents)["query Events($today: DateTime!) {\n  events: allEvents(\n    filter: {AND: [{unlisted: {eq: false}}, {OR: [{startAt: {gte: $today}}, {endAt: {gte: $today}}]}]}\n    orderBy: startAt_ASC\n  ) {\n    ...EventRecordFields\n  }\n  pastEvents: allEvents(\n    filter: {AND: [{startAt: {lt: $today}}, {endAt: {lt: $today}}]}\n    orderBy: startAt_DESC\n  ) {\n    ...EventRecordFields\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query FAQ {\n  faq {\n    title\n    introduction {\n      value\n    }\n    entries {\n      answer {\n        value\n      }\n      question(markdown: false)\n      category\n    }\n  }\n}"): (typeof documents)["query FAQ {\n  faq {\n    title\n    introduction {\n      value\n    }\n    entries {\n      answer {\n        value\n      }\n      question(markdown: false)\n      category\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query MarketingLandingPageCMS {\n  marketingLandingPage {\n    id\n    reasons {\n      id\n      title\n      description\n    }\n    formats {\n      imageDark {\n        responsiveImage(imgixParams: {w: 160}) {\n          src\n        }\n      }\n      imageBright {\n        responsiveImage(imgixParams: {w: 160}) {\n          src\n        }\n      }\n      title\n      description\n      color {\n        hex\n      }\n    }\n    sectionTeamTitle\n    sectionTeamDescription\n    sectionDialogTitle\n    sectionDialogDescription\n    sectionFormatsTitle\n    sectionFormatsDescription\n  }\n}"): (typeof documents)["query MarketingLandingPageCMS {\n  marketingLandingPage {\n    id\n    reasons {\n      id\n      title\n      description\n    }\n    formats {\n      imageDark {\n        responsiveImage(imgixParams: {w: 160}) {\n          src\n        }\n      }\n      imageBright {\n        responsiveImage(imgixParams: {w: 160}) {\n          src\n        }\n      }\n      title\n      description\n      color {\n        hex\n      }\n    }\n    sectionTeamTitle\n    sectionTeamDescription\n    sectionDialogTitle\n    sectionDialogDescription\n    sectionFormatsTitle\n    sectionFormatsDescription\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query PersonDetail($slug: String!) {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n    newsletterSignupTagline\n  }\n  person: challengeAcceptedPerson(filter: {slug: {eq: $slug}}) {\n    id\n    name\n    slug\n    portrait {\n      alt\n      url\n      width\n      height\n      title\n    }\n    catchPhrase\n    bio {\n      value\n    }\n    items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        slug\n        description {\n          value\n        }\n        membersOnly\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        locationLink\n        startAt\n        endAt\n        _updatedAt\n        _status\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n  }\n}"): (typeof documents)["query PersonDetail($slug: String!) {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n    newsletterSignupTagline\n  }\n  person: challengeAcceptedPerson(filter: {slug: {eq: $slug}}) {\n    id\n    name\n    slug\n    portrait {\n      alt\n      url\n      width\n      height\n      title\n    }\n    catchPhrase\n    bio {\n      value\n    }\n    items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        slug\n        description {\n          value\n        }\n        membersOnly\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        locationLink\n        startAt\n        endAt\n        _updatedAt\n        _status\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n  }\n}"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;