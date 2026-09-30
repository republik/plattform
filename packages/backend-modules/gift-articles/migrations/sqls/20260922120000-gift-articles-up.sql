-- Gift article links: a member hands out a token that unlocks one article for
-- a non-member for 14 days.
--
-- snake_case, unlike most of this schema: this table gets queried by hand and
-- in Metabase, where camelCase identifiers have to be quoted every time.
--
-- document_id is the bare, published Sanity _id -- the same value
-- "collectionDocumentItems"."sanityId" holds, so a link is the same one
-- whether the granter was reading the draft or the published version. No FK:
-- Sanity documents don't live in this database.
--
-- document_path is a snapshot of the slug at hand-out time, kept only to build
-- the link's URL. It is not the identity of the article -- a slug can change,
-- document_id cannot.
CREATE TABLE public.gift_article_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  granter_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_id text NOT NULL,
  document_path text NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

-- Redeeming a link looks up by token, which the UNIQUE above already covers.
-- This one serves createGiftArticleLink's "is there already a live link for
-- this article?" check.
CREATE INDEX gift_article_links_granter_document_idx
  ON public.gift_article_links (granter_user_id, document_id);
