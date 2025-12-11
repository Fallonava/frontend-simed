--
-- PostgreSQL database dump
--

\restrict YxvJJCB4cTWadcnP9oY1NedVu3YuMcq1rWNdgmVM7bVkjbZ9GbuRXKGnJoZrTtp

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Counter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Counter" (
    id integer NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'CLOSED'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Counter" OWNER TO postgres;

--
-- Name: Counter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Counter_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Counter_id_seq" OWNER TO postgres;

--
-- Name: Counter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Counter_id_seq" OWNED BY public."Counter".id;


--
-- Name: DailyQuota; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DailyQuota" (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    max_quota integer NOT NULL,
    current_count integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'OPEN'::text NOT NULL
);


ALTER TABLE public."DailyQuota" OWNER TO postgres;

--
-- Name: DailyQuota_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."DailyQuota_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DailyQuota_id_seq" OWNER TO postgres;

--
-- Name: DailyQuota_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."DailyQuota_id_seq" OWNED BY public."DailyQuota".id;


--
-- Name: Doctor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Doctor" (
    id integer NOT NULL,
    name text NOT NULL,
    specialist text NOT NULL,
    photo_url text,
    poliklinik_id integer NOT NULL
);


ALTER TABLE public."Doctor" OWNER TO postgres;

--
-- Name: DoctorLeave; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DoctorLeave" (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    reason text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DoctorLeave" OWNER TO postgres;

--
-- Name: DoctorLeave_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."DoctorLeave_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DoctorLeave_id_seq" OWNER TO postgres;

--
-- Name: DoctorLeave_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."DoctorLeave_id_seq" OWNED BY public."DoctorLeave".id;


--
-- Name: DoctorSchedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DoctorSchedule" (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    day integer NOT NULL,
    "time" text NOT NULL
);


ALTER TABLE public."DoctorSchedule" OWNER TO postgres;

--
-- Name: DoctorSchedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."DoctorSchedule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DoctorSchedule_id_seq" OWNER TO postgres;

--
-- Name: DoctorSchedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."DoctorSchedule_id_seq" OWNED BY public."DoctorSchedule".id;


--
-- Name: Doctor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Doctor_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Doctor_id_seq" OWNER TO postgres;

--
-- Name: Doctor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Doctor_id_seq" OWNED BY public."Doctor".id;


--
-- Name: MedicalRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MedicalRecord" (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    queue_id integer,
    visit_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subjective text NOT NULL,
    objective text NOT NULL,
    assessment text NOT NULL,
    plan text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    diastolic integer,
    heart_rate integer,
    height double precision,
    systolic integer,
    temperature double precision,
    weight double precision
);


ALTER TABLE public."MedicalRecord" OWNER TO postgres;

--
-- Name: MedicalRecord_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MedicalRecord_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MedicalRecord_id_seq" OWNER TO postgres;

--
-- Name: MedicalRecord_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MedicalRecord_id_seq" OWNED BY public."MedicalRecord".id;


--
-- Name: Medicine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Medicine" (
    id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    category text,
    stock integer DEFAULT 0 NOT NULL,
    unit text NOT NULL,
    price double precision DEFAULT 0 NOT NULL,
    expiry timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Medicine" OWNER TO postgres;

--
-- Name: Medicine_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Medicine_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Medicine_id_seq" OWNER TO postgres;

--
-- Name: Medicine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Medicine_id_seq" OWNED BY public."Medicine".id;


--
-- Name: Patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Patient" (
    id integer NOT NULL,
    nik text NOT NULL,
    no_rm text NOT NULL,
    name text NOT NULL,
    gender text NOT NULL,
    birth_date timestamp(3) without time zone NOT NULL,
    address text,
    phone text,
    bpjs_no text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    allergies text
);


ALTER TABLE public."Patient" OWNER TO postgres;

--
-- Name: Patient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Patient_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Patient_id_seq" OWNER TO postgres;

--
-- Name: Patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Patient_id_seq" OWNED BY public."Patient".id;


--
-- Name: Playlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Playlist" (
    id integer NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    duration integer DEFAULT 10 NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Playlist" OWNER TO postgres;

--
-- Name: Playlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Playlist_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Playlist_id_seq" OWNER TO postgres;

--
-- Name: Playlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Playlist_id_seq" OWNED BY public."Playlist".id;


--
-- Name: Poliklinik; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Poliklinik" (
    id integer NOT NULL,
    name text NOT NULL,
    queue_code text NOT NULL
);


ALTER TABLE public."Poliklinik" OWNER TO postgres;

--
-- Name: Poliklinik_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Poliklinik_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Poliklinik_id_seq" OWNER TO postgres;

--
-- Name: Poliklinik_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Poliklinik_id_seq" OWNED BY public."Poliklinik".id;


--
-- Name: Prescription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Prescription" (
    id integer NOT NULL,
    medical_record_id integer NOT NULL,
    doctor_id integer NOT NULL,
    patient_id integer NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Prescription" OWNER TO postgres;

--
-- Name: PrescriptionItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PrescriptionItem" (
    id integer NOT NULL,
    prescription_id integer NOT NULL,
    medicine_id integer NOT NULL,
    quantity integer NOT NULL,
    dosage text NOT NULL,
    notes text
);


ALTER TABLE public."PrescriptionItem" OWNER TO postgres;

--
-- Name: PrescriptionItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PrescriptionItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PrescriptionItem_id_seq" OWNER TO postgres;

--
-- Name: PrescriptionItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PrescriptionItem_id_seq" OWNED BY public."PrescriptionItem".id;


--
-- Name: Prescription_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Prescription_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Prescription_id_seq" OWNER TO postgres;

--
-- Name: Prescription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Prescription_id_seq" OWNED BY public."Prescription".id;


--
-- Name: Queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Queue" (
    id integer NOT NULL,
    daily_quota_id integer NOT NULL,
    queue_number integer NOT NULL,
    queue_code text NOT NULL,
    status text DEFAULT 'WAITING'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    patient_id integer
);


ALTER TABLE public."Queue" OWNER TO postgres;

--
-- Name: Queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Queue_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Queue_id_seq" OWNER TO postgres;

--
-- Name: Queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Queue_id_seq" OWNED BY public."Queue".id;


--
-- Name: Sequence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sequence" (
    id integer NOT NULL,
    key text NOT NULL,
    value integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Sequence" OWNER TO postgres;

--
-- Name: Sequence_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Sequence_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Sequence_id_seq" OWNER TO postgres;

--
-- Name: Sequence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Sequence_id_seq" OWNED BY public."Sequence".id;


--
-- Name: Setting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Setting" (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Setting" OWNER TO postgres;

--
-- Name: Setting_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Setting_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Setting_id_seq" OWNER TO postgres;

--
-- Name: Setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Setting_id_seq" OWNED BY public."Setting".id;


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    id integer NOT NULL,
    invoice_no text NOT NULL,
    medical_record_id integer NOT NULL,
    patient_id integer NOT NULL,
    total_amount double precision NOT NULL,
    status text DEFAULT 'UNPAID'::text NOT NULL,
    payment_method text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- Name: TransactionItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TransactionItem" (
    id integer NOT NULL,
    transaction_id integer NOT NULL,
    description text NOT NULL,
    amount double precision NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."TransactionItem" OWNER TO postgres;

--
-- Name: TransactionItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TransactionItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TransactionItem_id_seq" OWNER TO postgres;

--
-- Name: TransactionItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TransactionItem_id_seq" OWNED BY public."TransactionItem".id;


--
-- Name: Transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Transaction_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Transaction_id_seq" OWNER TO postgres;

--
-- Name: Transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Transaction_id_seq" OWNED BY public."Transaction".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Counter id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Counter" ALTER COLUMN id SET DEFAULT nextval('public."Counter_id_seq"'::regclass);


--
-- Name: DailyQuota id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DailyQuota" ALTER COLUMN id SET DEFAULT nextval('public."DailyQuota_id_seq"'::regclass);


--
-- Name: Doctor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Doctor" ALTER COLUMN id SET DEFAULT nextval('public."Doctor_id_seq"'::regclass);


--
-- Name: DoctorLeave id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorLeave" ALTER COLUMN id SET DEFAULT nextval('public."DoctorLeave_id_seq"'::regclass);


--
-- Name: DoctorSchedule id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorSchedule" ALTER COLUMN id SET DEFAULT nextval('public."DoctorSchedule_id_seq"'::regclass);


--
-- Name: MedicalRecord id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord" ALTER COLUMN id SET DEFAULT nextval('public."MedicalRecord_id_seq"'::regclass);


--
-- Name: Medicine id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Medicine" ALTER COLUMN id SET DEFAULT nextval('public."Medicine_id_seq"'::regclass);


--
-- Name: Patient id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Patient" ALTER COLUMN id SET DEFAULT nextval('public."Patient_id_seq"'::regclass);


--
-- Name: Playlist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Playlist" ALTER COLUMN id SET DEFAULT nextval('public."Playlist_id_seq"'::regclass);


--
-- Name: Poliklinik id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Poliklinik" ALTER COLUMN id SET DEFAULT nextval('public."Poliklinik_id_seq"'::regclass);


--
-- Name: Prescription id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription" ALTER COLUMN id SET DEFAULT nextval('public."Prescription_id_seq"'::regclass);


--
-- Name: PrescriptionItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrescriptionItem" ALTER COLUMN id SET DEFAULT nextval('public."PrescriptionItem_id_seq"'::regclass);


--
-- Name: Queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Queue" ALTER COLUMN id SET DEFAULT nextval('public."Queue_id_seq"'::regclass);


--
-- Name: Sequence id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sequence" ALTER COLUMN id SET DEFAULT nextval('public."Sequence_id_seq"'::regclass);


--
-- Name: Setting id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Setting" ALTER COLUMN id SET DEFAULT nextval('public."Setting_id_seq"'::regclass);


--
-- Name: Transaction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction" ALTER COLUMN id SET DEFAULT nextval('public."Transaction_id_seq"'::regclass);


--
-- Name: TransactionItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionItem" ALTER COLUMN id SET DEFAULT nextval('public."TransactionItem_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Counter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Counter" (id, name, status, "createdAt") FROM stdin;
1	1	CLOSED	2025-12-11 14:49:04.261
\.


--
-- Data for Name: DailyQuota; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DailyQuota" (id, doctor_id, date, max_quota, current_count, status) FROM stdin;
3	5	2025-12-09 17:00:00	30	0	OPEN
4	6	2025-12-09 17:00:00	30	0	OPEN
5	7	2025-12-09 17:00:00	30	0	OPEN
6	8	2025-12-09 17:00:00	30	0	OPEN
7	9	2025-12-09 17:00:00	30	0	OPEN
9	16	2025-12-09 17:00:00	30	0	OPEN
11	18	2025-12-09 17:00:00	30	0	OPEN
12	19	2025-12-09 17:00:00	30	0	OPEN
13	20	2025-12-09 17:00:00	30	0	OPEN
18	27	2025-12-09 17:00:00	30	0	OPEN
19	28	2025-12-09 17:00:00	30	0	OPEN
20	29	2025-12-09 17:00:00	30	0	OPEN
21	31	2025-12-09 17:00:00	30	0	OPEN
22	32	2025-12-09 17:00:00	30	1	OPEN
15	23	2025-12-09 17:00:00	30	1	OPEN
10	17	2025-12-09 17:00:00	30	1	OPEN
16	24	2025-12-09 17:00:00	30	2	OPEN
23	2	2025-12-09 17:00:00	50	4	OPEN
2	3	2025-12-09 17:00:00	30	1	OPEN
1	1	2025-12-09 17:00:00	30	2	OPEN
24	15	2025-12-09 17:00:00	50	1	OPEN
8	13	2025-12-09 17:00:00	30	1	OPEN
14	21	2025-12-09 17:00:00	30	5	OPEN
25	25	2025-12-09 17:00:00	50	1	OPEN
17	26	2025-12-09 17:00:00	30	1	OPEN
32	11	2025-12-10 17:00:00	30	0	OPEN
37	18	2025-12-10 17:00:00	30	0	OPEN
38	19	2025-12-10 17:00:00	30	0	OPEN
39	20	2025-12-10 17:00:00	30	0	OPEN
40	21	2025-12-10 17:00:00	30	0	OPEN
41	23	2025-12-10 17:00:00	30	0	OPEN
42	25	2025-12-10 17:00:00	30	0	OPEN
43	28	2025-12-10 17:00:00	30	0	OPEN
44	29	2025-12-10 17:00:00	30	0	OPEN
45	30	2025-12-10 17:00:00	30	0	OPEN
46	31	2025-12-10 17:00:00	30	0	OPEN
26	1	2025-12-10 17:00:00	30	3	OPEN
47	2	2025-12-10 17:00:00	50	1	OPEN
28	5	2025-12-10 17:00:00	30	3	OPEN
36	17	2025-12-10 17:00:00	30	1	OPEN
27	3	2025-12-10 17:00:00	30	4	OPEN
31	10	2025-12-10 17:00:00	30	1	OPEN
33	12	2025-12-10 17:00:00	30	2	OPEN
29	6	2025-12-10 17:00:00	30	2	OPEN
30	7	2025-12-10 17:00:00	30	3	OPEN
35	15	2025-12-10 17:00:00	30	3	OPEN
34	14	2025-12-10 17:00:00	30	1	OPEN
48	1	2025-12-11 17:00:00	30	0	OPEN
49	2	2025-12-11 17:00:00	30	0	OPEN
50	3	2025-12-11 17:00:00	30	0	OPEN
51	4	2025-12-11 17:00:00	30	0	OPEN
52	5	2025-12-11 17:00:00	30	0	OPEN
53	6	2025-12-11 17:00:00	30	0	OPEN
54	7	2025-12-11 17:00:00	30	0	OPEN
55	9	2025-12-11 17:00:00	30	0	OPEN
56	13	2025-12-11 17:00:00	30	0	OPEN
57	14	2025-12-11 17:00:00	30	0	OPEN
58	15	2025-12-11 17:00:00	30	0	OPEN
59	17	2025-12-11 17:00:00	30	0	OPEN
60	18	2025-12-11 17:00:00	30	0	OPEN
61	19	2025-12-11 17:00:00	30	0	OPEN
62	20	2025-12-11 17:00:00	30	0	OPEN
63	21	2025-12-11 17:00:00	30	0	OPEN
64	22	2025-12-11 17:00:00	30	0	OPEN
65	23	2025-12-11 17:00:00	30	0	OPEN
66	25	2025-12-11 17:00:00	30	0	OPEN
67	28	2025-12-11 17:00:00	30	0	OPEN
68	29	2025-12-11 17:00:00	30	0	OPEN
69	31	2025-12-11 17:00:00	30	0	OPEN
70	32	2025-12-11 17:00:00	30	0	OPEN
\.


--
-- Data for Name: Doctor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Doctor" (id, name, specialist, photo_url, poliklinik_id) FROM stdin;
1	dr. RR Irma Rossyana, Sp. A	Anak	https://via.placeholder.com/150	1
2	drg. Robby Romadhanie, Sp. BMM	Bedah Mulut	https://via.placeholder.com/150	2
3	dr. Endro RI Wibowo, Sp. B	Bedah Umum	https://via.placeholder.com/150	3
4	dr. Suroso, Sp. B	Bedah Umum	https://via.placeholder.com/150	3
5	Bingsar Galih	Fisioterapis	https://via.placeholder.com/150	4
6	Panca Nugraha	Fisioterapis	https://via.placeholder.com/150	4
7	Nur Kumala Ratri	Fisioterapis	https://via.placeholder.com/150	4
8	drg. Dyah Tri Kusuma, Sp. KG	Gigi Konservasi	https://via.placeholder.com/150	5
9	drg. Rafika Yusniar	Gigi Umum	https://via.placeholder.com/150	6
10	drg. Yulinda Primilisa	Gigi Umum	https://via.placeholder.com/150	6
11	dr. Lita Hati Dwi PE, Sp. JP	Jantung	https://via.placeholder.com/150	7
12	dr. Gatot Hananta, Sp. OG	Kandungan	https://via.placeholder.com/150	8
13	dr. Hepta Lidia, Sp. OG	Kandungan	https://via.placeholder.com/150	8
14	dr. Pritasari Dewi D, Sp. OG	Kandungan	https://via.placeholder.com/150	8
15	dr. Taufik Hidayanto, Sp. KJ	Kedokteran Jiwa	https://via.placeholder.com/150	9
16	dr. Nova Kurniasari, Sp. KJ	Kedokteran Jiwa	https://via.placeholder.com/150	9
17	dr. Wahid Heru Widodo, Sp. M	Mata	https://via.placeholder.com/150	10
18	dr. Muhammad Luthfi, Sp. OT	Orthopaedi	https://via.placeholder.com/150	11
19	dr. Nanda Notario, Sp. OT	Orthopaedi	https://via.placeholder.com/150	11
20	dr. Oke Viska, Sp. P	Paru	https://via.placeholder.com/150	12
21	dr. Leo Chandra WPW, Sp. PD, M. KES	Penyakit Dalam	https://via.placeholder.com/150	13
22	dr. Sigit Purnomohadi, Sp. PD	Penyakit Dalam	https://via.placeholder.com/150	13
23	Siti K Sa'diyah, M. Psi. Psikologi	Psikologi	https://via.placeholder.com/150	14
24	dr. Syarif Hasan, Sp. KFR	Rehab Medik	https://via.placeholder.com/150	15
25	dr. Ajeng Putri, Sp. N	Saraf	https://via.placeholder.com/150	16
26	dr. Setyo Dirahayu, Sp. N	Saraf	https://via.placeholder.com/150	16
27	dr. Ahmad Tanji, Sp. N	Saraf	https://via.placeholder.com/150	16
28	Nony Eka Ariyandini, S. Tr. Kes	Terapi Wicara	https://via.placeholder.com/150	17
29	dr. Lirans Tia K, Sp. THT KL	THT KL	https://via.placeholder.com/150	18
30	dr. Wahyu Dwi K, Sp. THT KL	THT KL	https://via.placeholder.com/150	18
31	dr. Sofian Palupi	Umum	https://via.placeholder.com/150	19
32	dr. Eko Subekti, Sp. U	Urologi	https://via.placeholder.com/150	20
\.


--
-- Data for Name: DoctorLeave; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DoctorLeave" (id, doctor_id, date, reason, created_at) FROM stdin;
1	1	2025-12-13 00:00:00	Cuti	2025-12-11 00:30:30.403
2	1	2025-12-22 00:00:00	Cuti	2025-12-11 00:30:30.403
3	1	2025-12-23 00:00:00	Cuti	2025-12-11 00:30:30.403
4	1	2025-12-24 00:00:00	Cuti	2025-12-11 00:30:30.403
5	1	2025-12-26 00:00:00	Cuti	2025-12-11 00:30:30.403
6	1	2025-12-27 00:00:00	Cuti	2025-12-11 00:30:30.403
7	1	2025-12-31 00:00:00	Cuti	2025-12-11 00:30:30.403
8	1	2025-12-25 00:00:00	Libur Nasional	2025-12-11 00:30:30.403
9	1	2026-01-01 00:00:00	Libur Nasional	2025-12-11 00:30:30.403
10	21	2025-12-04 00:00:00	Cuti	2025-12-11 00:30:30.403
11	21	2025-12-05 00:00:00	Cuti	2025-12-11 00:30:30.403
12	21	2025-12-06 00:00:00	Cuti	2025-12-11 00:30:30.403
13	30	2025-12-04 00:00:00	Cuti	2025-12-11 00:30:30.403
14	30	2025-12-06 00:00:00	Cuti	2025-12-11 00:30:30.403
15	29	2025-12-25 00:00:00	Libur Nasional	2025-12-11 00:30:30.403
16	29	2025-12-26 00:00:00	Cuti	2025-12-11 00:30:30.403
17	29	2025-12-29 00:00:00	Cuti	2025-12-11 00:30:30.403
18	16	2025-12-22 00:00:00	Cuti	2025-12-11 00:30:30.403
19	16	2025-12-23 00:00:00	Cuti	2025-12-11 00:30:30.403
20	15	2025-12-25 00:00:00	Cuti/Libur	2025-12-11 00:30:30.403
21	15	2025-12-26 00:00:00	Cuti/Libur	2025-12-11 00:30:30.403
22	32	2025-12-15 00:00:00	Cuti	2025-12-11 00:30:30.403
23	32	2025-12-16 00:00:00	Cuti	2025-12-11 00:30:30.403
24	32	2025-12-17 00:00:00	Cuti	2025-12-11 00:30:30.403
25	32	2025-12-18 00:00:00	Cuti	2025-12-11 00:30:30.403
26	32	2025-12-20 00:00:00	Cuti	2025-12-11 00:30:30.403
27	32	2025-12-21 00:00:00	Cuti	2025-12-11 00:30:30.403
28	32	2025-12-22 00:00:00	Cuti	2025-12-11 00:30:30.403
29	32	2025-12-19 00:00:00	Digantikan dr. Hotman	2025-12-11 00:30:30.403
30	26	2025-12-06 00:00:00	Cuti	2025-12-11 00:30:30.403
31	3	2025-12-25 00:00:00	Libur Nasional	2025-12-11 00:30:30.403
32	3	2026-01-01 00:00:00	Libur Nasional	2025-12-11 00:30:30.403
33	20	2025-12-06 00:00:00	Cuti	2025-12-11 00:30:30.403
34	20	2025-12-08 00:00:00	Cuti	2025-12-11 00:30:30.403
35	20	2025-12-20 00:00:00	Cuti	2025-12-11 00:30:30.403
36	2	2025-12-19 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
37	2	2025-12-20 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
38	2	2025-12-21 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
39	2	2025-12-22 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
40	2	2025-12-23 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
41	2	2025-12-24 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
42	2	2025-12-25 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
43	2	2025-12-26 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
44	2	2025-12-27 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
45	2	2025-12-28 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
46	2	2025-12-29 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
47	2	2025-12-30 00:00:00	Izin (Umroh)	2025-12-11 00:30:30.403
48	8	2025-12-24 00:00:00	Libur/Cuti (Dialihkan ke 7 Jan 2026)	2025-12-11 00:30:30.403
49	8	2025-12-31 00:00:00	Libur/Cuti (Dialihkan ke 7 Jan 2026)	2025-12-11 00:30:30.403
50	18	2025-12-12 00:00:00	Cuti	2025-12-11 00:30:30.403
51	18	2025-12-25 00:00:00	Cuti	2025-12-11 00:30:30.403
52	18	2025-12-26 00:00:00	Cuti	2025-12-11 00:30:30.403
53	11	2025-12-25 00:00:00	Libur Nasional	2025-12-11 00:30:30.403
54	11	2026-01-01 00:00:00	Libur Nasional	2025-12-11 00:30:30.403
55	11	2025-12-27 00:00:00	Cuti	2025-12-11 00:30:30.403
56	24	2025-12-25 00:00:00	Libur Nasional	2025-12-11 00:30:30.403
57	24	2025-12-31 00:00:00	Cuti	2025-12-11 00:30:30.403
\.


--
-- Data for Name: DoctorSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DoctorSchedule" (id, doctor_id, day, "time") FROM stdin;
1	1	1	08.00 - 14.00
2	1	2	08.00 - 14.00
3	1	3	08.00 - 14.00
4	1	4	08.00 - 14.00
5	1	5	08.00 - 14.00
6	1	6	08.00 - 14.00
7	2	2	08.00 - Selesai
8	2	5	14.00 - Selesai
9	2	6	14.00 - Selesai
10	3	1	07.00 - 10.00
11	3	2	07.00 - 10.00
12	3	3	07.00 - 10.00
13	3	4	07.00 - 10.00
14	3	1	14.00 - 17.00
15	3	2	14.00 - 17.00
16	3	3	14.00 - 17.00
17	3	4	14.00 - 17.00
18	3	5	13.00 - 17.00
19	3	6	13.00 - 15.00
20	4	5	07.00 - 09.00
21	4	6	07.00 - 09.00
22	5	1	13.00 - 18.00 (BPJS)
23	5	2	13.00 - 18.00 (BPJS)
24	5	3	13.00 - 18.00 (BPJS)
25	5	1	08.00 - 13.00 (Umum)
26	5	2	08.00 - 13.00 (Umum)
27	5	3	08.00 - 13.00 (Umum)
28	5	4	07.00 - 14.00 (Umum)
29	5	5	07.00 - 14.00 (Umum)
30	5	6	07.00 - 14.00 (Umum)
31	6	1	13.00 - 18.00 (BPJS)
32	6	2	13.00 - 18.00 (BPJS)
33	6	3	13.00 - 18.00 (BPJS)
34	6	1	08.00 - 13.00 (Umum)
35	6	2	08.00 - 13.00 (Umum)
36	6	3	08.00 - 13.00 (Umum)
37	6	4	07.00 - 14.00 (Umum)
38	6	5	07.00 - 14.00 (Umum)
39	6	6	07.00 - 14.00 (Umum)
40	7	1	13.00 - 18.00 (BPJS)
41	7	2	13.00 - 18.00 (BPJS)
42	7	3	13.00 - 18.00 (BPJS)
43	7	1	08.00 - 13.00 (Umum)
44	7	2	08.00 - 13.00 (Umum)
45	7	3	08.00 - 13.00 (Umum)
46	7	4	07.00 - 14.00 (Umum)
47	7	5	07.00 - 14.00 (Umum)
48	7	6	07.00 - 14.00 (Umum)
49	8	3	17.00 - Selesai
50	9	1	14.30 - Selesai
51	9	3	14.30 - Selesai
52	9	5	14.30 - Selesai
53	10	2	14.30 - Selesai
54	10	4	14.30 - Selesai
55	10	6	14.30 - Selesai
56	11	2	14.00 - 18.00
57	11	4	14.00 - 18.00
58	11	6	08.00 - 14.00
59	12	2	10.00 - Selesai
60	12	4	10.00 - Selesai
61	12	6	10.00 - Selesai
62	13	1	10.00 - Selesai
63	13	3	10.00 - Selesai
64	13	5	10.00 - Selesai
65	14	1	14.30 - Selesai
66	14	2	14.30 - Selesai
67	14	4	14.30 - Selesai
68	14	5	14.30 - Selesai
69	15	1	14.30 - Selesai
70	15	2	14.30 - Selesai
71	15	4	14.30 - Selesai
72	15	5	14.30 - Selesai
73	16	1	07.30 - 09.30
74	16	2	07.30 - 09.30
75	16	3	07.30 - 09.30
76	17	1	07.00 - 10.00
77	17	2	07.00 - 10.00
78	17	3	07.00 - 10.00
79	17	4	07.00 - 10.00
80	17	5	07.00 - 10.00
81	18	1	11.00 - Selesai
82	18	2	11.00 - Selesai
83	18	3	11.00 - Selesai
84	18	4	11.00 - Selesai
85	18	5	11.00 - Selesai
86	18	6	11.00 - Selesai
87	19	1	08.00 - 10.30
88	19	2	08.00 - 10.30
89	19	4	08.00 - 10.30
90	19	5	08.00 - 10.30
91	19	6	08.00 - 10.30
92	19	3	09.00 - Selesai
93	20	5	10.00 - Selesai
94	20	1	13.00 - Selesai
95	20	2	13.00 - Selesai
96	20	3	13.00 - Selesai
97	20	4	13.00 - Selesai
98	20	6	13.00 - Selesai
99	21	1	08.00 - 14.00
100	21	2	08.00 - 14.00
101	21	3	08.00 - 14.00
102	21	4	08.00 - 14.00
103	21	5	08.00 - 14.00
104	21	6	08.00 - 14.00
105	21	1	18.00 - Selesai
106	21	2	18.00 - Selesai
107	21	3	18.00 - Selesai
108	21	4	18.00 - Selesai
109	22	2	14.30 - 17.00
110	22	5	13.30 - 16.00
111	23	1	08.00 - 11.00
112	23	2	08.00 - 11.00
113	23	3	08.00 - 11.00
114	23	4	08.00 - 11.00
115	23	5	08.00 - 11.00
116	24	1	13.30 - Selesai
117	24	2	13.30 - Selesai
118	24	3	13.30 - Selesai
119	25	1	15.00 - Selesai
120	25	4	13.00 - Selesai
121	25	5	14.00 - Selesai
122	26	2	14.00 - Selesai
123	26	3	14.00 - Selesai
124	26	6	13.00 - Selesai
125	27	1	06.00 - 08.00
126	27	3	07.30 - 09.30
127	28	1	10.00 - 17.00
128	28	2	10.00 - 17.00
129	28	3	10.00 - 17.00
130	28	4	07.00 - 14.00
131	28	5	07.00 - 14.00
132	28	6	07.00 - 14.00
133	29	1	14.00 - 18.00
134	29	3	14.00 - 18.00
135	29	2	08.00 - 12.00
136	29	4	08.00 - 12.00
137	29	5	13.00 - 15.00
138	30	4	16.00 - Selesai
139	30	6	14.00 - Selesai
140	31	1	09.00 - 12.00
141	31	2	09.00 - 12.00
142	31	3	09.00 - 12.00
143	31	4	09.00 - 12.00
144	31	5	09.00 - 12.00
145	32	1	18.00 - Selesai
146	32	3	18.00 - Selesai
147	32	5	18.00 - Selesai
\.


--
-- Data for Name: MedicalRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MedicalRecord" (id, patient_id, doctor_id, queue_id, visit_date, subjective, objective, assessment, plan, created_at, updated_at, diastolic, heart_rate, height, systolic, temperature, weight) FROM stdin;
1	1	1	\N	2025-12-10 14:00:03.411	Demam tinggi	TD: 120/80, N: 80, S: 36.0	Febris	Istirahat cukup, minum obat	2025-12-10 14:00:03.4	2025-12-10 14:00:03.411	80	80	170	120	36.5	60
2	1	1	\N	2025-12-10 14:00:03.506	Batuk berdahak	TD: 120/80, N: 80, S: 36.1	ISPA	Istirahat cukup, minum obat	2025-12-09 14:00:03.505	2025-12-10 14:00:03.506	80	81	170	120	36.6	61
3	1	1	\N	2025-12-10 14:00:03.512	Sakit kepala	TD: 120/80, N: 80, S: 36.2	Cephalgia	Istirahat cukup, minum obat	2025-12-08 14:00:03.511	2025-12-10 14:00:03.512	80	82	170	120	36.7	62
4	1	1	\N	2025-12-10 14:00:03.519	Pusing mual	TD: 120/80, N: 80, S: 36.3	Dyspepsia	Istirahat cukup, minum obat	2025-12-07 14:00:03.518	2025-12-10 14:00:03.519	80	83	170	120	36.8	63
5	1	1	\N	2025-12-10 14:00:03.525	Gatal-gatal	TD: 120/80, N: 80, S: 36.4	Dermatitis	Istirahat cukup, minum obat	2025-12-06 14:00:03.524	2025-12-10 14:00:03.525	80	84	170	120	36.9	64
6	16	25	20	2025-12-10 15:05:16.749	Hgvghvyjgh	Hghghhuhu	Yvyghbu	Hvyghhu	2025-12-10 15:05:16.751	2025-12-10 15:05:16.751	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: Medicine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Medicine" (id, name, code, category, stock, unit, price, expiry, created_at, updated_at) FROM stdin;
3	Vitamin C 500mg	MED003	Vitamin	200	bottle	25000	\N	2025-12-10 14:00:03.383	2025-12-10 14:00:03.383
4	OBH Combi	MED004	Syrup	30	bottle	12000	\N	2025-12-10 14:00:03.386	2025-12-10 14:00:03.386
5	CTM	MED005	Tablet	100	strips	2000	\N	2025-12-10 14:00:03.389	2025-12-10 14:00:03.389
1	Paracetamol 500mg	MED001	Tablet	97	strips	5000	\N	2025-12-10 14:00:03.222	2025-12-10 15:18:36.439
2	Amoxicillin 500mg	MED002	Antibiotic	44	strips	15000	\N	2025-12-10 14:00:03.378	2025-12-10 15:18:36.44
\.


--
-- Data for Name: Patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Patient" (id, nik, no_rm, name, gender, birth_date, address, phone, bpjs_no, created_at, updated_at, allergies) FROM stdin;
1	12345678901284	00-00-02	Test Patient	L	1990-01-01 00:00:00	Test Address	08123456789	BPJS1284	2025-12-10 10:23:41.361	2025-12-10 10:23:41.361	\N
2	45445	00-00-03	tryrtty	L	2025-12-03 00:00:00	etert			2025-12-10 10:32:18.223	2025-12-10 10:32:18.223	\N
7	4	00-00-08	f	L	2025-12-10 00:00:00	4			2025-12-10 10:45:42.157	2025-12-10 10:45:42.157	\N
8	3303	00-00-09	fakt	L	2025-12-05 00:00:00	pbg	0	\N	2025-12-10 11:06:15.264	2025-12-10 11:06:15.264	\N
9	09	00-00-10	fakt	L	2025-12-03 00:00:00	-	-	\N	2025-12-10 13:37:12.505	2025-12-10 13:37:12.505	\N
10	3301010101800001	RM-2024-001	Budi Santoso	Laki-laki	1980-05-12 00:00:00	Jl. Merdeka No. 1, Jakarta	081234567890	000123456001	2025-12-10 14:03:42.33	2025-12-10 14:03:42.33	Antibiotik (Penicillin)
11	3301010101850002	RM-2024-002	Siti Aminah	Perempuan	1985-08-20 00:00:00	Jl. Sudirman No. 45, Bandung	081234567891	000123456002	2025-12-10 14:03:42.337	2025-12-10 14:03:42.337	\N
12	3301010101900003	RM-2024-003	Agus Setiawan	Laki-laki	1990-12-10 00:00:00	Jl. Diponegoro No. 10, Surabaya	081234567892	\N	2025-12-10 14:03:42.341	2025-12-10 14:03:42.341	Seafood, Kacang
13	3301010101950004	RM-2024-004	Dewi Lestari	Perempuan	1995-03-15 00:00:00	Jl. Malioboro No. 5, Yogyakarta	081234567893	000123456004	2025-12-10 14:03:42.344	2025-12-10 14:03:42.344	\N
14	3301010101750005	RM-2024-005	Eko Prasetyo	Laki-laki	1975-07-07 00:00:00	Jl. Pahlawan No. 99, Semarang	081234567894	000123456005	2025-12-10 14:03:42.348	2025-12-10 14:03:42.348	Debu
15	3301010101880006	RM-2024-006	Rina Wati	Perempuan	1988-02-28 00:00:00	Jl. Ahmad Yani No. 20, Solo	081234567895	\N	2025-12-10 14:03:42.351	2025-12-10 14:03:42.351	Paracetamol
16	3301010101610007	RM-2024-007	Jokowi Widodo	Laki-laki	1961-06-21 00:00:00	Istana Bogor	081234567896	000123456007	2025-12-10 14:03:42.353	2025-12-10 14:03:42.353	\N
\.


--
-- Data for Name: Playlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Playlist" (id, type, url, duration, "order", "isActive", created_at) FROM stdin;
\.


--
-- Data for Name: Poliklinik; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Poliklinik" (id, name, queue_code) FROM stdin;
1	Poli Anak	ANK
2	Poli Bedah Mulut	BMM
3	Poli Bedah Umum	BDH
4	Fisioterapi	FIS
5	Poli Gigi Konservasi	KG
6	Poli Gigi Umum	GIG
7	Poli Jantung	JTG
8	Poli Kandungan (OBGYN)	OBS
9	Poli Kedokteran Jiwa	JIW
10	Poli Mata	MTA
11	Poli Orthopaedi (Tulang)	ORT
12	Poli Paru	PAR
13	Poli Penyakit Dalam	INT
14	Psikologi	PSI
15	Poli Rehab Medik	RHB
16	Poli Saraf	SRF
17	Terapi Wicara	TW
18	Poli THT - KL	THT
19	Poli Umum	UMM
20	Poli Urologi	URO
\.


--
-- Data for Name: Prescription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Prescription" (id, medical_record_id, doctor_id, patient_id, status, notes, created_at, updated_at) FROM stdin;
2	2	1	1	COMPLETED	\N	2025-12-10 14:00:03.509	2025-12-10 14:00:03.509
4	4	1	1	COMPLETED	\N	2025-12-10 14:00:03.522	2025-12-10 14:00:03.522
1	1	1	1	COMPLETED	\N	2025-12-10 14:00:03.429	2025-12-10 14:45:39.802
3	3	1	1	COMPLETED	\N	2025-12-10 14:00:03.515	2025-12-10 15:18:35.612
5	5	1	1	COMPLETED	\N	2025-12-10 14:00:03.527	2025-12-10 15:18:36.432
\.


--
-- Data for Name: PrescriptionItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PrescriptionItem" (id, prescription_id, medicine_id, quantity, dosage, notes) FROM stdin;
1	1	1	1	3x1	\N
2	1	2	2	2x1	\N
3	2	1	1	3x1	\N
4	2	2	2	2x1	\N
5	3	1	1	3x1	\N
6	3	2	2	2x1	\N
7	4	1	1	3x1	\N
8	4	2	2	2x1	\N
9	5	1	1	3x1	\N
10	5	2	2	2x1	\N
\.


--
-- Data for Name: Queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Queue" (id, daily_quota_id, queue_number, queue_code, status, created_at, patient_id) FROM stdin;
8	14	1	INT-001	WAITING	2025-12-10 12:48:07.288	8
9	10	1	MTA-001	WAITING	2025-12-10 12:49:33.515	\N
10	14	2	INT-002	WAITING	2025-12-10 12:49:40.556	\N
11	14	3	INT-003	WAITING	2025-12-10 12:49:42.745	\N
12	14	4	INT-004	WAITING	2025-12-10 12:49:45.332	\N
13	16	2	RHB-002	WAITING	2025-12-10 12:49:47.021	\N
14	23	4	BMM-004	WAITING	2025-12-10 14:13:04.934	1
15	2	1	BDH-001	WAITING	2025-12-10 14:18:33.522	1
16	1	2	ANK-002	WAITING	2025-12-10 14:20:25.427	1
1	22	1	URO-001	SERVED	2025-12-10 10:45:47.418	7
2	1	1	ANK-001	SERVED	2025-12-10 10:47:59.297	7
3	15	1	PSI-001	SERVED	2025-12-10 11:11:43.198	8
17	24	1	JIW-001	WAITING	2025-12-10 14:26:32.229	16
4	23	1	BMM-001	SERVED	2025-12-10 11:12:40.335	8
18	8	1	HL-001	WAITING	2025-12-10 14:28:52.586	15
5	23	2	BMM-002	SERVED	2025-12-10 11:16:27.954	8
6	23	3	BMM-003	SERVED	2025-12-10 11:16:30.209	8
19	14	5	LC-005	WAITING	2025-12-10 14:44:18.92	13
7	16	1	RHB-001	SERVED	2025-12-10 11:19:22.004	8
20	25	1	AP-001	SERVED	2025-12-10 15:04:33.651	16
21	17	1	SD-001	WAITING	2025-12-10 15:58:50.529	14
22	26	1	RI-001	WAITING	2025-12-11 09:34:00.995	\N
23	27	1	ER-001	WAITING	2025-12-11 09:34:10.168	\N
24	35	1	TH-001	WAITING	2025-12-11 09:36:27.083	\N
25	28	1	BG-001	WAITING	2025-12-11 09:44:45.359	\N
26	27	2	BDH-002	WAITING	2025-12-11 09:45:20.327	\N
27	28	2	FIS-002	WAITING	2025-12-11 09:45:23.233	\N
28	47	1	DR-001	WAITING	2025-12-11 09:46:09.569	1
29	33	1	GH-001	WAITING	2025-12-11 09:46:19.4	1
30	35	2	TH-002	WAITING	2025-12-11 09:46:39.145	1
31	27	3	BDH-003	WAITING	2025-12-11 09:58:20.742	\N
32	28	3	FIS-003	WAITING	2025-12-11 10:06:55.299	\N
33	29	1	FIS-004	WAITING	2025-12-11 10:06:57.892	\N
34	30	1	FIS-005	WAITING	2025-12-11 10:07:00.851	\N
35	36	1	MTA-001	WAITING	2025-12-11 10:07:04.063	\N
36	27	4	BDH-004	WAITING	2025-12-11 10:12:13.002	\N
37	30	2	FIS-006	WAITING	2025-12-11 10:22:51.112	\N
38	31	1	GIG-001	WAITING	2025-12-11 10:22:54.677	\N
39	33	2	OBS-002	WAITING	2025-12-11 10:22:57.131	\N
40	29	2	FIS-007	WAITING	2025-12-11 10:24:52.933	\N
41	30	3	FIS-008	WAITING	2025-12-11 10:24:55.234	\N
42	35	3	JIW-003	WAITING	2025-12-11 10:24:57.498	\N
43	34	1	OBS-003	WAITING	2025-12-11 10:24:59.629	\N
\.


--
-- Data for Name: Sequence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sequence" (id, key, value) FROM stdin;
1	medical_record	10
\.


--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Setting" (id, key, value, "updatedAt") FROM stdin;
1	running_text	werwerwe	2025-12-10 10:09:31.142
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" (id, invoice_no, medical_record_id, patient_id, total_amount, status, payment_method, created_at, updated_at) FROM stdin;
1	INV/20251211/59	6	16	65000	PAID	QRIS	2025-12-11 14:55:32.325	2025-12-11 14:55:41.728
2	INV/20251211/66	2	1	100000	PAID	CASH	2025-12-11 14:55:49.666	2025-12-11 14:55:57.048
\.


--
-- Data for Name: TransactionItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TransactionItem" (id, transaction_id, description, amount, quantity) FROM stdin;
1	1	Biaya Pendaftaran / Admin	15000	1
2	1	Jasa Dokter (dr. Ajeng Putri, Sp. N)	50000	1
3	2	Biaya Pendaftaran / Admin	15000	1
4	2	Jasa Dokter (dr. RR Irma Rossyana, Sp. A)	50000	1
5	2	Obat: Paracetamol 500mg	5000	1
6	2	Obat: Amoxicillin 500mg	15000	2
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, username, password, role) FROM stdin;
1	admin	$2b$10$ks69QTZZiijS71eu/47rOOwn.rM1tmT0KFzrwWa4aclajxKcVqdsa	ADMIN
2	loket1	$2b$10$v8XdWUa27WN77mg9mdCegeP71iKsVuvucydZ2eUfyfsXY3fOgc6E6	STAFF
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ab0284e6-890e-4077-b8f9-ab2a925bc566	78a6b15e5bcf9eefc242fc014016cd8739988c751f7d7662ce25eee5b9dee1c9	2025-12-10 17:08:41.58151+07	20251210003741_init	\N	\N	2025-12-10 17:08:41.42372+07	1
a5225d87-baee-405c-8dfe-57d36686c313	8b1c76d9036f12a111d73f52ee78694302abafc720984d991c9fb17da16a66e0	2025-12-10 17:18:18.112493+07	20251210101818_add_patient_system	\N	\N	2025-12-10 17:18:18.085408+07	1
841ce38e-82a6-4b63-a415-e2a1a0c9edbb	2c36ec83859ba2e38a3f2d74b97def15f3971219c69dd0e9498e10f4ad5dabeb	2025-12-10 17:47:45.998689+07	20251210104745_add_medical_record	\N	\N	2025-12-10 17:47:45.975207+07	1
\.


--
-- Name: Counter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Counter_id_seq"', 1, true);


--
-- Name: DailyQuota_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."DailyQuota_id_seq"', 70, true);


--
-- Name: DoctorLeave_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."DoctorLeave_id_seq"', 57, true);


--
-- Name: DoctorSchedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."DoctorSchedule_id_seq"', 147, true);


--
-- Name: Doctor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Doctor_id_seq"', 32, true);


--
-- Name: MedicalRecord_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MedicalRecord_id_seq"', 6, true);


--
-- Name: Medicine_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Medicine_id_seq"', 5, true);


--
-- Name: Patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Patient_id_seq"', 16, true);


--
-- Name: Playlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Playlist_id_seq"', 1, false);


--
-- Name: Poliklinik_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Poliklinik_id_seq"', 20, true);


--
-- Name: PrescriptionItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PrescriptionItem_id_seq"', 10, true);


--
-- Name: Prescription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Prescription_id_seq"', 5, true);


--
-- Name: Queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Queue_id_seq"', 43, true);


--
-- Name: Sequence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Sequence_id_seq"', 1, true);


--
-- Name: Setting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Setting_id_seq"', 4, true);


--
-- Name: TransactionItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TransactionItem_id_seq"', 6, true);


--
-- Name: Transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Transaction_id_seq"', 2, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 2, true);


--
-- Name: Counter Counter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Counter"
    ADD CONSTRAINT "Counter_pkey" PRIMARY KEY (id);


--
-- Name: DailyQuota DailyQuota_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DailyQuota"
    ADD CONSTRAINT "DailyQuota_pkey" PRIMARY KEY (id);


--
-- Name: DoctorLeave DoctorLeave_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorLeave"
    ADD CONSTRAINT "DoctorLeave_pkey" PRIMARY KEY (id);


--
-- Name: DoctorSchedule DoctorSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorSchedule"
    ADD CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY (id);


--
-- Name: Doctor Doctor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_pkey" PRIMARY KEY (id);


--
-- Name: MedicalRecord MedicalRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY (id);


--
-- Name: Medicine Medicine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Medicine"
    ADD CONSTRAINT "Medicine_pkey" PRIMARY KEY (id);


--
-- Name: Patient Patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Patient"
    ADD CONSTRAINT "Patient_pkey" PRIMARY KEY (id);


--
-- Name: Playlist Playlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Playlist"
    ADD CONSTRAINT "Playlist_pkey" PRIMARY KEY (id);


--
-- Name: Poliklinik Poliklinik_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Poliklinik"
    ADD CONSTRAINT "Poliklinik_pkey" PRIMARY KEY (id);


--
-- Name: PrescriptionItem PrescriptionItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrescriptionItem"
    ADD CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY (id);


--
-- Name: Prescription Prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_pkey" PRIMARY KEY (id);


--
-- Name: Queue Queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Queue"
    ADD CONSTRAINT "Queue_pkey" PRIMARY KEY (id);


--
-- Name: Sequence Sequence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sequence"
    ADD CONSTRAINT "Sequence_pkey" PRIMARY KEY (id);


--
-- Name: Setting Setting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_pkey" PRIMARY KEY (id);


--
-- Name: TransactionItem TransactionItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionItem"
    ADD CONSTRAINT "TransactionItem_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Counter_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Counter_name_key" ON public."Counter" USING btree (name);


--
-- Name: DailyQuota_doctor_id_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DailyQuota_doctor_id_date_key" ON public."DailyQuota" USING btree (doctor_id, date);


--
-- Name: DoctorLeave_doctor_id_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DoctorLeave_doctor_id_date_key" ON public."DoctorLeave" USING btree (doctor_id, date);


--
-- Name: Medicine_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Medicine_code_key" ON public."Medicine" USING btree (code);


--
-- Name: Patient_nik_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Patient_nik_key" ON public."Patient" USING btree (nik);


--
-- Name: Patient_no_rm_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Patient_no_rm_key" ON public."Patient" USING btree (no_rm);


--
-- Name: Poliklinik_queue_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Poliklinik_queue_code_key" ON public."Poliklinik" USING btree (queue_code);


--
-- Name: Sequence_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Sequence_key_key" ON public."Sequence" USING btree (key);


--
-- Name: Setting_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Setting_key_key" ON public."Setting" USING btree (key);


--
-- Name: Transaction_invoice_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Transaction_invoice_no_key" ON public."Transaction" USING btree (invoice_no);


--
-- Name: Transaction_medical_record_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Transaction_medical_record_id_key" ON public."Transaction" USING btree (medical_record_id);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: DailyQuota DailyQuota_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DailyQuota"
    ADD CONSTRAINT "DailyQuota_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DoctorLeave DoctorLeave_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorLeave"
    ADD CONSTRAINT "DoctorLeave_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DoctorSchedule DoctorSchedule_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorSchedule"
    ADD CONSTRAINT "DoctorSchedule_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Doctor Doctor_poliklinik_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_poliklinik_id_fkey" FOREIGN KEY (poliklinik_id) REFERENCES public."Poliklinik"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MedicalRecord MedicalRecord_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MedicalRecord MedicalRecord_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MedicalRecord MedicalRecord_queue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_queue_id_fkey" FOREIGN KEY (queue_id) REFERENCES public."Queue"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PrescriptionItem PrescriptionItem_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrescriptionItem"
    ADD CONSTRAINT "PrescriptionItem_medicine_id_fkey" FOREIGN KEY (medicine_id) REFERENCES public."Medicine"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrescriptionItem PrescriptionItem_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrescriptionItem"
    ADD CONSTRAINT "PrescriptionItem_prescription_id_fkey" FOREIGN KEY (prescription_id) REFERENCES public."Prescription"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prescription Prescription_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Prescription Prescription_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_medical_record_id_fkey" FOREIGN KEY (medical_record_id) REFERENCES public."MedicalRecord"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Prescription Prescription_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Queue Queue_daily_quota_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Queue"
    ADD CONSTRAINT "Queue_daily_quota_id_fkey" FOREIGN KEY (daily_quota_id) REFERENCES public."DailyQuota"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Queue Queue_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Queue"
    ADD CONSTRAINT "Queue_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TransactionItem TransactionItem_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionItem"
    ADD CONSTRAINT "TransactionItem_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES public."Transaction"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transaction Transaction_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_medical_record_id_fkey" FOREIGN KEY (medical_record_id) REFERENCES public."MedicalRecord"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict YxvJJCB4cTWadcnP9oY1NedVu3YuMcq1rWNdgmVM7bVkjbZ9GbuRXKGnJoZrTtp

