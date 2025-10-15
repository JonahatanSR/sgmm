--
-- PostgreSQL database dump
--

\restrict 5unE0zxmaerbIgcWGEssPiQgmIWcV0QIBLGcuBGezVz4oAUXZn16ripS0TJ4KRv

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg13+1)

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

--
-- Name: AuditAction; Type: TYPE; Schema: public; Owner: sgmm_user
--

CREATE TYPE public."AuditAction" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT'
);


ALTER TYPE public."AuditAction" OWNER TO sgmm_user;

--
-- Name: DependentStatus; Type: TYPE; Schema: public; Owner: sgmm_user
--

CREATE TYPE public."DependentStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."DependentStatus" OWNER TO sgmm_user;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: sgmm_user
--

CREATE TYPE public."DocumentType" AS ENUM (
    'BIRTH_CERTIFICATE'
);


ALTER TYPE public."DocumentType" OWNER TO sgmm_user;

--
-- Name: EmailCampaignStatus; Type: TYPE; Schema: public; Owner: sgmm_user
--

CREATE TYPE public."EmailCampaignStatus" AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'SENDING',
    'SENT',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."EmailCampaignStatus" OWNER TO sgmm_user;

--
-- Name: EmailCategory; Type: TYPE; Schema: public; Owner: sgmm_user
--

CREATE TYPE public."EmailCategory" AS ENUM (
    'REMINDER',
    'NOTIFICATION',
    'CAMPAIGN'
);


ALTER TYPE public."EmailCategory" OWNER TO sgmm_user;

--
-- Name: EmployeeStatus; Type: TYPE; Schema: public; Owner: sgmm_user
--

CREATE TYPE public."EmployeeStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."EmployeeStatus" OWNER TO sgmm_user;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: sgmm_user
--

CREATE TYPE public."Gender" AS ENUM (
    'M',
    'F'
);


ALTER TYPE public."Gender" OWNER TO sgmm_user;

--
-- Name: PDFType; Type: TYPE; Schema: public; Owner: sgmm_user
--

CREATE TYPE public."PDFType" AS ENUM (
    'EMPLOYEE_REPORT',
    'RENEWAL_FORM'
);


ALTER TYPE public."PDFType" OWNER TO sgmm_user;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: sgmm_user
--

CREATE TYPE public."UserRole" AS ENUM (
    'EMPLOYEE',
    'HR_ADMIN',
    'SUPER_ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO sgmm_user;

--
-- Name: ValueType; Type: TYPE; Schema: public; Owner: sgmm_user
--

CREATE TYPE public."ValueType" AS ENUM (
    'STRING',
    'NUMBER',
    'BOOLEAN',
    'DATE'
);


ALTER TYPE public."ValueType" OWNER TO sgmm_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: sgmm_user
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


ALTER TABLE public._prisma_migrations OWNER TO sgmm_user;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.admin_users (
    id text NOT NULL,
    email text NOT NULL,
    role public."UserRole" NOT NULL,
    company_id text,
    otp_secret text,
    otp_enabled boolean DEFAULT false NOT NULL,
    last_login timestamp(3) without time zone,
    failed_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp(3) without time zone,
    active boolean DEFAULT true NOT NULL,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admin_users OWNER TO sgmm_user;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    user_id text NOT NULL,
    user_role public."UserRole" NOT NULL,
    action public."AuditAction" NOT NULL,
    table_name text NOT NULL,
    record_id text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address text NOT NULL,
    user_agent text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO sgmm_user;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.companies (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    logo_url text,
    favicon_url text,
    primary_color text DEFAULT '#1f2937'::text NOT NULL,
    secondary_color text DEFAULT '#374151'::text NOT NULL,
    accent_color text DEFAULT '#3b82f6'::text NOT NULL,
    neutral_color text DEFAULT '#6b7280'::text NOT NULL,
    font_primary text DEFAULT 'Arial'::text NOT NULL,
    font_secondary text DEFAULT 'Arial'::text NOT NULL,
    custom_css text,
    active boolean DEFAULT true NOT NULL,
    brand_updated_at timestamp(3) without time zone,
    brand_updated_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.companies OWNER TO sgmm_user;

--
-- Name: dependents; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.dependents (
    id text NOT NULL,
    employee_id text NOT NULL,
    first_name text NOT NULL,
    paternal_last_name text NOT NULL,
    maternal_last_name text,
    birth_date timestamp(3) without time zone NOT NULL,
    gender public."Gender" NOT NULL,
    relationship_type_id integer NOT NULL,
    policy_start_date timestamp(3) without time zone NOT NULL,
    policy_end_date timestamp(3) without time zone,
    status public."DependentStatus" DEFAULT 'ACTIVE'::public."DependentStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    dependent_seq integer NOT NULL,
    dependent_id text NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by text,
    deleted_by text,
    is_first_time boolean DEFAULT false NOT NULL
);


ALTER TABLE public.dependents OWNER TO sgmm_user;

--
-- Name: COLUMN dependents.dependent_seq; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON COLUMN public.dependents.dependent_seq IS 'Secuencia del dependiente dentro del empleado';


--
-- Name: COLUMN dependents.dependent_id; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON COLUMN public.dependents.dependent_id IS 'ID único del dependiente (formato: EMP-001-DEP-001)';


--
-- Name: COLUMN dependents.deleted_at; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON COLUMN public.dependents.deleted_at IS 'Fecha de eliminación lógica (soft delete)';


--
-- Name: documents; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.documents (
    id text NOT NULL,
    employee_id text NOT NULL,
    dependent_id text,
    document_type public."DocumentType" NOT NULL,
    original_filename text NOT NULL,
    stored_filename text NOT NULL,
    file_path text NOT NULL,
    file_size integer NOT NULL,
    mime_type text NOT NULL,
    upload_ip text NOT NULL,
    uploaded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.documents OWNER TO sgmm_user;

--
-- Name: email_campaigns; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.email_campaigns (
    id text NOT NULL,
    company_id text NOT NULL,
    template_id text NOT NULL,
    name text NOT NULL,
    recipient_criteria jsonb NOT NULL,
    scheduled_at timestamp(3) without time zone,
    sent_at timestamp(3) without time zone,
    status public."EmailCampaignStatus" DEFAULT 'DRAFT'::public."EmailCampaignStatus" NOT NULL,
    total_recipients integer DEFAULT 0 NOT NULL,
    emails_sent integer DEFAULT 0 NOT NULL,
    emails_failed integer DEFAULT 0 NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_campaigns OWNER TO sgmm_user;

--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.email_templates (
    id text NOT NULL,
    company_id text NOT NULL,
    name text NOT NULL,
    category public."EmailCategory" NOT NULL,
    subject text NOT NULL,
    body_html text NOT NULL,
    body_text text NOT NULL,
    variables jsonb NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_templates OWNER TO sgmm_user;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.employees (
    id text NOT NULL,
    google_id text,
    employee_number text NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    first_name text,
    paternal_last_name text,
    maternal_last_name text,
    birth_date timestamp(3) without time zone,
    gender public."Gender",
    hire_date timestamp(3) without time zone NOT NULL,
    company_id text NOT NULL,
    department text,
    "position" text,
    org_unit_path text,
    policy_number text,
    status public."EmployeeStatus" DEFAULT 'ACTIVE'::public."EmployeeStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    last_login timestamp(3) without time zone,
    login_count integer DEFAULT 0 NOT NULL,
    last_ip_address text,
    last_user_agent text
);


ALTER TABLE public.employees OWNER TO sgmm_user;

--
-- Name: COLUMN employees.last_login; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON COLUMN public.employees.last_login IS 'Último login del empleado';


--
-- Name: COLUMN employees.login_count; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON COLUMN public.employees.login_count IS 'Número total de logins del empleado';


--
-- Name: COLUMN employees.last_ip_address; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON COLUMN public.employees.last_ip_address IS 'Última IP desde la que se logueó';


--
-- Name: COLUMN employees.last_user_agent; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON COLUMN public.employees.last_user_agent IS 'Último user agent del navegador';


--
-- Name: pdf_templates; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.pdf_templates (
    id text NOT NULL,
    company_id text NOT NULL,
    template_type public."PDFType" NOT NULL,
    name text NOT NULL,
    config_json jsonb NOT NULL,
    custom_css text,
    header_config jsonb NOT NULL,
    footer_config jsonb NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pdf_templates OWNER TO sgmm_user;

--
-- Name: privacy_acceptances; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.privacy_acceptances (
    id text NOT NULL,
    employee_id text NOT NULL,
    dependent_id text,
    acceptance_type text NOT NULL,
    privacy_version text DEFAULT 'v1.0'::text NOT NULL,
    accepted_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address text NOT NULL,
    user_agent text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.privacy_acceptances OWNER TO sgmm_user;

--
-- Name: TABLE privacy_acceptances; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON TABLE public.privacy_acceptances IS 'Registro de aceptaciones del aviso de privacidad por empleados y dependientes';


--
-- Name: relationship_types; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.relationship_types (
    id integer NOT NULL,
    name text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.relationship_types OWNER TO sgmm_user;

--
-- Name: relationship_types_id_seq; Type: SEQUENCE; Schema: public; Owner: sgmm_user
--

CREATE SEQUENCE public.relationship_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.relationship_types_id_seq OWNER TO sgmm_user;

--
-- Name: relationship_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sgmm_user
--

ALTER SEQUENCE public.relationship_types_id_seq OWNED BY public.relationship_types.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.reports (
    id text NOT NULL,
    employee_id text,
    report_type text NOT NULL,
    report_name text NOT NULL,
    generated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    file_path text,
    file_size integer,
    download_count integer DEFAULT 0 NOT NULL,
    generated_by text NOT NULL,
    parameters jsonb,
    error_message text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reports OWNER TO sgmm_user;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.system_config (
    key text NOT NULL,
    value text NOT NULL,
    description text NOT NULL,
    value_type public."ValueType" DEFAULT 'STRING'::public."ValueType" NOT NULL,
    updatable_by_role public."UserRole" DEFAULT 'SUPER_ADMIN'::public."UserRole" NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by text NOT NULL
);


ALTER TABLE public.system_config OWNER TO sgmm_user;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: sgmm_user
--

CREATE TABLE public.user_sessions (
    id text NOT NULL,
    employee_id text NOT NULL,
    session_token text NOT NULL,
    ip_address text NOT NULL,
    user_agent text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    last_activity timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO sgmm_user;

--
-- Name: TABLE user_sessions; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON TABLE public.user_sessions IS 'Sesiones activas de usuarios para trazabilidad y seguridad';


--
-- Name: v_employees_consolidated; Type: VIEW; Schema: public; Owner: sgmm_user
--

CREATE VIEW public.v_employees_consolidated AS
SELECT
    NULL::text AS id,
    NULL::text AS employee_number,
    NULL::text AS email,
    NULL::text AS full_name,
    NULL::text AS first_name,
    NULL::text AS paternal_last_name,
    NULL::text AS maternal_last_name,
    NULL::timestamp(3) without time zone AS birth_date,
    NULL::public."Gender" AS gender,
    NULL::numeric AS calculated_age,
    NULL::timestamp(3) without time zone AS hire_date,
    NULL::text AS company_id,
    NULL::text AS company_name,
    NULL::text AS company_code,
    NULL::text AS department,
    NULL::text AS "position",
    NULL::text AS policy_number,
    NULL::public."EmployeeStatus" AS status,
    NULL::timestamp(3) without time zone AS last_login,
    NULL::integer AS login_count,
    NULL::timestamp(3) without time zone AS created_at,
    NULL::timestamp(3) without time zone AS updated_at,
    NULL::bigint AS active_dependents_count,
    NULL::bigint AS inactive_dependents_count,
    NULL::bigint AS total_dependents_count;


ALTER TABLE public.v_employees_consolidated OWNER TO sgmm_user;

--
-- Name: VIEW v_employees_consolidated; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON VIEW public.v_employees_consolidated IS 'Vista consolidada con información completa de empleados y conteo de dependientes';


--
-- Name: v_insurer_report; Type: VIEW; Schema: public; Owner: sgmm_user
--

CREATE VIEW public.v_insurer_report AS
 SELECT e.employee_number AS collaborator_id,
    e.paternal_last_name,
    e.maternal_last_name,
    e.first_name,
    e.birth_date,
    e.gender,
    EXTRACT(year FROM age(e.birth_date)) AS calculated_age,
    'TITULAR'::text AS relationship_type,
    ((e.employee_number || '-'::text) || 'TITULAR'::text) AS compound_id
   FROM public.employees e
  WHERE (e.status = 'ACTIVE'::public."EmployeeStatus")
UNION ALL
 SELECT e.employee_number AS collaborator_id,
    d.paternal_last_name,
    d.maternal_last_name,
    d.first_name,
    d.birth_date,
    d.gender,
    EXTRACT(year FROM age(d.birth_date)) AS calculated_age,
    rt.name AS relationship_type,
    ((e.employee_number || '-'::text) || d.dependent_id) AS compound_id
   FROM ((public.employees e
     JOIN public.dependents d ON ((e.id = d.employee_id)))
     JOIN public.relationship_types rt ON ((d.relationship_type_id = rt.id)))
  WHERE ((e.status = 'ACTIVE'::public."EmployeeStatus") AND (d.status = 'ACTIVE'::public."DependentStatus"));


ALTER TABLE public.v_insurer_report OWNER TO sgmm_user;

--
-- Name: VIEW v_insurer_report; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON VIEW public.v_insurer_report IS 'Vista optimizada para reportes de aseguradora con IDs compuestos';


--
-- Name: v_payroll_deductions; Type: VIEW; Schema: public; Owner: sgmm_user
--

CREATE VIEW public.v_payroll_deductions AS
 SELECT e.employee_number AS collaborator_id,
    e.paternal_last_name,
    e.maternal_last_name,
    e.first_name,
    e.email,
    count(d.id) AS total_dependents,
    (count(d.id) - 1) AS extra_dependents,
        CASE
            WHEN (count(d.id) >= 2) THEN (((count(d.id) - 1))::numeric * 400.00)
            ELSE 0.00
        END AS monthly_deduction
   FROM (public.employees e
     JOIN public.dependents d ON ((e.id = d.employee_id)))
  WHERE ((e.status = 'ACTIVE'::public."EmployeeStatus") AND (d.status = 'ACTIVE'::public."DependentStatus"))
  GROUP BY e.id, e.employee_number, e.paternal_last_name, e.maternal_last_name, e.first_name, e.email
 HAVING (count(d.id) >= 2);


ALTER TABLE public.v_payroll_deductions OWNER TO sgmm_user;

--
-- Name: VIEW v_payroll_deductions; Type: COMMENT; Schema: public; Owner: sgmm_user
--

COMMENT ON VIEW public.v_payroll_deductions IS 'Vista para reportes de deducciones de nómina (solo empleados con 2+ dependientes)';


--
-- Name: relationship_types id; Type: DEFAULT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.relationship_types ALTER COLUMN id SET DEFAULT nextval('public.relationship_types_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c60083c6-06df-4d0b-aada-185414d27d31	30f9d23d88e0d6b1ce975d2d5300021adbcf2ac34558643d70985809cef9707f	2025-10-15 16:13:04.89733+00	20250903030023_mgration_sgmm1	\N	\N	2025-10-15 16:13:04.779625+00	1
5ec02f7d-c6d2-477c-b70e-980ab85efbe2	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-10-15 16:13:04.904549+00	20250903054625_init	\N	\N	2025-10-15 16:13:04.899564+00	1
97a49cd7-ffa1-4657-8659-2edea19cbdd2	8f02f59e80fed7129ca921aeeabe5eb41e3da241e0f0ce20e3009ecdb6171525	2025-10-15 16:13:04.926697+00	20250903060000_manual_dependent_seq	\N	\N	2025-10-15 16:13:04.906429+00	1
ad43e0ba-e497-46ec-9bd2-1e6a0fe7ece4	be2d6cd2a66a345aca7e827ec0498c363648560ecf3e23b1ee431af0c9ba1456	2025-10-15 16:13:04.982223+00	20251009_privacy_audit_fix	\N	\N	2025-10-15 16:13:04.929786+00	1
42b7afdc-81d3-4bcf-be06-02aaf66c7d0c	8c3177dad2c88d3a3ce772c981725558d1184fe826b5f3241aa781ac3a466ded	2025-10-15 16:13:05.014188+00	20251015005713_add_missing_fields_and_reports	\N	\N	2025-10-15 16:13:04.984715+00	1
bd158e40-7eb1-46b4-a82b-484f56bef3f3	89105ef3c6cf24a20f086c9a59eff6dc89b967b253437e25beaa0575005e7a48	2025-10-15 16:13:05.031176+00	20251015010008_add_sql_views_for_reports	\N	\N	2025-10-15 16:13:05.016232+00	1
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.admin_users (id, email, role, company_id, otp_secret, otp_enabled, last_login, failed_attempts, locked_until, active, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.audit_logs (id, user_id, user_role, action, table_name, record_id, old_values, new_values, ip_address, user_agent, "timestamp") FROM stdin;
cmgs75rk5000hl15uyh68kucd	cmgs758e6000fl15uuxjqi25h	EMPLOYEE	UPDATE	employee	cmgs758e6000fl15uuxjqi25h	{"id": "cmgs758e6000fl15uuxjqi25h", "email": "gcloud@siegfried.com.mx", "gender": null, "status": "ACTIVE", "position": null, "full_name": "Google Cloud", "google_id": null, "hire_date": "2025-10-15T16:19:41.884Z", "birth_date": null, "company_id": "company-sr-001", "created_at": "2025-10-15T16:19:41.886Z", "department": null, "first_name": null, "last_login": null, "updated_at": "2025-10-15T16:19:41.886Z", "login_count": 0, "org_unit_path": null, "policy_number": null, "employee_number": "SIE-181884", "last_ip_address": null, "last_user_agent": null, "maternal_last_name": null, "paternal_last_name": null}	{"after": {"id": "cmgs758e6000fl15uuxjqi25h", "email": "gcloud@siegfried.com.mx", "gender": "M", "status": "ACTIVE", "position": null, "full_name": "Google Cloud", "google_id": null, "hire_date": "2025-10-15T16:19:41.884Z", "birth_date": "2025-10-29T00:00:00.000Z", "company_id": "company-sr-001", "created_at": "2025-10-15T16:19:41.886Z", "department": null, "first_name": "sf", "last_login": null, "updated_at": "2025-10-15T16:20:06.718Z", "login_count": 0, "org_unit_path": null, "policy_number": null, "employee_number": "SIE-181884", "last_ip_address": null, "last_user_agent": null, "maternal_last_name": "cx", "paternal_last_name": "saf"}, "changes": [{"after": "sf", "field": "first_name", "before": null}, {"after": "saf", "field": "paternal_last_name", "before": null}, {"after": "cx", "field": "maternal_last_name", "before": null}, {"after": "2025-10-29T00:00:00.000Z", "field": "birth_date", "before": null}, {"after": "M", "field": "gender", "before": null}, {"after": "2025-10-15T16:20:06.718Z", "field": "updated_at", "before": "2025-10-15T16:19:41.886Z"}]}	0.0.0.0	web	2025-10-15 16:20:06.724
cmgs78fgd000pl15u2kz1fr2k	cmgs727ki0007l15un186tbr6	EMPLOYEE	DELETE	dependent	cmgs76s86000jl15u3sbnkx47	{"id": "cmgs76s86000jl15u3sbnkx47", "gender": "M", "status": "ACTIVE", "birth_date": "2025-10-08T00:00:00.000Z", "created_at": "2025-10-15T16:20:54.246Z", "created_by": "SIE-040849", "deleted_at": null, "deleted_by": null, "first_name": "prueba", "updated_at": "2025-10-15T16:20:54.246Z", "employee_id": "cmgs727ki0007l15un186tbr6", "dependent_id": "SIE-040849-a01", "dependent_seq": 1, "is_first_time": false, "policy_end_date": null, "policy_start_date": "2025-10-15T16:19:37.970Z", "maternal_last_name": "rosas", "paternal_last_name": "angeles", "relationship_type_id": 3}	{"after": {"id": "cmgs76s86000jl15u3sbnkx47", "gender": "M", "status": "INACTIVE", "birth_date": "2025-10-08T00:00:00.000Z", "created_at": "2025-10-15T16:20:54.246Z", "created_by": "SIE-040849", "deleted_at": null, "deleted_by": null, "first_name": "prueba", "updated_at": "2025-10-15T16:22:10.999Z", "employee_id": "cmgs727ki0007l15un186tbr6", "dependent_id": "SIE-040849-a01", "dependent_seq": 1, "is_first_time": false, "policy_end_date": "2025-10-15T16:22:10.998Z", "policy_start_date": "2025-10-15T16:19:37.970Z", "maternal_last_name": "rosas", "paternal_last_name": "angeles", "relationship_type_id": 3}, "changes": [{"after": "2025-10-15T16:22:10.998Z", "field": "policy_end_date", "before": null}, {"after": "INACTIVE", "field": "status", "before": "ACTIVE"}, {"after": "2025-10-15T16:22:10.999Z", "field": "updated_at", "before": "2025-10-15T16:20:54.246Z"}]}	0.0.0.0	web	2025-10-15 16:22:11.005
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.companies (id, name, code, logo_url, favicon_url, primary_color, secondary_color, accent_color, neutral_color, font_primary, font_secondary, custom_css, active, brand_updated_at, brand_updated_by, created_at) FROM stdin;
company-sr-001	Siegfried Rhein	SR-001	\N	\N	#3498db	#2c3e50	#3b82f6	#6b7280	Arial	Arial	\N	t	\N	\N	2025-10-15 16:13:18.244
company-wp-001	Weser Pharma	WP-001	\N	\N	#e74c3c	#c0392b	#3b82f6	#6b7280	Arial	Arial	\N	t	\N	\N	2025-10-15 16:13:18.256
\.


--
-- Data for Name: dependents; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.dependents (id, employee_id, first_name, paternal_last_name, maternal_last_name, birth_date, gender, relationship_type_id, policy_start_date, policy_end_date, status, created_at, updated_at, dependent_seq, dependent_id, deleted_at, created_by, deleted_by, is_first_time) FROM stdin;
cmgs6xvp20003l15urozv6b9m	cmgs6x0eq0001830hepyxer4g	Test	Dependent	Test	1990-01-01 00:00:00	M	1	2025-01-01 00:00:00	\N	ACTIVE	2025-10-15 16:13:58.838	2025-10-15 16:13:58.838	1	3619-a01	\N	3619	\N	f
cmgs7361f0009l15unxu0cnj6	cmgs6x0eq0001830hepyxer4g	adsdas	das	asd	2025-10-01 00:00:00	M	2	2025-10-15 16:17:18.166	\N	ACTIVE	2025-10-15 16:18:05.523	2025-10-15 16:18:05.523	2	3619-a02	\N	3619	\N	f
cmgs76s86000jl15u3sbnkx47	cmgs727ki0007l15un186tbr6	prueba	angeles	rosas	2025-10-08 00:00:00	M	3	2025-10-15 16:19:37.97	2025-10-15 16:22:10.998	INACTIVE	2025-10-15 16:20:54.246	2025-10-15 16:25:57.022	1	3710-a01	\N	cmgs727ki0007l15un186tbr6	\N	f
cmgs7fev30001rg98my9uadhq	cmgs727ki0007l15un186tbr6	Test	Dependiente	Nuevo	1995-06-15 00:00:00	F	1	2025-10-15 16:27:36.828	\N	ACTIVE	2025-10-15 16:27:36.831	2025-10-15 16:27:36.831	2	3710-a02	\N	cmgs727ki0007l15un186tbr6	\N	f
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.documents (id, employee_id, dependent_id, document_type, original_filename, stored_filename, file_path, file_size, mime_type, upload_ip, uploaded_at) FROM stdin;
\.


--
-- Data for Name: email_campaigns; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.email_campaigns (id, company_id, template_id, name, recipient_criteria, scheduled_at, sent_at, status, total_recipients, emails_sent, emails_failed, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.email_templates (id, company_id, name, category, subject, body_html, body_text, variables, active, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.employees (id, google_id, employee_number, email, full_name, first_name, paternal_last_name, maternal_last_name, birth_date, gender, hire_date, company_id, department, "position", org_unit_path, policy_number, status, created_at, updated_at, last_login, login_count, last_ip_address, last_user_agent) FROM stdin;
cmgs6x0eq0001830hepyxer4g	\N	3619	jonahatan.angeles@siegfried.com.mx	Jonahatan Angeles Rosas	Jonahatan	Angeles	Rosas	1983-06-24 00:00:00	M	2020-01-15 00:00:00	company-sr-001	IT	Desarrollador Senior	\N	\N	ACTIVE	2025-10-15 16:13:18.29	2025-10-15 16:13:18.29	\N	0	\N	\N
cmgs72gsp00012bekb25r3sql	\N	3533	geovanni.cervantes@siegfried.com.mx	Geovanni Cervantes	Geovanni	Cervantes		1985-03-15 00:00:00	M	2020-01-15 00:00:00	company-sr-001	IT	Desarrollador	\N	\N	ACTIVE	2025-10-15 16:17:32.809	2025-10-15 16:17:32.809	\N	0	\N	\N
cmgs72gsx00032bekejb3c6nn	\N	3426	hector.gonzalez@siegfried.com.mx	Hector González	Hector	González		1980-07-20 00:00:00	M	2019-06-01 00:00:00	company-sr-001	Ventas	Gerente de Ventas	\N	\N	ACTIVE	2025-10-15 16:17:32.817	2025-10-15 16:17:32.817	\N	0	\N	\N
cmgs72gt200052bekadylijam	\N	2537	daniel.campuzano@siegfried.com.mx	Daniel Campuzano	Daniel	Campuzano		1988-11-10 00:00:00	M	2021-03-01 00:00:00	company-sr-001	Producción	Supervisor	\N	\N	ACTIVE	2025-10-15 16:17:32.822	2025-10-15 16:17:32.822	\N	0	\N	\N
cmgs72gt700072bekqc3syrc4	\N	2934	leticia.gonzalez@siegfried.com.mx	Leticia González	Leticia	González		1990-05-12 00:00:00	F	2020-08-15 00:00:00	company-sr-001	RH	Analista de RH	\N	\N	ACTIVE	2025-10-15 16:17:32.827	2025-10-15 16:17:32.827	\N	0	\N	\N
cmgs72gtc00092bekmat3dc3q	\N	3509	andres.galvan@siegfried.com.mx	Andrés Galván	Andrés	Galván		1987-09-25 00:00:00	M	2021-01-10 00:00:00	company-sr-001	Contabilidad	Contador	\N	\N	ACTIVE	2025-10-15 16:17:32.832	2025-10-15 16:17:32.832	\N	0	\N	\N
cmgs758e6000fl15uuxjqi25h	\N	SIE-181884	gcloud@siegfried.com.mx	Google Cloud	sf	saf	cx	2025-10-29 00:00:00	M	2025-10-15 16:19:41.884	company-sr-001	\N	\N	\N	\N	ACTIVE	2025-10-15 16:19:41.886	2025-10-15 16:20:06.718	\N	0	\N	\N
cmgs727ki0007l15un186tbr6	\N	3710	jorge.escalera@siegfried.com.mx	Jorge Eduardo Escalera Montiel	\N	\N	\N	\N	\N	2025-10-15 16:17:20.849	company-sr-001	\N	\N	\N	\N	ACTIVE	2025-10-15 16:17:20.851	2025-10-15 16:21:53.468	\N	0	\N	\N
\.


--
-- Data for Name: pdf_templates; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.pdf_templates (id, company_id, template_type, name, config_json, custom_css, header_config, footer_config, version, active, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: privacy_acceptances; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.privacy_acceptances (id, employee_id, dependent_id, acceptance_type, privacy_version, accepted_at, ip_address, user_agent, created_at) FROM stdin;
cmgs73671000dl15u1rtd3k1u	cmgs6x0eq0001830hepyxer4g	cmgs7361f0009l15unxu0cnj6	DEPENDENT	v1.0	2025-10-15 16:18:05.725	172.18.0.5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-15 16:18:05.725
cmgs76sa9000nl15uelpo2eag	cmgs727ki0007l15un186tbr6	cmgs76s86000jl15u3sbnkx47	DEPENDENT	v1.0	2025-10-15 16:20:54.322	172.18.0.5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	2025-10-15 16:20:54.322
\.


--
-- Data for Name: relationship_types; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.relationship_types (id, name, display_order, active) FROM stdin;
1	Cónyuge	1	t
2	Hijo(a)	2	t
3	Padre	3	t
4	Madre	4	t
5	Hermano(a)	5	t
6	Abuelo(a)	6	t
7	Nieto(a)	7	t
8	Otro	8	t
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.reports (id, employee_id, report_type, report_name, generated_at, status, file_path, file_size, download_count, generated_by, parameters, error_message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.system_config (key, value, description, value_type, updatable_by_role, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: sgmm_user
--

COPY public.user_sessions (id, employee_id, session_token, ip_address, user_agent, created_at, expires_at, last_activity, is_active) FROM stdin;
\.


--
-- Name: relationship_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sgmm_user
--

SELECT pg_catalog.setval('public.relationship_types_id_seq', 8, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: dependents dependents_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.dependents
    ADD CONSTRAINT dependents_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns email_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: pdf_templates pdf_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.pdf_templates
    ADD CONSTRAINT pdf_templates_pkey PRIMARY KEY (id);


--
-- Name: privacy_acceptances privacy_acceptances_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.privacy_acceptances
    ADD CONSTRAINT privacy_acceptances_pkey PRIMARY KEY (id);


--
-- Name: relationship_types relationship_types_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.relationship_types
    ADD CONSTRAINT relationship_types_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (key);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_session_token_key UNIQUE (session_token);


--
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- Name: companies_code_key; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE UNIQUE INDEX companies_code_key ON public.companies USING btree (code);


--
-- Name: dependents_dependent_id_key; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE UNIQUE INDEX dependents_dependent_id_key ON public.dependents USING btree (dependent_id);


--
-- Name: dependents_employee_id_dependent_seq_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX dependents_employee_id_dependent_seq_idx ON public.dependents USING btree (employee_id, dependent_seq);


--
-- Name: employees_email_key; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE UNIQUE INDEX employees_email_key ON public.employees USING btree (email);


--
-- Name: employees_employee_number_key; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE UNIQUE INDEX employees_employee_number_key ON public.employees USING btree (employee_number);


--
-- Name: employees_google_id_key; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE UNIQUE INDEX employees_google_id_key ON public.employees USING btree (google_id);


--
-- Name: privacy_acceptances_acceptance_type_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX privacy_acceptances_acceptance_type_idx ON public.privacy_acceptances USING btree (acceptance_type);


--
-- Name: privacy_acceptances_dependent_id_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX privacy_acceptances_dependent_id_idx ON public.privacy_acceptances USING btree (dependent_id);


--
-- Name: privacy_acceptances_employee_id_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX privacy_acceptances_employee_id_idx ON public.privacy_acceptances USING btree (employee_id);


--
-- Name: relationship_types_name_key; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE UNIQUE INDEX relationship_types_name_key ON public.relationship_types USING btree (name);


--
-- Name: reports_employee_id_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX reports_employee_id_idx ON public.reports USING btree (employee_id);


--
-- Name: reports_generated_at_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX reports_generated_at_idx ON public.reports USING btree (generated_at);


--
-- Name: reports_report_type_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX reports_report_type_idx ON public.reports USING btree (report_type);


--
-- Name: reports_status_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX reports_status_idx ON public.reports USING btree (status);


--
-- Name: user_sessions_employee_id_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX user_sessions_employee_id_idx ON public.user_sessions USING btree (employee_id);


--
-- Name: user_sessions_expires_at_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX user_sessions_expires_at_idx ON public.user_sessions USING btree (expires_at);


--
-- Name: user_sessions_session_token_idx; Type: INDEX; Schema: public; Owner: sgmm_user
--

CREATE INDEX user_sessions_session_token_idx ON public.user_sessions USING btree (session_token);


--
-- Name: v_employees_consolidated _RETURN; Type: RULE; Schema: public; Owner: sgmm_user
--

CREATE OR REPLACE VIEW public.v_employees_consolidated AS
 SELECT e.id,
    e.employee_number,
    e.email,
    e.full_name,
    e.first_name,
    e.paternal_last_name,
    e.maternal_last_name,
    e.birth_date,
    e.gender,
    EXTRACT(year FROM age(e.birth_date)) AS calculated_age,
    e.hire_date,
    e.company_id,
    c.name AS company_name,
    c.code AS company_code,
    e.department,
    e."position",
    e.policy_number,
    e.status,
    e.last_login,
    e.login_count,
    e.created_at,
    e.updated_at,
    count(d.id) FILTER (WHERE (d.status = 'ACTIVE'::public."DependentStatus")) AS active_dependents_count,
    count(d.id) FILTER (WHERE (d.status = 'INACTIVE'::public."DependentStatus")) AS inactive_dependents_count,
    count(d.id) AS total_dependents_count
   FROM ((public.employees e
     LEFT JOIN public.companies c ON ((e.company_id = c.id)))
     LEFT JOIN public.dependents d ON ((e.id = d.employee_id)))
  WHERE (e.status = 'ACTIVE'::public."EmployeeStatus")
  GROUP BY e.id, c.name, c.code;


--
-- Name: admin_users admin_users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dependents dependents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.dependents
    ADD CONSTRAINT dependents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dependents dependents_relationship_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.dependents
    ADD CONSTRAINT dependents_relationship_type_id_fkey FOREIGN KEY (relationship_type_id) REFERENCES public.relationship_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: documents documents_dependent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_dependent_id_fkey FOREIGN KEY (dependent_id) REFERENCES public.dependents(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_campaigns email_campaigns_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_campaigns email_campaigns_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.email_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: email_templates email_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pdf_templates pdf_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.pdf_templates
    ADD CONSTRAINT pdf_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: privacy_acceptances privacy_acceptances_dependent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.privacy_acceptances
    ADD CONSTRAINT privacy_acceptances_dependent_id_fkey FOREIGN KEY (dependent_id) REFERENCES public.dependents(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: privacy_acceptances privacy_acceptances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.privacy_acceptances
    ADD CONSTRAINT privacy_acceptances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reports reports_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_sessions user_sessions_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sgmm_user
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 5unE0zxmaerbIgcWGEssPiQgmIWcV0QIBLGcuBGezVz4oAUXZn16ripS0TJ4KRv

