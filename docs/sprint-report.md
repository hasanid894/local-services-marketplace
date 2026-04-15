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
**Evidencë**
<img width="1055" height="126" alt="image" src="https://github.com/user-attachments/assets/32e2be87-6f83-4e54-84b1-346a542c5840" />


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

### Error Handling
- Screenshot nga UI kur jepet input invalid
- 
<img width="838" height="329" alt="image" src="https://github.com/user-attachments/assets/8627ebec-0071-4531-81c2-1c3c6563da40" />
<img width="922" height="366" alt="image" src="https://github.com/user-attachments/assets/19b3a496-327f-41a2-889a-20accf67c2a5" />
<img width="906" height="347" alt="image" src="https://github.com/user-attachments/assets/af112faf-100d-4fc6-8878-f078cc710fa3" />



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


**Evidenca**
<img width="1210" height="342" alt="image" src="https://github.com/user-attachments/assets/d059248f-85f9-46fd-9f84-8e0466e0cc42" />
<img width="1044" height="311" alt="image" src="https://github.com/user-attachments/assets/b41c8b35-b4e7-4360-97f1-ef0636df5e36" />
<img width="1109" height="308" alt="image" src="https://github.com/user-attachments/assets/2902f8d4-fc85-4673-a2d0-66048778e22f" />
<img width="931" height="138" alt="image" src="https://github.com/user-attachments/assets/b62173d3-bb4e-4d5f-ae11-c2a70f5562e3" />




---

## Çfarë Mbeti

Të gjitha deliverable-t e planifikuara për sprint-in u implementuan me sukses.

- DatabaseRepository skeleton me ndërprerësin e konfigurimit ✓
- Trajtimi i gabimeve nëpër Repository, Service, UI dhe Frontend ✓
- Projekti i testeve me 24 teste kalues që mbulojnë të gjitha rastet e planifikuara ✓

---

## Çfarë Mësova

Gjatë këtij sprint-i mësova se si **Dependency Inversion Principle** e bën kodin vërtet më të lehtë për t'u ndryshuar. Shkrimi i testit të ndërrimit të repository-t e vërtetoi: ndërrova `FileRepository` me `DatabaseRepository` në një rresht, dhe të gjitha testet e `ServiceService` kaluan pa prekur fare kodin e shërbimit. Zgjedhja arkitekturore nga Sprint 1 u shpërbly drejtpërdrejt në Sprint 2.
