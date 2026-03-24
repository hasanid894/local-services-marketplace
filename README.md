# Local Services Marketplace

## Përshkrimi i Projektit

Local Services Marketplace është një platformë digjitale që lidh përdoruesit me ofrues të shërbimeve lokale në Kosovë, duke përfshirë hidraulikë, elektriçistë, tutorë, pastrues shtëpish dhe profesione të tjera.

Platforma synon të rrisë transparencën, besueshmërinë dhe aksesin në shërbime përmes:

- Profileve të verifikuara të ofruesve  
- Rezervimeve të drejtpërdrejta  
- Sistemit të vlerësimeve dhe komenteve  
- Filtrimit sipas kategorisë dhe lokacionit  

---

## Objektivat e Projektit

- Sigurimi i një marketplace të besueshëm për shërbime lokale  
- Lehtësimi i rezervimeve online  
- Menaxhimi i profileve të ofruesve  
- Implementimi i role-based access (Customer, Provider, Admin)  
- Sistemi i vlerësimeve dhe komenteve  
- Gatishmëri për zgjerim (pagesa, chat, mapa)

---

## Arkitektura e Sistemit

Projekti është implementuar duke përdorur **arkitekturë të ndarë në shtresa (Layered Architecture)**:

### Shtresat kryesore:

- **Models** – përfaqësojnë entitetet (User, Service, Booking, Review)  
- **Services** – përmbajnë logjikën e biznesit  
- **Data (Repository Layer)** – menaxhon aksesin në të dhëna përmes `IRepository`  
- **Controllers** – trajtojnë kërkesat HTTP  
- **Routes** – përcaktojnë endpoint-et e API  
- **Middleware** – trajton autentikimin dhe error handling  
- **Frontend (UI)** – ndërfaqja e përdoruesit  

---

## Repository Pattern

Është implementuar **Repository Pattern** për ndarjen e logjikës së biznesit nga data access.

### Komponentët:

- `IRepository` – interface abstrakt  
- `FileRepository` – implementim konkret me CSV  

Metodat kryesore:

- `getAll()`  
- `getById()`  
- `add()`  
- `save()`  
- `update()`  
- `delete()`  

Ky dizajn mundëson zëvendësimin e lehtë me një **DatabaseRepository** në të ardhmen.

---

## Gatishmëria për Database

Edhe pse aktualisht përdoret **File-based persistence (CSV)**, arkitektura është projektuar për:

- Integrim të lehtë me PostgreSQL  
- Zëvendësim të `FileRepository` me `DatabaseRepository`  
- Pa ndryshuar Services apo Controllers (OCP + DIP)  

---

## Struktura e Projektit

local-services-marketplace
│

├── frontend/ # UI (React)

│

├── backend/

│ ├── models/ # Entitetet

│ ├── services/ # Business logic

│ ├── repositories/ # Data layer (Repository Pattern)

│ ├── controllers/ # Request handling

│ ├── routes/ # API endpoints

│ ├── middleware/ # Auth & error handling

│ ├── app.js # Inicializim 

│ └── server.js # Konfigurim dhe startim serveri

│

├── docs/

│ ├── architecture.md

│ ├── class-diagram.md

│ └── project-description.md

│

├── .gitignore

├── README.md

└── package.json


---

## Teknologjitë e Përdorura

| Komponenti | Teknologjia |
|-----------|------------|
| Frontend  | React |
| Backend   | Node.js + Express.js |
| Data Layer | CSV (FileRepository) |
| Database (planned) | PostgreSQL |
| Version Control | Git + GitHub |
| Autentikimi | JWT |
| Dokumentimi | Markdown |

---

## Si të Ekzekutohet Projekti

### Backend

```bash
cd backend
npm install
node server.js
```
Serveri starton në:

http://localhost:5000

###Frontend
```bash
cd frontend
npm install
npm start
```
## Parimet SOLID të Aplikuara

- **SRP (Single Responsibility Principle)**  
  Çdo shtresë ka një përgjegjësi të vetme  

- **DIP (Dependency Inversion Principle)**  
  Services varen nga `IRepository`, jo nga implementimi konkret  

- **OCP (Open/Closed Principle)**  
  Sistemi mund të zgjerohet pa ndryshuar kodin ekzistues  

---

## Vlera për Komunitetin

- Rrit transparencën e shërbimeve lokale  
- Ndihmon përdoruesit të gjejnë shërbime të besueshme  
- Mbështet ofruesit lokalë në rritjen e klientelës  
- Krijon një platformë të centralizuar dhe të strukturuar  

---

## Autor

Devlete Hasani  
Studente Fakultetit të Inxhinierisë Mekanike dhe Kompjuterike


