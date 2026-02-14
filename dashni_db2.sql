--
-- PostgreSQL database dump
--

\restrict LKpE8EAsLbgaLBN5XuPxbQsYMgNNetjGNhM4KBXeXvC6dTB6C5Px88jrgfX5NhO

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audio_data; Type: TABLE; Schema: public; Owner: luka
--

CREATE TABLE public.audio_data (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    file_path character varying(500),
    status character varying(50) DEFAULT 'active'::character varying,
    content text NOT NULL,
    language character varying(50) DEFAULT 'თუშური'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audio_data OWNER TO luka;

--
-- Name: audio_data_id_seq; Type: SEQUENCE; Schema: public; Owner: luka
--

CREATE SEQUENCE public.audio_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audio_data_id_seq OWNER TO luka;

--
-- Name: audio_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: luka
--

ALTER SEQUENCE public.audio_data_id_seq OWNED BY public.audio_data.id;


--
-- Name: audio_segments; Type: TABLE; Schema: public; Owner: luka
--

CREATE TABLE public.audio_segments (
    id integer NOT NULL,
    "time" character varying(10) NOT NULL,
    text text NOT NULL,
    audio_file character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audio_segments OWNER TO luka;

--
-- Name: audio_segments_id_seq; Type: SEQUENCE; Schema: public; Owner: luka
--

CREATE SEQUENCE public.audio_segments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audio_segments_id_seq OWNER TO luka;

--
-- Name: audio_segments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: luka
--

ALTER SEQUENCE public.audio_segments_id_seq OWNED BY public.audio_segments.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: luka
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    img character varying(500),
    is_admin boolean DEFAULT false,
    is_active boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO luka;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: luka
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO luka;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: luka
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: words; Type: TABLE; Schema: public; Owner: luka
--

CREATE TABLE public.words (
    id integer NOT NULL,
    user_id integer,
    the_word character varying(255) NOT NULL,
    translation character varying(500),
    language character varying(50) DEFAULT 'tushetian'::character varying,
    definition text,
    part_of_speech character varying(50),
    base_form character varying(255),
    is_public boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.words OWNER TO luka;

--
-- Name: words_id_seq; Type: SEQUENCE; Schema: public; Owner: luka
--

CREATE SEQUENCE public.words_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.words_id_seq OWNER TO luka;

--
-- Name: words_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: luka
--

ALTER SEQUENCE public.words_id_seq OWNED BY public.words.id;


--
-- Name: audio_data id; Type: DEFAULT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.audio_data ALTER COLUMN id SET DEFAULT nextval('public.audio_data_id_seq'::regclass);


--
-- Name: audio_segments id; Type: DEFAULT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.audio_segments ALTER COLUMN id SET DEFAULT nextval('public.audio_segments_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: words id; Type: DEFAULT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.words ALTER COLUMN id SET DEFAULT nextval('public.words_id_seq'::regclass);


--
-- Data for Name: audio_data; Type: TABLE DATA; Schema: public; Owner: luka
--

COPY public.audio_data (id, title, file_path, status, content, language, created_at, updated_at) FROM stdin;
1	თუშური ტექსტი	/audio_files/adas_mier_moyolili_zghapari.m4a	active	[{"time":"0:00","text":"ცჰ̧ენ დენი მეზობლა ბადრივ დაკლავდინათხ მე მარწყვ ლაჰბა დეწრათხ დახაჼ ჰ̧ამივაჸ ჰ̧ალეცინეთხ კალთი დეხნათხ"},{"time":"0:18","text":"ო ცჰ̧ენ ჲაჰ̧გო ჲახხეჼ კოწლი ჲატტერ ზორეშ ლამზურ ჲოჰ̧ ჲარე ო მარწყვ ლეჰ̧ბოშ ცჰ̧ენ ჯაგენ ძირეჼ ჩუთჳიჰისნორ ჰ̧ალჰაწამელჩე მიჩედაგ ბადრი ცო დაგეგ ნაყბისტი ცო და"},{"time":"0:41","text":"ი̄შ ოსი ე ცჰ̧ენ ჲაჰ̧ოვ ჯაგენ ძირეხ ჲახეჩ კოწლივ ჩუი̄ხკნორ  შატბოლლინ ჩუაეხკიჼ"},{"time":"1:00","text":"ჰ̧ალხილუ ჰ̧ალცოჴეთთმაკ ჰ̧ალხილუ ჰ̧ალცოჴეთთმაკ ოშტუჼ ეაღ ოსი ჲათხეშ ჴეჼ ცჰ̧ა ჰ̧აწუკ გუდალʻე ო ჰ̧ეწკეგ ალʻიჼ ჯელელეჼ ე კოწლი დაჰ̧ჲასტალ სონენ ჰ̧ალცოჴეთთმაკსონენ"},{"time":"1:29","text":"დაჰ̧დეხნოერ ო ჰ̧აწუკ მოჰ̧ეჴდა ქოკივ დაჰ̧აესტნორ ჰ̧ალჴეთთეჼ სოდაჰ̧აჭენ ცომენა ცოდა ცო ხეჸ მიჩ ჲეწ ჲახაჼ"},{"time":"1:44","text":"ოშტო ჲუტ ჲუტ ჲუტე ჴე ჲექიჼ მენხჳიჩ ნაყვ ჲაღოსეჼ ჴეჼ ეშმივ დექიჼ მე ასა ნაყვ ჲოლეჼ ოშტო ასი ლელინჩოღა შარნაჲახე ჲოწჲალიჼ ო ბილკეხ"},{"time":"2:15","text":"ჲუტ ჲუტ ჲუტე მიჩახ სინათლ ჲაგიჼ ცჰ̧ენ წენი დაჰ̧ჲაჰენ ო წენიგ ოსი ჲათხეშ ჩუა_ხაე"},{"time":"2:34","text":"ოსი ო წინრე ცჰ̧ა ბადერ ნჸე გუდალʻე ჲაგი ო ჲოჰ̧ მე ოსი ჲათხეშ ეაღერ ჴენ ჩუ_ჲახენ შერ ნანეგ ალʻიჼ მე ოსი ცჰ̧ა ბადერ დათხეშ ედაღენ ო ნანას ალʻიჼ მე ჩუდოდებათ ჩუდოდებათენ ნეჸ ჲახენ ო ჲოჰ̧ ო ჲეშმა ჲოჰ̧ ჩუაიკეჼ ო ჲოჰ̧ ჩუახაიეჼ ოსი"},{"time":"3:10","text":"ჴე ინც ფსარლო ჲეჸეჼ ჰამივა შუ-შუა მათთიშ ჩუდარჟდიეჼ ო ჲოჰ̧ ო ნანას ოშტვიჩ ედგლე იშიეჼ მე ცოჰანა ცომ ჰოჸრალ ჰ̧ალჴეთთენ ო ნან ნეკი ჺრდანა იალʻეჼ"},{"time":"3:41","text":"ო ცჰ̧ა ჲოჰ̧ ოშტონკა ჲარმე ჰ̧ალჴეთიჼ ნანას მე ნეკი ჺირდორʻ ო ჲოჰ̧ დაჰ̧ჺერʻევა ლე̄რ"},{"time":"3:54","text":"ჴე ალʻიჼ ო ჲაჰოგ მე აჰ სომფენიხ ჺიშენ სოცი ჺიშენ ჴეჼ ჩუდიფშეჼ შიკე ცჰ̧აღ ჩუდიფშეჼ"},{"time":"4:12","text":"ბჳის ჰალჴეთთენ ო ნან ო ჺირდიენ ნეკივ დაჰ̧ჲახენ ო დაკლივ მე ესე ო დოტდიენ ჰ̧აშ დიშენ ცოჰმა ოსი ო შარიჼ ჲოჰ̧ იშურ მაქ ჲახენ ო შარიჼ ჲოჰ̧ დაჰ̧აჺევიჼ"},{"time":"4:39","text":"ჺურდეჼ ჰ̧ალჴეთთენ ო ნან ალʻიჼ მე ისი ჰერწ ლათთენ წე ჰ̧ალიააეთ ჰ̧ალოჴეხკდებათ დითხენ ჰ̧ალჴექდიენ"},{"time":"4:58","text":"ფსარლო იეენ ო ნან სამუშავმაქრეჼ იე̄ნ შერ ბადრეჼ ჰეჭა ჴეთიჼ ჴე იათხეშ ჩუა_ხაე ო ნან სე ხანათენ ხა დალო სე ტანათენ ტა დალო"},{"time":"5:27","text":"ო ბადრივ ო ჲოჰ̧ მენუხა ნანას დაჰეწერ ევა ო ბადრივ გაფრთხილბადიეჼ მე აჰ̧ შარნღობ ესერე ცოჰეკა თხე ნანას დაჰ̧ევოჰ̧ენ ო ჲოჰ̧ ჰ̧ალჴეთთენ შარნაჲახენ"},{"time":"6:13","text":"ჲუტ ჲუტ ჲუტე ო ბილკევ ჲუტე ჰ̧ულნოღა ჲუტე ცო ხე მიჩ ჲეწ ჲახაჼ ე ცჰ̧ენ ქოხეგა ოთთე ჩუჰ̧აჭენ ცომენა ცო და ე ოსი ჩუახაე"}]	თუშური	2026-02-02 15:39:16.929348	2026-02-12 21:03:57.202361
\.


--
-- Data for Name: audio_segments; Type: TABLE DATA; Schema: public; Owner: luka
--

COPY public.audio_segments (id, "time", text, audio_file, created_at, updated_at) FROM stdin;
1	0:00	ცჰ̧ენ დენი მეზობლა ბადრივ დაკლავდინათხ მე მარწყვ ლაჰბა დეწრათხ დახაჼ ჰ̧ამივაჸ ჰ̧ალეცინეთხ კალთი დეხნათხ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
2	0:18	ო ცჰ̧ენ ჲაჰ̧გო ჲახხეჼ კოწლი ჲატტერ ზორეშ ლამზურ ჲოჰ̧ ჲარე ო მარწყვ ლეჰ̧ბოშ ცჰ̧ენ ჯაგენ ძირეჼ ჩუთჳიჰისნორ ჰ̧ალჰაწამელჩე მიჩედაგ ბადრი ცო დაგეგ ნაყბისტი ცო და	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
3	0:41	ი̄შ ოსი ე ცჰ̧ენ ჲაჰ̧ოვ ჯაგენ ძირეხ ჲახეჩ კოწლივ ჩუი̄ხკნორ  შატბოლლინ ჩუაეხკიჼ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
4	1:00	ჰ̧ალხილუ ჰ̧ალცოჴეთთმაკ ჰ̧ალხილუ ჰ̧ალცოჴეთთმაკ ოშტუჼ ეაღ ოსი ჲათხეშ ჴეჼ ცჰ̧ა ჰ̧აწუკ გუდალʻე ო ჰ̧ეწკეგ ალʻიჼ ჯელელეჼ ე კოწლი დაჰ̧ჲასტალ სონენ ჰ̧ალცოჴეთთმაკსონენ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
5	1:29	დაჰ̧დეხნოერ ო ჰ̧აწუკ მოჰ̧ეჴდა ქოკივ დაჰ̧აესტნორ ჰ̧ალჴეთთეჼ სოდაჰ̧აჭენ ცომენა ცოდა ცო ხეჸ მიჩ ჲეწ ჲახაჼ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
6	1:44	ოშტო ჲუტ ჲუტ ჲუტე ჴე ჲექიჼ მენხჳიჩ ნაყვ ჲაღოსეჼ ჴეჼ ეშმივ დექიჼ მე ასა ნაყვ ჲოლეჼ ოშტო ასი ლელინჩოღა შარნაჲახე ჲოწჲალიჼ ო ბილკეხ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
7	2:15	ჲუტ ჲუტ ჲუტე მიჩახ სინათლ ჲაგიჼ ცჰ̧ენ წენი დაჰ̧ჲაჰენ ო წენიგ ოსი ჲათხეშ ჩუა_ხაე	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
8	2:34	ოსი ო წინრე ცჰ̧ა ბადერ ნჸე გუდალʻე ჲაგი ო ჲოჰ̧ მე ოსი ჲათხეშ ეაღერ ჴენ ჩუ_ჲახენ შერ ნანეგ ალʻიჼ მე ოსი ცჰ̧ა ბადერ დათხეშ ედაღენ ო ნანას ალʻიჼ მე ჩუდოდებათ ჩუდოდებათენ ნეჸ ჲახენ ო ჲოჰ̧ ო ჲეშმა ჲოჰ̧ ჩუაიკეჼ ო ჲოჰ̧ ჩუახაიეჼ ოსი	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
9	3:10	ჴე ინც ფსარლო ჲეჸეჼ ჰამივა შუ-შუა მათთიშ ჩუდარჟდიეჼ ო ჲოჰ̧ ო ნანას ოშტვიჩ ედგლე იშიეჼ მე ცოჰანა ცომ ჰოჸრალ ჰ̧ალჴეთთენ ო ნან ნეკი ჺრდანა იალʻეჼ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
10	3:41	ო ცჰ̧ა ჲოჰ̧ ოშტონკა ჲარმე ჰ̧ალჴეთიჼ ნანას მე ნეკი ჺირდორʻ ო ჲოჰ̧ დაჰ̧ჺერʻევა ლე̄რ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
11	3:54	ჴე ალʻიჼ ო ჲაჰოგ მე აჰ სომფენიხ ჺიშენ სოცი ჺიშენ ჴეჼ ჩუდიფშეჼ შიკე ცჰ̧აღ ჩუდიფშეჼ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
12	4:12	ბჳის ჰალჴეთთენ ო ნან ო ჺირდიენ ნეკივ დაჰ̧ჲახენ ო დაკლივ მე ესე ო დოტდიენ ჰ̧აშ დიშენ ცოჰმა ოსი ო შარიჼ ჲოჰ̧ იშურ მაქ ჲახენ ო შარიჼ ჲოჰ̧ დაჰ̧აჺევიჼ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
13	4:39	ჺურდეჼ ჰ̧ალჴეთთენ ო ნან ალʻიჼ მე ისი ჰერწ ლათთენ წე ჰ̧ალიააეთ ჰ̧ალოჴეხკდებათ დითხენ ჰ̧ალჴექდიენ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
14	4:58	ფსარლო იეენ ო ნან სამუშავმაქრეჼ იე̄ნ შერ ბადრეჼ ჰეჭა ჴეთიჼ ჴე იათხეშ ჩუა_ხაე ო ნან სე ხანათენ ხა დალო სე ტანათენ ტა დალო	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
15	5:27	ო ბადრივ ო ჲოჰ̧ მენუხა ნანას დაჰეწერ ევა ო ბადრივ გაფრთხილბადიეჼ მე აჰ̧ შარნღობ ესერე ცოჰეკა თხე ნანას დაჰ̧ევოჰ̧ენ ო ჲოჰ̧ ჰ̧ალჴეთთენ შარნაჲახენ	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
16	6:13	ჲუტ ჲუტ ჲუტე ო ბილკევ ჲუტე ჰ̧ულნოღა ჲუტე ცო ხე მიჩ ჲეწ ჲახაჼ ე ცჰ̧ენ ქოხეგა ოთთე ჩუჰ̧აჭენ ცომენა ცო და ე ოსი ჩუახაე	\N	2026-02-12 22:50:51.695594	2026-02-12 22:50:51.695594
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: luka
--

COPY public.users (id, username, email, password, img, is_admin, is_active, created_at, updated_at) FROM stdin;
1	luka	lukaziskara@gmail.com	$2b$05$AoBdwsjxlPCuRwwhXSKedegwORgmXP8uMErDlLB.G3ofmXxzG15vS	\N	f	f	2026-02-01 14:26:17.884024	2026-02-01 14:26:17.884024
\.


--
-- Data for Name: words; Type: TABLE DATA; Schema: public; Owner: luka
--

COPY public.words (id, user_id, the_word, translation, language, definition, part_of_speech, base_form, is_public, created_at, updated_at) FROM stdin;
1	\N	ალʻიჼ	უთხრა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
2	\N	ასა	ბოჩოლების	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
3	\N	ასი	ბოჩოლები	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
4	\N	აჰ	შენ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
5	\N	აჰ̧	შენ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
6	\N	ბადერ	ბავშვი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
7	\N	ბადრეჼ	ბავშვის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
8	\N	ბადრი	ბავშვები	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
9	\N	ბადრივ	ბავშვებმა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
10	\N	ბილკევ	ბილიკით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
11	\N	ბილკეხ	ბილიკს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
12	\N	ბჳის	ღამით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
13	\N	გაფრთხილბადიეჼ	გააფრთხილეს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
14	\N	გუდალʻე	გამოჩნდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
15	\N	და	არის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
16	\N	დაგეგ	არიან	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
17	\N	დათხეშ	ტირილით(ახლა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
18	\N	დაკლავდინათხ	მოვიფიქრეთ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
19	\N	დაკლივ	ფიქრობს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
20	\N	დალო	არისო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
21	\N	დახაჼ	წავსულიყავით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
22	\N	დაჰ̧აესტნორ	თურმეგახსნა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
23	\N	დაჰ̧აჺევიჼ	მოკლა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
24	\N	დაჰ̧დეხნოერ	მისულიყო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
25	\N	დაჰ̧ევოჰ̧ენ	მოგკლავსო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
26	\N	დაჰ̧ჲასტალ	გახსენი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
27	\N	დაჰ̧ჲახენ	მივიდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
28	\N	დაჰ̧ჲაჰენ	მივიდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
29	\N	დაჰ̧ჺერʻევა	მოკვლა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
30	\N	დაჰეწერ	უნდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
31	\N	დენი	დღეს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
32	\N	დექიჼ	დაიძახეს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
33	\N	დეწრათხ	უნდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
34	\N	დეხნათხ	წავედით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
35	\N	დითხენ	ხორციო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
36	\N	დიშენ	წევსო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
37	\N	დოტდიენ	მოყვანილი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
38	\N	ე	ამ/და/ეს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
39	\N	ეაღ	ზის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
40	\N	ეაღერ	იჯდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
41	\N	ედაღენ	ზისო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
42	\N	ედგლე	ადგილას	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
43	\N	ევა	მოეკლა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
44	\N	ესე	აქ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
45	\N	ესერე	აქედან	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
46	\N	ეშმივ	ეშმაკებმა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
47	\N	ზორეშ	ძალიან	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
48	\N	თხე	ჩვენი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
49	\N	ი̄შ	წოლა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
50	\N	იათხეშ	ტირილით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
51	\N	იალʻეჼ	დაიწყო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
52	\N	იე̄ნ	დაბრუნდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
53	\N	იეენ	მოვიდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
54	\N	ინც	ეხლა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
55	\N	ისი	მანდ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
56	\N	იშიეჼ	დააწვინა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
57	\N	იშურ	იწვა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
58	\N	კალთი	კალათები	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
59	\N	კოწლი	ნაწნავები	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
60	\N	კოწლივ	ნაწნავებით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
61	\N	ლათთენ	დგასო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
62	\N	ლამზურ	ლამაზი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
63	\N	ლაჰბა	საკრეფად	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
64	\N	ლე̄რ	უნდოდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
65	\N	ლელინჩოღა	ნავალზე	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
66	\N	ლეჰ̧ბოშ	კრეფისას	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
67	\N	მათთიშ	ლოგინები	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
68	\N	მარწყვ	მარწყვი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
69	\N	მაქ	ზედ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
70	\N	მე	რომ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
71	\N	მეზობლა	მეზობლის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
72	\N	მენუხა	რომელიც	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
73	\N	მენხჳიჩ	რომელი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
74	\N	მიჩ	სად	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
75	\N	მიჩახ	სადღაც	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
76	\N	მიჩედაგ	სადღაა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
77	\N	მოჰ̧ეჴდა	როგორღაც	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
78	\N	ნან	დედა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
79	\N	ნანას	დედამ/დედას	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
80	\N	ნანეგ	დედას	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
81	\N	ნაყბისტი	ამხანაგები	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
82	\N	ნაყვ	გზით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
83	\N	ნეკი	დანები	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
84	\N	ნეკივ	დანებით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
85	\N	ნეჸ	გარეთ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
86	\N	ნჸე	გარეთ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
87	\N	ო	იმ/ის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
88	\N	ოთთე	მიადგა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
89	\N	ოსი	იქ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
90	\N	ოშტვიჩ	ისეთ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
91	\N	ოშტო	ამგვარად	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
92	\N	ოშტონკა	ისეთი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
93	\N	ოშტუჼ	ისეთი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
94	\N	სამუშავმაქრეჼ	სამუშაოდან	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
95	\N	სე	ჩემი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
96	\N	სინათლ	სინათლე	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
97	\N	სოდაჰ̧აჭენ	გაიხედ-გამოიხედა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
98	\N	სომფენიხ	ჩემს_მახლობლად	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
99	\N	სონენ	ჩემთვის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
100	\N	სოცი	ჩემთან	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
101	\N	ტა	ბარძაყი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
102	\N	ტანათენ	ტანათასი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
103	\N	ფსარლო	საღამო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
104	\N	ქოკივ	ფეხებით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
105	\N	ქოხეგა	ქოხს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
106	\N	შარიჼ	თავისი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
107	\N	შარნაჲახე	წავიდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
108	\N	შარნაჲახენ	წავიდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
109	\N	შარნღობ	წადი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
110	\N	შატბოლლინ	განასკვა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
111	\N	შერ	თავის/თავისი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
112	\N	შიკე	ორივენი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
113	\N	შუ-შუა	თავ-თავისი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
114	\N	ჩუ_ჲახენ	შევიდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
115	\N	ჩუა_ხაე	დაჯდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
116	\N	ჩუაეხკიჼ	მიაბა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
117	\N	ჩუაიკეჼ	შეიყვანა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
118	\N	ჩუახაე	დაჯდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
119	\N	ჩუახაიეჼ	დასვა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
120	\N	ჩუდარჟდიეჼ	გაშალეს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
121	\N	ჩუდიფშეჼ	დაწვნენ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
122	\N	ჩუდოდებათ	შემოიყვანეთ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
123	\N	ჩუდოდებათენ	შემოიყვანეთო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
124	\N	ჩუთჳიჰისნორ	ჩასძინებოდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
125	\N	ჩუი̄ხკნორ	მიაბა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
126	\N	ჩუჰ̧აჭენ	შეიხედა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
127	\N	ცო	არ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
128	\N	ცოდა	არაა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
129	\N	ცომ	არაფერი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
130	\N	ცომენა	არავინ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
131	\N	ცოჰანა	არავის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
132	\N	ცოჰეკა	თორემ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
133	\N	ცოჰმა	თუარადა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
134	\N	ცჰ̧ა	ერთი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
135	\N	ცჰ̧აღ	ერთად	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
136	\N	ცჰ̧ენ	ერთ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
137	\N	ძირეხ	ძირზე	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
138	\N	ძირეჼ	ძირთან	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
139	\N	წე	ცეცხლი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
140	\N	წენი	სახლში	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
141	\N	წენიგ	სახლთან	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
142	\N	წინრე	სახლიდან	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
143	\N	ხა	მხარი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
144	\N	ხანათენ	ხანათას	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
145	\N	ხე	იცის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
146	\N	ხეჸ	იცის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
147	\N	ჯაგენ	ძეძვის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
148	\N	ჯელელეჼ	ხვეწნით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
149	\N	ჰ̧ალეცინეთხ	ავიღეთ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
150	\N	ჰ̧ალიააეთ	დაანთეთ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
151	\N	ჰ̧ალოჴეხკდებათ	მოხარშეთ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
152	\N	ჰ̧ალცოჴეთთმაკ	ვერდგება	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
153	\N	ჰ̧ალცოჴეთთმაკსონენ	ვერვდგები	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
154	\N	ჰ̧ალხილუ	წამოიწევს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
155	\N	ჰ̧ალჰაწამელჩე	გაღვიძებისას	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
156	\N	ჰ̧ალჴეთთენ	ადგა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
157	\N	ჰ̧ალჴეთთეჼ	ადგა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
158	\N	ჰ̧ალჴეთიჼ	მიხვდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
159	\N	ჰ̧ალჴექდიენ	მოამზადეს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
160	\N	ჰ̧ამივაჸ	ყველამ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
161	\N	ჰ̧აშ	სტუმარი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
162	\N	ჰ̧აწუკ	ჩიტი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
163	\N	ჰ̧ეწკეგ	ჩიტს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
164	\N	ჰ̧ულნოღა	ტყით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
165	\N	ჰალჴეთთენ	ადგა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
166	\N	ჰამივა	ყველამ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
167	\N	ჰერწ	ქვაბი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
168	\N	ჰეჭა	სუნი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
169	\N	ჰოჸრალ	გაეგო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
170	\N	ჲაგი	დაინახა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
171	\N	ჲაგიჼ	დაინახა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
172	\N	ჲათხეშ	ტირილით(მაშინ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
173	\N	ჲარე	იყო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
174	\N	ჲარმე	იყო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
175	\N	ჲატტერ	ეყარა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
176	\N	ჲაღოსეჼ	წამოვიდე	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
177	\N	ჲახაჼ	წავიდეს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
178	\N	ჲახენ	მივიდა/წავიდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
179	\N	ჲახეჩ	გრძელით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
180	\N	ჲახხეჼ	გრძელი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
181	\N	ჲაჰ̧გო	გოგოს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
182	\N	ჲაჰ̧ოვ	გოგომ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
183	\N	ჲაჰოგ	გოგოს	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
184	\N	ჲექიჼ	დაიძახა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
185	\N	ჲეშმა	ეშმაკების	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
186	\N	ჲეწ	უნდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
187	\N	ჲეჸეჼ	მოვიდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
188	\N	ჲოლეჼ	წამოდი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
189	\N	ჲოწჲალიჼ	გაყვა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
190	\N	ჲოჰ̧	გოგო	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
191	\N	ჲუტ	მიდის	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
192	\N	ჲუტე	მიდის_და	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
193	\N	ჴე	მერე	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
194	\N	ჴეთიჼ	ეცა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
195	\N	ჴენ	შემდეგ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
196	\N	ჴეჼ	მერე/შემდეგ	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
197	\N	ჺირდიენ	გალესილი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
198	\N	ჺირდორʻ	ლესავდა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
199	\N	ჺიშენ	დაწექი	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
200	\N	ჺრდანა	ლესვა	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
201	\N	ჺურდეჼ	დილით	tushetian	\N	\N	\N	t	2026-02-12 20:59:03.954587	2026-02-12 20:59:03.954587
\.


--
-- Name: audio_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: luka
--

SELECT pg_catalog.setval('public.audio_data_id_seq', 1, true);


--
-- Name: audio_segments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: luka
--

SELECT pg_catalog.setval('public.audio_segments_id_seq', 16, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: luka
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: words_id_seq; Type: SEQUENCE SET; Schema: public; Owner: luka
--

SELECT pg_catalog.setval('public.words_id_seq', 201, true);


--
-- Name: audio_data audio_data_pkey; Type: CONSTRAINT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.audio_data
    ADD CONSTRAINT audio_data_pkey PRIMARY KEY (id);


--
-- Name: audio_segments audio_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.audio_segments
    ADD CONSTRAINT audio_segments_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: words words_pkey; Type: CONSTRAINT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.words
    ADD CONSTRAINT words_pkey PRIMARY KEY (id);


--
-- Name: idx_audio_data_language; Type: INDEX; Schema: public; Owner: luka
--

CREATE INDEX idx_audio_data_language ON public.audio_data USING btree (language);


--
-- Name: idx_audio_data_status; Type: INDEX; Schema: public; Owner: luka
--

CREATE INDEX idx_audio_data_status ON public.audio_data USING btree (status);


--
-- Name: idx_audio_segments_time; Type: INDEX; Schema: public; Owner: luka
--

CREATE INDEX idx_audio_segments_time ON public.audio_segments USING btree ("time");


--
-- Name: idx_words_is_public; Type: INDEX; Schema: public; Owner: luka
--

CREATE INDEX idx_words_is_public ON public.words USING btree (is_public);


--
-- Name: idx_words_language; Type: INDEX; Schema: public; Owner: luka
--

CREATE INDEX idx_words_language ON public.words USING btree (language);


--
-- Name: idx_words_the_word; Type: INDEX; Schema: public; Owner: luka
--

CREATE INDEX idx_words_the_word ON public.words USING btree (the_word);


--
-- Name: idx_words_user_id; Type: INDEX; Schema: public; Owner: luka
--

CREATE INDEX idx_words_user_id ON public.words USING btree (user_id);


--
-- Name: words words_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: luka
--

ALTER TABLE ONLY public.words
    ADD CONSTRAINT words_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict LKpE8EAsLbgaLBN5XuPxbQsYMgNNetjGNhM4KBXeXvC6dTB6C5Px88jrgfX5NhO

