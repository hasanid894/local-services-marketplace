# Sprint 2 Report — Devlete Hasani

## Çfarë Kam Realizuar

### 1. Veçoria e Re — DatabaseRepository Skeleton + Rruga e Migrimit

**Çfarë u ndërtua:**
- U krijua `backend/repositories/DatabaseRepository.js` — implementim i plotë i `IRepository` duke përdorur një store në memorie si placeholder për një lidhje të ardhshme me PostgreSQL
- Çdo metodë (`getAll`, `getById`, `add`, `save`, `delete`, `update`) përfshin një koment që tregon query-n SQL me të cilën do të zëvendësohet
- U shtua një ndërprerës ambienti `USE_DB=true/false` në `serviceController.js` dhe `ui/menu.js` që ndërron repository-n në startup pa asnjë ndryshim në `ServiceService` apo logjikën e controller-ave
- Kjo demonstron **Dependency Inversion (DIP)** dhe **Open/Closed Principle (OCP)** nga SOLID — shtresa e shërbimit është plotësisht e pavetëdijshme për cilin backend persistence është aktiv

**Rrjedha e arkitekturës (UI → Service → Repository):**
```
Console UI / React UI / REST API
        ↓
  ServiceService (logjika e pandryshuar)
        ↓
  FileRepository  ←→  DatabaseRepository  (ndërrohet me USE_DB)
```

**Si të ndërrosh:**
```bash
# Përdor CSV (parazgjedhje)
node server.js

# Përdor DatabaseRepository skeleton
USE_DB=true node server.js
```

---

### 2. Trajtimi i Gabimeve

**Rasti 1 — Rresht CSV i deformuar në FileRepository:**
- `_load()` tani e mbështjell parsimin e çdo rreshti në `try-catch` të vetin
- Rreshtat e deformuar anashkalohen me `console.error(...)`, programi vazhdon normalisht
- File-not-found trajtohet: shfaq `"File not found, creating new file..."` dhe rikuperohet
- `save()` gjithashtu ka `try-catch` me mesazh gabimi përshkrues

**Rasti 2 — Fetch i frontend-it dështon (backend offline):**
- U shtua helper-i `safeFetch()` në `App.js` që kap të gjitha gabimet e rrjetit dhe përgjigjet jo-JSON
- Shfaq baner `"Backend offline — Request failed"` në krye të faqes
- UI mbetet plotësisht i përdorshëm (kërkim, filtrim mbeten të dukshme dhe interaktive)
- Gabimet e formës, gabimet globale dhe gabimet e find-by-ID shfaqen veçmas

**Rasti 3 — ID të pavlefshme ose të pa-gjetura:**
- `serviceController.js`: helper-i `parseId()` vërteton që `:id` është numër i plotë pozitiv; kthen HTTP `400` me `"Please enter a valid ID (positive integer)."` në vend të `NullReferenceException`
- `ServiceService.findById()`: mbron ndaj ID-ve jo-numerike, kthen `null` në vend se të crash-ojë
- Të gjitha përgjigjet 404 kthejnë `"Item not found: no service with id X."` — mesazh i qëndrueshëm i përdorur kudo
- Console UI (`menu.js`) vërteton të gjitha ID-të dhe çmimet e futura nga përdoruesi para se të thërrasë ndonjë metodë shërbimi, me mesazhe miqësore si `"Please enter a valid number for price."`

---

### 3. Testet e Njësisë

**Projekti i testeve:** `backend/tests/` (Jest)

**Komanda për ekzekutim:**
```bash
cd backend
npm test
```

**Rezultati: 24 teste — 24 kalojnë ✓**

#### `tests/serviceService.test.js` — 12 teste
| Testi | Rezultati |
|-------|-----------|
| add() me të dhëna të vlefshme kthen service me id | ✓ |
| add() me title bosh hedh "Name cannot be empty" | ✓ |
| add() me price = 0 hedh "Price must be greater than 0" | ✓ |
| add() me price negativ hedh gabim | ✓ |
| add() me price jo-numerike ("abc") tregon "Please enter a valid number" | ✓ |
| list() filtron sipas category pa dallim të germave të mëdha/vogla ("education" vs "EDUCATION") | ✓ |
| updateService() me id joekzistues hedh "Item not found" | ✓ |
| deleteService() me id joekzistues hedh "Item not found" | ✓ |
| findById() kthen service kur ekziston | ✓ |
| findById() kthen null kur id nuk ekziston | ✓ |
| findById() kthen null për id jo-numerike (nuk crash-on) | ✓ |
| ServiceService punon njëlloj me DatabaseRepository (testi i ndërrimit) | ✓ |

#### `tests/fileRepository.test.js` — 12 teste
| Testi | Rezultati |
|-------|-----------|
| File krijohet automatikisht kur mungon | ✓ |
| getAll() kthehet bosh në repo të ri | ✓ |
| add() cakton id dhe getAll() e kthen | ✓ |
| add() rrit automatikisht id-të | ✓ |
| getById() kthen entitetin e saktë | ✓ |
| getById() kthen null për id joekzistues | ✓ |
| update() ndryshon vetëm fushat e specifikuara | ✓ |
| update() kthen null për id joekzistues | ✓ |
| delete() heq entitetin, kthen true | ✓ |
| delete() kthen false për id joekzistues | ✓ |
| Të dhënat ruhen mes instancave të repo-s (disk I/O) | ✓ |
| Rreshtat CSV të deformuar anashkalohen, rreshtat e vlefshëm ngarkohen (nuk crash-on) | ✓ |

---

## Çfarë Mbeti

Asgjë nga plani i sprint-it nuk mbeti e parealizuar. Të tre deliverable-t u implementuan:
- DatabaseRepository skeleton me ndërprerësin e konfigurimit ✓
- Trajtimi i gabimeve nëpër Repository, Service, UI dhe Frontend ✓
- Projekti i testeve me 24 teste kalues që mbulojnë të gjitha rastet e planifikuara ✓

---

## Çfarë Mësova

Gjatë këtij sprint-i mësova se si **Dependency Inversion Principle** e bën kodin vërtet më të lehtë për t'u ndryshuar. Shkrimi i testit të ndërrimit të repository-t e vërtetoi: ndërrova `FileRepository` me `DatabaseRepository` në një rresht, dhe të gjitha testet e `ServiceService` kaluan pa prekur fare kodin e shërbimit. Zgjedhja arkitekturore nga Sprint 1 u shpërbly drejtpërdrejt në Sprint 2.
