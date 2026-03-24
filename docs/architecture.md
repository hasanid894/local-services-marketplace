# Arkitektura e Sistemit – Local Services Marketplace

## 1. Hyrje

Ky sistem përfaqëson një platformë për tregun e shërbimeve lokale, e implementuar me një **arkitekturë me shtresa (layered architecture)**.

Sistemi aktual përdor **ruajtje në file (CSV)**, ndërsa është projektuar në mënyrë të tillë që të mundësojë **integrim të lehtë me bazë të dhënash (database)** në të ardhmen, pa ndryshuar logjikën e biznesit.

---

## 2. Arkitektura e Përgjithshme

Sistemi është i strukturuar në bazë të këtyre shtresave:

Client (Frontend)

  ↓

Routes

  ↓
    
Middleware

  ↓

Controllers

  ↓

Services (Business Logic)

  ↓
    
Repository (Abstraksioni)

  ↓
    
FileRepository (Implementimi aktual)

  ↓
    
CSV Files


Folderi "repositories/" përfaqëson shtresën Data (Data Layer)

---

## 3.Rrjedha e Kërkesave (Request Flow)

Çdo kërkesë HTTP kalon përmes këtyre hapave:

1. Klienti dërgon kërkesë
2. Kërkesa përpunohet nga **Routes**
3. Middleware ekzekutohet (autentikim, menaxhim gabimesh)
4. Controller pranon kërkesën
5. Controller thërret Service layer
6. Service aplikon logjikën e biznesit
7. Service komunikon me Repository
8. Repository ruan/merr të dhëna nga file
9. Kthehet përgjigja te klienti

Ky proces siguron:
- Strukturë të qartë
- Siguri përmes middleware
- Ndarje të përgjegjësive

---

## 4.Përgjegjësitë e shtresave të sistemit

### 4.1 Routes

- Pika hyrëse e kërkesave HTTP
- Mapojnë endpoint-et me controller-at

Shembuj:
- `authRoutes.js`
- `userRoutes.js`
- `serviceRoutes.js`

---

### 4.2 Middleware

Middleware përdoret për funksione të përbashkëta (cross-cutting concerns):

- Autentikim (`authMiddleware`)
- Menaxhim gabimesh (`errorHandler`)

Middleware ekzekutohet **para controller-it**.

---

### 4.3 Controllers

- Marrin kërkesat nga routes
- Thërrasin service layer
- Nuk përmbajnë logjikë biznesi
---

### 4.4 Services (Business Logic Layer)

- Përmbajnë gjithë logjikën e aplikacionit
- Janë të pavarura nga mënyra e ruajtjes së të dhënave

Shembuj:
- `UserService`
- `BookingService`
- `ReviewService`
- `ServiceService`
- `AuthService`


---

### 4.5 Repositoriy Layer (Shtresa e Abstraksionit)

Ky sistem përdor **Repository Pattern**.

#### Interface: `IRepository`

Definon operacionet bazë:

- `getAll()`
- `getById(id)`
- `add(entity)`
- `update(id, data)`
- `delete(id)`
- `save()`

#### FileRepository

- Ruajtja e të dhënave bëhet në CSV files
- Implementon `IRepository`
- Nuk përdoret direkt nga controllers

---

## 5.Implementimi Aktual (Faza 1)

- Sistemi përdor file-based storage (CSV)
- `FileRepository` menaxhon të gjitha operacionet e ruajtjes
- Nuk ka akses direkt në file nga shtresat tjera

Kjo siguron:
- Thjeshtësi
- Qartësi në strukturë
- Stabilitet për zhvillim akademik

---

## 6. Integrimi i planifikuar i Bazës së të Dhënave (Faza 2)

Sistemi është projektuar për të kaluar në database pa ndryshuar pjesët tjera.

### Arkitektura e ardhshme:


Service Layer

↓

IRepository (Interface)

↓

DatabaseRepository

↓

Database (SQL)


### Strategjia e tanzicionit:

- Implemento `DatabaseRepository`
- Zëvendëso `FileRepository`
- Nuk ndryshohen:
  - Services
  - Controllers
  - Routes
  - Middleware

Kjo është e mundur falë **Dependency Inversion Principle (DIP)**.

---

## 7. Parimet e Dizajnit

### 7.1 Ndarja e Përgjegjësive (Separation of Concerns)
Çdo shtresë ka funksion të qartë dhe të izoluar.

### 7.2 Dependency Inversion Principle
Shtresat e sipërme varen nga abstraksione (`IRepository`), jo nga implementime konkrete.

### 7.3 Open/Closed Principle
Sistemi mund të zgjerohet pa modifikuar kodin ekzistues.

### 7.4 Single Responsibility Principle
Çdo klasë ka vetëm një përgjegjësi.

---

## 8. Siguria

- Middleware përdoret për autentikim (JWT)
- Fjalëkalimet ruhen të hashuara (p.sh. bcrypt)
- Validimi i input-it bëhet në service layer
- Menaxhimi i gabimeve bëhet në mënyrë qendrore

---

## 9.Shembull i Rrjedhës së të Dhënave

### Krijimi i një përdoruesi:

1. Klienti dërgon kërkesë
2. Routes e dërgon te controller
3. Middleware verifikon kërkesën
4. Controller thërret `UserService`
5. Service validon të dhënat
6. Service thërret `IRepository.add()`
7. `FileRepository` ruan të dhënat në CSV
8. Kthehet përgjigja

---

## 10. Zgjerueshmëria

Arkitektura lejon:

- Integrim të lehtë me database
- Shtim të funksionaliteteve të reja
- Zhvillim modular
- Mirëmbajtje të thjeshtë

---

## 11. Përfundim

Sistemi është i implementuar me ruajtje në file, por është i dizajnuar si një **arkitekturë e gatshme për database**.

Falë përdorimit të abstraksionit (`IRepository`), migrimi drejt një baze të dhënash mund të bëhet pa ndryshuar logjikën e biznesit.


