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
    "\nquery ChallengeAcceptedHubQuery {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n    introduction {\n      value\n    }\n    outro {\n      value\n    }\n    items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        isPublic\n        description {\n          value\n        }\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        startAt\n        endAt\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n  }\n  people: allChallengeAcceptedPeople(first: 50) {\n    id\n    slug\n    name\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}\n": types.ChallengeAcceptedHubQueryDocument,
    "\nquery ChallengeAcceptedHubMetaQuery {\n  hub: challengeAcceptedHub {\n    id\n    metadata {\n      title\n      description\n      image {\n        url(imgixParams: {w: \"1500\"})\n      }\n    }\n  }\n}\n": types.ChallengeAcceptedHubMetaQueryDocument,
    "\n query PersonDetail($slug: String!) {\n    person: challengeAcceptedPerson(filter: {slug: {eq: $slug}}) {\n      id\n      name\n      portrait {\n        alt\n        url\n        width\n        height\n        title\n      }\n      catchPhrase\n      bio {\n        value\n      }\n      items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        isPublic\n        description {\n          value\n        }\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        startAt\n        endAt\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n    }\n  }\n": types.PersonDetailDocument,
    "\nquery ChallengeAcceptedPersonListQuery {\n  people: allChallengeAcceptedPeople(first: 50, orderBy: size_ASC) {\n    id\n    slug\n    name\n    size\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}\n": types.ChallengeAcceptedPersonListQueryDocument,
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
export function gql(source: "\nquery ChallengeAcceptedHubQuery {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n    introduction {\n      value\n    }\n    outro {\n      value\n    }\n    items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        isPublic\n        description {\n          value\n        }\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        startAt\n        endAt\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n  }\n  people: allChallengeAcceptedPeople(first: 50) {\n    id\n    slug\n    name\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}\n"): (typeof documents)["\nquery ChallengeAcceptedHubQuery {\n  hub: challengeAcceptedHub {\n    id\n    logo {\n      url\n    }\n    introduction {\n      value\n    }\n    outro {\n      value\n    }\n    items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        isPublic\n        description {\n          value\n        }\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        startAt\n        endAt\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n  }\n  people: allChallengeAcceptedPeople(first: 50) {\n    id\n    slug\n    name\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery ChallengeAcceptedHubMetaQuery {\n  hub: challengeAcceptedHub {\n    id\n    metadata {\n      title\n      description\n      image {\n        url(imgixParams: {w: \"1500\"})\n      }\n    }\n  }\n}\n"): (typeof documents)["\nquery ChallengeAcceptedHubMetaQuery {\n  hub: challengeAcceptedHub {\n    id\n    metadata {\n      title\n      description\n      image {\n        url(imgixParams: {w: \"1500\"})\n      }\n    }\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n query PersonDetail($slug: String!) {\n    person: challengeAcceptedPerson(filter: {slug: {eq: $slug}}) {\n      id\n      name\n      portrait {\n        alt\n        url\n        width\n        height\n        title\n      }\n      catchPhrase\n      bio {\n        value\n      }\n      items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        isPublic\n        description {\n          value\n        }\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        startAt\n        endAt\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n    }\n  }\n"): (typeof documents)["\n query PersonDetail($slug: String!) {\n    person: challengeAcceptedPerson(filter: {slug: {eq: $slug}}) {\n      id\n      name\n      portrait {\n        alt\n        url\n        width\n        height\n        title\n      }\n      catchPhrase\n      bio {\n        value\n      }\n      items {\n      __typename\n      ... on EventRecord {\n        id\n        title\n        isPublic\n        description {\n          value\n        }\n        nonMemberCta {\n          value\n        }\n        fullyBooked\n        signUpLink\n        location\n        startAt\n        endAt\n      }\n      ... on ChallengeAcceptedArticleRecord {\n        id\n        path\n        image {\n          url\n          width\n          height\n        }\n      }\n      ... on ChallengeAcceptedNewsletterRecord {\n        id\n        path\n      }\n    }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery ChallengeAcceptedPersonListQuery {\n  people: allChallengeAcceptedPeople(first: 50, orderBy: size_ASC) {\n    id\n    slug\n    name\n    size\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}\n"): (typeof documents)["\nquery ChallengeAcceptedPersonListQuery {\n  people: allChallengeAcceptedPeople(first: 50, orderBy: size_ASC) {\n    id\n    slug\n    name\n    size\n    portrait {\n      url\n      height\n      width\n    }\n  }\n}\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;