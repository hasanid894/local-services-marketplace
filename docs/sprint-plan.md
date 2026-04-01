# Sprint 2 Plan — Devlete Hasani  
Data: 1 Prill 2026  

## Gjendja Aktuale  

### Çka funksionon tani?  
- CRUD i plotë për Services (create, read, update, delete) duke përdorur CSV si storage (Repository → Service → API/UI)  
- FileRepository implementon metodat: getAll(), getById(), add(), save(), update(), delete()  
- Ekzistojnë të dhëna fillestare në backend/data/csv/services.csv  
- Logjika e biznesit për services: listim, filtrimi sipas kritereve, shtim me validim (titulli jo bosh, çmimi > 0), kërkim sipas ID  
- UI në console për menaxhimin e services (listim, filtrim, shtim, kërkim, përditësim, fshirje)  
- API endpoints funksionale për services:  
  - GET /api/services  
  - GET /api/services/:id  
  - POST /api/services  
  - PUT /api/services/:id  
  - DELETE /api/services/:id  
- Frontend (React) i lidhur me backend: listim, filtrim, find-by-id, shtim, editim dhe fshirje të services  
- Implementim bazik i role-based access (demo):  
  - customer: vetëm lexim  
  - provider/admin: create/update/delete  
  - provider: i kufizuar vetëm në shërbimet e veta  
- Routes dhe controllers për bookings dhe reviews ekzistojnë dhe nuk crashojnë serverin  

### Çka nuk funksionon?  
- Autentikimi është vetëm demo (header-based), pa login real dhe pa JWT → rolet nuk janë të sigurta dhe nuk persistojnë  
- Parsing i CSV është i thjeshtë (ndarje me presje), që mund të dështojë në raste kur fushat përmbajnë presje  
- Nuk ka teste të automatizuara (vetëm testim manual përmes UI dhe API)  
- Frontend varet nga backend (nëse backend nuk startohet, UI nuk shfaq të dhëna)  
- Booking dhe Review nuk janë të integruara plotësisht në frontend (mungon flow i plotë për user-in)  
- Nuk ekziston verifikim real i profileve të provider-ave  

### A kompajlohet dhe ekzekutohet programi?  
Po. Backend starton në portin 5000 dhe frontend në portin 3000 pa errore kritike.  

---

## Plani i Sprintit  

### Feature e Re (çka do të ndërtosh)  
**Implementimi i një shtrese të gatshme për databazë (DatabaseRepository)**  

**Përshkrimi:**  
Do të krijohet një implementim i ri i repository që mundëson përdorimin e një databaze (PostgreSQL në të ardhmen), pa ndryshuar logjikën ekzistuese të sistemit.  

**Si e përdor useri:**  
Në këtë fazë nuk ka ndryshim në UI. Ndryshimi është në backend: sistemi do të jetë i konfigurueshëm për të përdorur CSV ose databazë.  

**Deliverables konkrete:**  
- Krijimi i DatabaseRepository që implementon interface IRepository  
- Shtimi i një konfigurimi (p.sh. USE_DB=true/false) për zgjedhjen e repository  
- Injektimi i repository në services pa ndryshuar controllers (respektim i DIP dhe OCP)  
- Testim i funksionimit me FileRepository dhe version stub të DatabaseRepository  

**Arsyetim teknik:**  
Kjo zgjidhje mundëson migrim të lehtë drejt PostgreSQL pa refaktorizim të shtresave të tjera, duke ruajtur modularitetin dhe shkëputjen e komponentëve.  

---

### Error Handling (çka do të shtosh)  

**Pjesët që mund të dështojnë aktualisht:**  
- Leximi dhe parsing i file CSV  
- Kërkesat API nga frontend (network errors, backend offline)  
- Operacionet me ID (find/update/delete me ID jo valide ose jo ekzistuese)  

**Rastet konkrete dhe zgjidhjet:**  

- **Rasti 1: CSV i formatuar gabim**  
  - Rreshtat invalid do të injorohen gjatë leximit  
  - Do të logohen gabimet në server pa ndalur ekzekutimin  

- **Rasti 2: Dështimi i kërkesave nga frontend**  
  - Do të kapen error-et në fetch/axios  
  - UI do të shfaqë mesazhe të qarta (“Backend offline” ose “Request failed”)  

- **Rasti 3: ID jo valide ose jo ekzistuese**  
  - Backend do të kthejë përgjigje standarde 404 me mesazh  
  - Frontend do të trajtojë gabimin dhe do të informojë user-in pa dështim silent  

---

### Teste (çka do të testosh)  

**Metodat që do të testohen:**  
- FileRepository: getAll(), getById(), add(), update(), delete()  
- ServiceService.add() (validimet e input-it)  
- Ndërrimi i repository (FileRepository vs DatabaseRepository stub)  

**Raste kufitare (edge cases):**  
- Shtimi i service me titull bosh ose çmim ≤ 0 (duhet të refuzohet)  
- Filtrim me dallime në shkronja të mëdha/vogla (case-insensitive search)  
- Update/Delete me ID që nuk ekziston  
- Konfigurim i gabuar i repository (USE_DB=true pa lidhje databaze) → duhet të dështojë në startup me mesazh të qartë  

--- 
