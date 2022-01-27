CREATE TABLE "statisticsMatomo" (
    "idSite" integer NOT NULL,

    -- Set of attributes, defining unqiue key
    url text NOT NULL,
    period text NOT NULL,
    date date NOT NULL,
    segment text,

    -- several props from a Actions.getPageUrls[] response
    label text NOT NULL,
    nb_visits integer NOT NULL DEFAULT 0,
    nb_uniq_visitors integer NOT NULL DEFAULT 0,
    nb_hits integer NOT NULL DEFAULT 0,
    entry_nb_uniq_visitors integer NOT NULL DEFAULT 0,
    entry_nb_visits integer NOT NULL DEFAULT 0,
    entry_nb_actions integer NOT NULL DEFAULT 0,
    entry_bounce_count integer NOT NULL DEFAULT 0,
    exit_nb_uniq_visitors integer NOT NULL DEFAULT 0,
    exit_nb_visits integer NOT NULL DEFAULT 0,

    -- several props from a Transitions.getTransitionsForAction[] response
    entries integer NOT NULL DEFAULT 0,
    exits integer NOT NULL DEFAULT 0,
    loops integer NOT NULL DEFAULT 0,
    pageviews integer NOT NULL DEFAULT 0,
    "previousPages.referrals" integer NOT NULL DEFAULT 0,
    "direct.referrals" integer NOT NULL DEFAULT 0,
    "direct.visits" integer NOT NULL DEFAULT 0,
    "website.referrals" integer NOT NULL DEFAULT 0,
    "website.visits" integer NOT NULL DEFAULT 0,
    "search.referrals" integer NOT NULL DEFAULT 0,
    "search.visits" integer NOT NULL DEFAULT 0,
    "campaign.referrals" integer NOT NULL DEFAULT 0,
    "campaign.visits" integer NOT NULL DEFAULT 0,
    "campaign.newsletter.referrals" integer NOT NULL DEFAULT 0,
    "social.referrals" integer NOT NULL DEFAULT 0,
    "social.visits" integer NOT NULL DEFAULT 0,
    "social.facebook.referrals" integer NOT NULL DEFAULT 0,
    "social.instagram.referrals" integer NOT NULL DEFAULT 0,
    "social.linkedin.referrals" integer NOT NULL DEFAULT 0,
    "social.twitter.referrals" integer NOT NULL DEFAULT 0,
    
    -- Data from ElasticSearch document index
    "repoId" text,
    "template" text,
    "publishDate" timestamp with time zone,

    -- Count how many times a record was merged into. A merged record
    -- falsifies visits and visitor numbers.
    "mergeCount" integer NOT NULL DEFAULT 0,

    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX "statisticsMatomo_period_date_idx"
    ON "statisticsMatomo"(period text_ops,date date_ops);
CREATE INDEX "statisticsMatomo_url_idx"
    ON "statisticsMatomo"(url text_ops);
CREATE UNIQUE INDEX "statisticsMatomo_idSite_url_period_date_segment_idx"
    ON "statisticsMatomo"("idSite" int4_ops,url text_ops,period text_ops,date date_ops,segment text_ops);
CREATE INDEX "statisticsMatomo_repoId_template_idx"
    ON "statisticsMatomo"("repoId" text_ops,template text_ops);

CREATE TABLE "statisticsIndexes" (
    type text NOT NULL,
    condition jsonb NOT NULL,
    data jsonb NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "statisticsIndexes_type_condition_idx" ON "statisticsIndexes"(type text_ops,condition jsonb_ops);

CREATE TABLE "statisticsQuotes" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote text NOT NULL,
    author text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

