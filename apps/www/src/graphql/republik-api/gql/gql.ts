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
    "\n  query PendingAppSignIn {\n    pendingAppSignIn {\n      title\n      body\n      verificationUrl\n      expiresAt\n    }\n  }\n": types.PendingAppSignInDocument,
    "\n  query articleTeaser($path: String!) {\n    article: document(path: $path) {\n      meta {\n        title\n        description\n        image\n        credits\n      }\n    }\n  }\n": types.ArticleTeaserDocument,
    "\n  mutation acknowledgeCTA($id: ID!, $response: JSON) {\n    acknowledgeCallToAction(id: $id, response: $response) {\n      id\n      acknowledgedAt\n    }\n  }\n": types.AcknowledgeCtaDocument,
    "\n  query myCallToActions {\n    me {\n      id\n      callToActions {\n        id\n        beginAt\n        endAt\n        acknowledgedAt\n        payload {\n          ... on CallToActionBasicPayload {\n            text\n            linkHref\n            linkLabel\n          }\n\n          ... on CallToActionComponentPayload {\n            customComponent {\n              key\n              args\n            }\n          }\n        }\n      }\n    }\n  }\n": types.MyCallToActionsDocument,
    "\n  query me {\n    me {\n      id\n      username\n      slug\n      portrait\n      name\n      firstName\n      lastName\n      email\n      initials\n      roles\n      isListed\n      hasPublicProfile\n      discussionNotificationChannels\n      accessCampaigns {\n        id\n      }\n      hasDormantMembership\n      prolongBeforeDate\n      activeMembership {\n        id\n        type {\n          name\n        }\n        renew\n        endDate\n        graceEndDate\n        canProlong\n      }\n    }\n  }\n": types.MeDocument,
    "\n  mutation SignUpForNewsletter(\n    $email: String!\n    $name: NewsletterName!\n    $context: String!\n  ) {\n    requestNewsletterSubscription(email: $email, name: $name, context: $context)\n  }\n": types.SignUpForNewsletterDocument,
    "\n  query CANewsletterQuery(\n    $name: NewsletterName!\n  ) {\n    me {\n      newsletterSettings {\n        id\n        status\n        subscriptions(name: $name) {\n          id\n          name\n          subscribed\n        }\n      }\n    }\n  }\n": types.CaNewsletterQueryDocument,
    "\n  mutation updateNewsletterSubscription(\n    $name: NewsletterName!\n    $subscribed: Boolean!\n  ) {\n    updateNewsletterSubscription(name: $name, subscribed: $subscribed) {\n      id\n      name\n      subscribed\n    }\n  }\n": types.UpdateNewsletterSubscriptionDocument,
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
export function gql(source: "\n  query PendingAppSignIn {\n    pendingAppSignIn {\n      title\n      body\n      verificationUrl\n      expiresAt\n    }\n  }\n"): (typeof documents)["\n  query PendingAppSignIn {\n    pendingAppSignIn {\n      title\n      body\n      verificationUrl\n      expiresAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query articleTeaser($path: String!) {\n    article: document(path: $path) {\n      meta {\n        title\n        description\n        image\n        credits\n      }\n    }\n  }\n"): (typeof documents)["\n  query articleTeaser($path: String!) {\n    article: document(path: $path) {\n      meta {\n        title\n        description\n        image\n        credits\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation acknowledgeCTA($id: ID!, $response: JSON) {\n    acknowledgeCallToAction(id: $id, response: $response) {\n      id\n      acknowledgedAt\n    }\n  }\n"): (typeof documents)["\n  mutation acknowledgeCTA($id: ID!, $response: JSON) {\n    acknowledgeCallToAction(id: $id, response: $response) {\n      id\n      acknowledgedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query myCallToActions {\n    me {\n      id\n      callToActions {\n        id\n        beginAt\n        endAt\n        acknowledgedAt\n        payload {\n          ... on CallToActionBasicPayload {\n            text\n            linkHref\n            linkLabel\n          }\n\n          ... on CallToActionComponentPayload {\n            customComponent {\n              key\n              args\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query myCallToActions {\n    me {\n      id\n      callToActions {\n        id\n        beginAt\n        endAt\n        acknowledgedAt\n        payload {\n          ... on CallToActionBasicPayload {\n            text\n            linkHref\n            linkLabel\n          }\n\n          ... on CallToActionComponentPayload {\n            customComponent {\n              key\n              args\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query me {\n    me {\n      id\n      username\n      slug\n      portrait\n      name\n      firstName\n      lastName\n      email\n      initials\n      roles\n      isListed\n      hasPublicProfile\n      discussionNotificationChannels\n      accessCampaigns {\n        id\n      }\n      hasDormantMembership\n      prolongBeforeDate\n      activeMembership {\n        id\n        type {\n          name\n        }\n        renew\n        endDate\n        graceEndDate\n        canProlong\n      }\n    }\n  }\n"): (typeof documents)["\n  query me {\n    me {\n      id\n      username\n      slug\n      portrait\n      name\n      firstName\n      lastName\n      email\n      initials\n      roles\n      isListed\n      hasPublicProfile\n      discussionNotificationChannels\n      accessCampaigns {\n        id\n      }\n      hasDormantMembership\n      prolongBeforeDate\n      activeMembership {\n        id\n        type {\n          name\n        }\n        renew\n        endDate\n        graceEndDate\n        canProlong\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SignUpForNewsletter(\n    $email: String!\n    $name: NewsletterName!\n    $context: String!\n  ) {\n    requestNewsletterSubscription(email: $email, name: $name, context: $context)\n  }\n"): (typeof documents)["\n  mutation SignUpForNewsletter(\n    $email: String!\n    $name: NewsletterName!\n    $context: String!\n  ) {\n    requestNewsletterSubscription(email: $email, name: $name, context: $context)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CANewsletterQuery(\n    $name: NewsletterName!\n  ) {\n    me {\n      newsletterSettings {\n        id\n        status\n        subscriptions(name: $name) {\n          id\n          name\n          subscribed\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query CANewsletterQuery(\n    $name: NewsletterName!\n  ) {\n    me {\n      newsletterSettings {\n        id\n        status\n        subscriptions(name: $name) {\n          id\n          name\n          subscribed\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation updateNewsletterSubscription(\n    $name: NewsletterName!\n    $subscribed: Boolean!\n  ) {\n    updateNewsletterSubscription(name: $name, subscribed: $subscribed) {\n      id\n      name\n      subscribed\n    }\n  }\n"): (typeof documents)["\n  mutation updateNewsletterSubscription(\n    $name: NewsletterName!\n    $subscribed: Boolean!\n  ) {\n    updateNewsletterSubscription(name: $name, subscribed: $subscribed) {\n      id\n      name\n      subscribed\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;