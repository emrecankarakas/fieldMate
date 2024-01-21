-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    user_id uuid NOT NULL,
    fullname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    role character varying(50) COLLATE pg_catalog."default",
    age bigint,
    avatar character varying(50) COLLATE pg_catalog."default",
    fcm_token character varying(255) COLLATE pg_catalog."default",
    username character varying(50) COLLATE pg_catalog."default",
    team character varying(50) COLLATE pg_catalog."default",
    user_type integer NOT NULL DEFAULT 1,
    is_banned integer NOT NULL DEFAULT 0,
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_email_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

    -- Table: public.otp

-- DROP TABLE IF EXISTS public.otp;

CREATE TABLE IF NOT EXISTS public.otp
(
    email text COLLATE pg_catalog."default",
    otp text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.otp
    OWNER to postgres;

    -- Table: public.friend_requests

-- DROP TABLE IF EXISTS public.friend_requests;

CREATE TABLE IF NOT EXISTS public.friend_requests
(
    request_id integer NOT NULL DEFAULT nextval('friend_requests_request_id_seq'::regclass),
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    CONSTRAINT friend_requests_pkey PRIMARY KEY (request_id),
    CONSTRAINT friend_requests_receiver_id_fkey FOREIGN KEY (receiver_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT friend_requests_sender_id_fkey FOREIGN KEY (sender_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.friend_requests
    OWNER to postgres;

  -- Table: public.friendships

-- DROP TABLE IF EXISTS public.friendships;

CREATE TABLE IF NOT EXISTS public.friendships
(
    friendship_id integer NOT NULL DEFAULT nextval('friendships_friendship_id_seq'::regclass),
    user_id uuid NOT NULL,
    friend_id uuid NOT NULL,
    CONSTRAINT friendships_pkey PRIMARY KEY (friendship_id),
    CONSTRAINT friendships_user_id_friend_id_key UNIQUE (user_id, friend_id),
    CONSTRAINT friendships_friend_id_fkey FOREIGN KEY (friend_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT friendships_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.friendships
    OWNER to postgres;

      -- Table: public.teams

-- DROP TABLE IF EXISTS public.teams;

CREATE TABLE IF NOT EXISTS public.teams
(
    team_id integer NOT NULL DEFAULT nextval('teams_team_id_seq'::regclass),
    team_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    captain_id uuid,
    players jsonb NOT NULL,
    CONSTRAINT teams_pkey PRIMARY KEY (team_id),
    CONSTRAINT teams_captain_id_fkey FOREIGN KEY (captain_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.teams
    OWNER to postgres;

    -- Table: public.team_requests

-- DROP TABLE IF EXISTS public.team_requests;

CREATE TABLE IF NOT EXISTS public.team_requests
(
    request_id integer NOT NULL DEFAULT nextval('team_requests_request_id_seq'::regclass),
    team_id integer,
    sender_id uuid,
    receiver_id uuid,
    role character varying(50) COLLATE pg_catalog."default" NOT NULL,
    captain_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT team_requests_pkey PRIMARY KEY (request_id),
    CONSTRAINT team_requests_receiver_id_fkey FOREIGN KEY (receiver_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT team_requests_sender_id_fkey FOREIGN KEY (sender_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT team_requests_team_id_fkey FOREIGN KEY (team_id)
        REFERENCES public.teams (team_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.team_requests
    OWNER to postgres;

    -- Table: public.fields

-- DROP TABLE IF EXISTS public.fields;

CREATE TABLE IF NOT EXISTS public.fields
(
    field_id uuid NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    location character varying(255) COLLATE pg_catalog."default" NOT NULL,
    open_hours character varying(255)[] COLLATE pg_catalog."default" NOT NULL,
    field_owner_id uuid NOT NULL,
    date character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT fields_pkey PRIMARY KEY (field_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.fields
    OWNER to postgres;
-- Table: public.reservations

-- DROP TABLE IF EXISTS public.reservations;

CREATE TABLE IF NOT EXISTS public.reservations
(
    reservation_id uuid NOT NULL,
    field_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reserved_hour character varying(25) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    reserved_date character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT reservations_pkey PRIMARY KEY (reservation_id),
    CONSTRAINT reservations_field_id_fkey FOREIGN KEY (field_id)
        REFERENCES public.fields (field_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT reservations_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.reservations
    OWNER to postgres;
    -- Table: public.matches

-- DROP TABLE IF EXISTS public.matches;

CREATE TABLE IF NOT EXISTS public.matches
(
    match_id uuid NOT NULL,
    team1_info jsonb NOT NULL,
    team2_info jsonb NOT NULL,
    field_info jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    field_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reservation_id uuid NOT NULL,
    CONSTRAINT matches_pkey PRIMARY KEY (match_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.matches
    OWNER to postgres;

   -- Table: public.match_invitations

-- DROP TABLE IF EXISTS public.match_invitations;

CREATE TABLE IF NOT EXISTS public.match_invitations
(
    id integer NOT NULL DEFAULT nextval('match_invitations_id_seq'::regclass),
    match_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    "position" character varying(255) COLLATE pg_catalog."default" NOT NULL,
    field_info jsonb NOT NULL,
    team_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT match_invitations_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.match_invitations
    OWNER to postgres; 
    -- Table: public.player_ads

-- DROP TABLE IF EXISTS public.player_ads;

CREATE TABLE IF NOT EXISTS public.player_ads
(
    user_id uuid NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    role character varying(255) COLLATE pg_catalog."default" NOT NULL,
    avatar character varying(255) COLLATE pg_catalog."default",
    available_hours jsonb,
    available_days character varying(255) COLLATE pg_catalog."default",
    location character varying(255) COLLATE pg_catalog."default",
    alternatives character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT player_ads_pkey PRIMARY KEY (user_id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.player_ads
    OWNER to postgres;
    -- Table: public.reports

-- DROP TABLE IF EXISTS public.reports;

CREATE TABLE IF NOT EXISTS public.reports
(
    report_id integer NOT NULL DEFAULT nextval('reports_report_id_seq'::regclass),
    reporter_username character varying(255) COLLATE pg_catalog."default" NOT NULL,
    reported_username character varying(255) COLLATE pg_catalog."default" NOT NULL,
    reasons text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    reported_message character varying(255) COLLATE pg_catalog."default" NOT NULL,
    is_banned integer NOT NULL DEFAULT 0,
    CONSTRAINT reports_pkey PRIMARY KEY (report_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.reports
    OWNER to postgres;