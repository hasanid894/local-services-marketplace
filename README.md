# Local Services Marketplace

Një platformë web full-stack që lidh klientët me ofruesit e shërbimeve lokale në Kosovë — hidraulikë, elektricistë, mësues, pastrues, dhe shumë të tjerë. Klientët mund të shfletojnë shërbimet, të krijojnë bookings dhe të lënë reviews. Ofruesit mund të menaxhojnë listat e tyre dhe të përgjigjen ndaj bookings. Adminët kanë mbikëqyrje të plotë të platformës.

---

## Tabela e Përmbajtjes

1. [Përshkrimi i Projektit](#1-përshkrimi-i-projektit)
2. [Technology Stack](#2-technology-stack)
3. [Arkitektura](#3-arkitektura)
4. [Fillimi i Punës](#4-fillimi-i-punës)
   - [Kërkesat paraprake](#41-kërkesat-paraprake)
   - [Environment Variables](#42-environment-variables)
   - [Konfigurimi i Bazës së të Dhënave](#43-konfigurimi-i-bazës-së-të-dhënave)
   - [Ekzekutimi i Backend-it](#44-ekzekutimi-i-backend-it)
   - [Ekzekutimi i Frontend-it](#45-ekzekutimi-i-frontend-it)
   - [Ekzekutimi i Testeve](#46-ekzekutimi-i-testeve)
5. [API Reference](#5-api-reference)
6. [Struktura e Projektit](#6-struktura-e-projektit)
7. [Parimet e Dizajnit](#7-parimet-e-dizajnit)
8. [Autori](#8-autori)

---

## 1. Përshkrimi i Projektit

**Local Services Marketplace** është një platformë dixhitale që rrit transparencën dhe besueshmërinë në tregun e shërbimeve lokale.

**Funksionalitetet kryesore:**
- Qasje e bazuar në role: **Customer**, **Provider**, **Admin**
- Autentikim me JWT dhe enkriptim fjalëkalimesh me bcrypt
- CRUD i plotë për listat e shërbimeve me filtrim sipas kategorisë dhe vendndodhjes
- Cikli jetësor i booking-ut: `pending → confirmed → completed / cancelled`
- Sistem reviews dhe vlerësimesh
- Modalitet i dyfishtë ruajtjeje: bazë të dhënash PostgreSQL (default) ose skedarë CSV

---

## 2. Technology Stack

| Shtresa | Teknologjia |
|---|---|
| Frontend | React 18 |
| Backend | Node.js + Express 5 |
| Baza e të Dhënave | **PostgreSQL** (e integruar plotësisht) |
| Autentikimi | JWT (jsonwebtoken) + bcrypt |
| ORM / Query layer | `pg` (node-postgres) — parametrized queries direkte |
| Testimi | Jest |
| Kontrolli i Versioneve | Git + GitHub |
| Dokumentacioni | Markdown |

---

## 3. Arkitektura

Backend-i përdor një **Arkitekturë me Shtresa (Layered Architecture)** me ndarje strikte të përgjegjësive:
```
Routes → Controllers → Services → Repositories → Database
```

| Shtresa | Përgjegjësia |
|---|---|
| **Routes** | Deklarojnë endpoints e API-t dhe aplikojnë middleware |
| **Controllers** | Analizojnë kërkesat HTTP, thërrasin metodat e services, dërgojnë përgjigjet |
| **Services** | Logjika e biznesit dhe validimi (pa dijeni për HTTP) |
| **Repositories** | Qasja në të dhëna — e gjithë SQL gjendet këtu |
| **Models** | Objekte të thjeshta të të dhënave (pa logjikë) |
| **Middleware** | Verifikimi i JWT, ruajtja e roleve, trajtimi i gabimeve |

**Repository Pattern** (`IRepository` interface + implementime konkrete) lejon që i gjithë backend-i të kalojë ndërmjet PostgreSQL dhe CSV duke ndryshuar vetëm një environment variable (`USE_DB=true/false`). Services nuk importojnë kurrë libraritë e bazës së të dhënave drejtpërdrejt.

---

## 4. Fillimi i Punës

### 4.1 Kërkesat Paraprake

- [Node.js](https://nodejs.org/) v18 ose më i lartë
- [PostgreSQL](https://www.postgresql.org/) v14 ose më i lartë, duke punuar lokalisht
- `npm` (vjen me Node.js)
- Git

### 4.2 Environment Variables

Krijo një skedar të quajtur `.env` brenda direktorisë `backend/`. Mund ta kopjosh `.env.example` si pikënisje:

```bash
cp backend/.env.example backend/.env
```

Pastaj plotëso vlerat:

| Variabla | E detyrueshme | Default | Përshkrimi |
|---|---|---|---|
| `PORT` | Jo | `5000` | Porta ku dëgjon serveri Express |
| `DB_HOST` | Po | `localhost` | Host-i i PostgreSQL |
| `DB_PORT` | Jo | `5432` | Porta e PostgreSQL |
| `DB_NAME` | Po | — | Emri i bazës tënde të të dhënave (p.sh. `local_services_marketplace`) |
| `DB_USER` | Po | `postgres` | Përdoruesi i PostgreSQL |
| `DB_PASSWORD` | Po | — | Fjalëkalimi i PostgreSQL për përdoruesin e mësipërm |
| `JWT_SECRET` | **Po** | — | Secret i gjatë dhe random për nënshkrimin e JWT-ve. **Mos e commit kurrë.** |
| `USE_DB` | Jo | `false` | Vendos `true` për PostgreSQL; `false` për skedarë CSV |

> **Shënim sigurie:** `.env` është i listuar në `.gitignore` dhe nuk do të commit-ohet kurrë në Git.
> **Mos shpërndaj ose commit-o kurrë `DB_PASSWORD` ose `JWT_SECRET` real.**
> Vlerat më poshtë janë vetëm shembuj ilustrativë — zëvendëso secilin prej tyre.

Shembull `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=local_services_marketplace
DB_USER=postgres
DB_PASSWORD=FJALEKALIMI_YT_REAL_POSTGRES_KETU
JWT_SECRET=zevndesoje-me-nje-secret-te-gjate-random-te-pakten-32-karaktere
USE_DB=true
```

### 4.3 Konfigurimi i Bazës së të Dhënave

1. **Krijo bazën e të dhënave** në PostgreSQL:
```sql
   CREATE DATABASE local_services_marketplace;
```

2. **Apliko skemin** (krijon të gjitha tabelat, indekset dhe kufizimet e çelësave të huaj):
```bash
   cd backend
   npm run db:schema
```

3. **Verifiko** që tabelat u krijuan:
```bash
   npm run db:check
```
   Duhet të shohësh: `users`, `services`, `bookings`, `reviews`, `categories`, `payments`, dhe të tjera.

4. **Test i shpejtë i lidhjes**:
```bash
   npm run db:test
```

### 4.4 Ekzekutimi i Backend-it

```bash
cd backend
npm install
node server.js
```

API-ja do të jetë e disponueshme në: **http://localhost:5000**

### 4.5 Ekzekutimi i Frontend-it

```bash
cd frontend
npm install
npm start
```

Aplikacioni React do të hapet në: **http://localhost:3000**

### 4.6 Ekzekutimi i Testeve

```bash
cd backend
npm test
```

Kjo ekzekuton Jest në modalitet verbose për të gjitha skedarët në `backend/tests/`. Testet përdorin repository stubs në memorie — nuk kërkohet lidhje me bazën e të dhënave.

---

## 5. API Reference

Të gjitha routes të autentikuara kërkojnë header-in:
```
Authorization: Bearer <token>
```

### Autentikimi

| Metoda | Endpoint | Auth e Nevojshme | Përshkrimi |
|---|---|---|---|
| `POST` | `/api/auth/register` | Jo | Regjistrohu si customer ose provider |
| `POST` | `/api/auth/login` | Jo | Hyr, kthen JWT token |

### Shërbimet (Services)

| Metoda | Endpoint | Auth e Nevojshme | Përshkrimi |
|---|---|---|---|
| `GET` | `/api/services` | Jo | Listo të gjitha shërbimet (mbështet filtrat `?category=&location=`) |
| `GET` | `/api/services/:id` | Jo | Merr një shërbim të vetëm sipas ID-së |
| `POST` | `/api/services` | Po (provider) | Krijo një listim të ri shërbimi |
| `PUT` | `/api/services/:id` | Po (provider/admin) | Përditëso një shërbim |
| `DELETE` | `/api/services/:id` | Po (provider/admin) | Fshi një shërbim |

### Rezervimet (Bookings)

| Metoda | Endpoint | Auth e Nevojshme | Përshkrimi |
|---|---|---|---|
| `GET` | `/api/bookings` | Po | Merr bookings (filtruar automatikisht sipas rolit) |
| `POST` | `/api/bookings` | Po (customer) | Krijo një booking |
| `PATCH` | `/api/bookings/:id/status` | Po (provider/admin) | Përditëso statusin e booking-ut |
| `DELETE` | `/api/bookings/:id` | Po | Anulo / fshi një booking |

**Statuset e vlefshme të booking-ut:** `pending` → `confirmed` → `completed` ose `cancelled`

### Vlerësimet (Reviews)

| Metoda | Endpoint | Auth e Nevojshme | Përshkrimi |
|---|---|---|---|
| `GET` | `/api/reviews` | Jo | Merr të gjitha reviews |
| `POST` | `/api/reviews` | Po (customer) | Dërgo një review (vlerësim 1–5) |
| `DELETE` | `/api/reviews/:id` | Po (admin) | Hiq një review |

### Përdoruesit (Users)

| Metoda | Endpoint | Auth e Nevojshme | Përshkrimi |
|---|---|---|---|
| `GET` | `/api/users` | Po (admin) | Listo të gjithë përdoruesit |
| `GET` | `/api/users/:id` | Po | Merr profilin e përdoruesit |
| `PUT` | `/api/users/:id` | Po | Përditëso profilin e përdoruesit |

---

## 6. Struktura e Projektit

```
local-services-marketplace/
├── frontend/
│   └── src/
│       ├── pages/          # Komponentet e faqeve React
│       ├── context/        # AuthContext (JWT + gjendja e përdoruesit)
│       └── services/       # API client (api.js)
│
├── backend/
│   ├── config/
│   │   ├── db.js           # Connection pool i PostgreSQL
│   │   └── schema.sql      # Skema e plotë e bazës së të dhënave
│   ├── controllers/        # Trajtuesit e kërkesave HTTP
│   ├── services/           # Logjika e biznesit (AuthService, ServiceService, etj.)
│   ├── repositories/       # Shtresa e qasjes në të dhëna
│   │   ├── IRepository.js          # Interface abstrakte
│   │   ├── DatabaseRepository.js   # Implementimi PostgreSQL
│   │   ├── FileRepository.js       # Implementimi alternativ CSV
│   │   └── ...             # Repository-t specifike për entitete
│   ├── routes/             # Routerët e Express
│   ├── middleware/         # JWT auth, mbrojtja e roleve, trajtimi i gabimeve
│   ├── models/             # Definicionet e modeleve të të dhënave
│   ├── tests/              # Testet unit të Jest (pa nevojë për DB reale)
│   ├── container.js        # Kontejneri i Dependency Injection (lidh repos → services)
│   ├── app.js              # Konfigurimi i Express (security headers, CORS, rate limiting)
│   └── server.js           # Pika hyrëse e serverit
│
├── docs/
│   ├── architecture.md
│   ├── class-diagram.md
│   ├── project-audit.md       # Raporti i Auditimit
│   ├── improvement-report.md  # Raporti i Sprint-it të Përmirësimit
│   ├── implementation.md      # Shënime Implementimi
│   ├── sprint-plan.md         # Plani i Sprint-it
│   ├── sprint-report.md       # Raporti i Sprint-it
│   └── demo-plan.md           # Plani i Gatishmërisë për Demo
│
├── .gitignore
└── README.md
```
---

## 7. Parimet e Dizajnit

| Parimi | Si Aplikohet |
|---|---|
| **SRP** (Single Responsibility) | Çdo shtresë (controller / service / repository) ka saktësisht një detyrë |
| **OCP** (Open/Closed) | Implementime të reja të repository mund të shtohen pa modifikuar kodin e services |
| **DIP** (Dependency Inversion) | Services varen nga `IRepository`, kurrë drejtpërdrejt nga `DatabaseRepository` |
| **Repository Pattern** | Abstrakton të gjithë qasjen në të dhëna; ruajtja mund të ndryshohet me env flag `USE_DB` |
| **Layered Architecture** | Rrjedhë e qartë e të dhënave: Route → Controller → Service → Repository → DB |

---

## 8. Autor

**Devlete Hasani**  
Studente, Fakulteti i Inxhinierisë Mekanike dhe Kompjuterike

