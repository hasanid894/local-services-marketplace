# UML Class Diagram – Local Services Marketplace
## 1. Përmbledhje

Sistemi ndjek një arkitekturë me shtresa që përfshin:

- Routes (Rrugët e API)
- Middleware (Ndërmjetës)
- Controllers (Kontrollues)
- Services (Shërbime)
- Repository (Layer i Ruajtjes së të Dhënave)
- Models (Modelet e Entiteteve)

Ky dizajn siguron ndarjen e përgjegjësive dhe mundësi të lehta për të integruar bazën e të dhënave në të ardhmen.


---

## 2. Request Flow (Architectural Context)


Client → Routes → Middleware → Controllers → Services → Repository → File Storage


---

## 3. Shtresa Middleware

### AuthMiddleware

authenticate(req, res, next)

Qellimi:
- Verifikon token-at e autentikimit (p.sh. JWT)
- Mbron endpoint-et e sigurta

---

### ErrorHandlerMiddleware

handleError(err, req, res, next)

Qellimi:
- Menaxhon gabimet qendrore
- Parandalon rrëzimin e sistemit

---

## 4. Shtresa Controller

### UserController

-getUsers(req, res)

-getUser(req, res)

-createUser(req, res)

-updateUser(req, res)

-deleteUser(req, res)

---

### ServiceController

-getServices(req, res)

-getService(req, res)

-createService(req, res)

-updateService(req, res)

-deleteService(req, res)

---

### BookingController

-getBookings(req, res)

-createBooking(req, res)

-updateBooking(req, res)

-deleteBooking(req, res)

---

### ReviewController

-getReviews(req, res)

-createReview(req, res)

-deleteReview(req, res)

---

### AuthController

-register(req, res)

-login(req, res)

---

## 5. Shtresa e Sherbimeve - services (Business Logic)

### UserService

-repository: IRepository

-getAllUsers()

-getUserById(id)

-getUserByEmail(email)

-createUser(data)

-updateUser(id, data)

-deleteUser(id)

---

### ServiceService
- repository: IRepository

+ getAllServices()
  
+ getServiceById(id)
  
+ getServicesByProvider(providerId)
  
+ getServicesByCategory(category)
  
+ getServicesByLocation(location)
+ 
+ createService(data)
  
+ updateService(id, data)
  
+ deleteService(id)


---

### BookingService

-repository: IRepository

+ getAllBookings()
  
+ getBookingById(id)
  
+ getBookingsByUser(userId)
  
+ getBookingsByProvider(providerId)
  
+ createBooking(data)
  
+ updateStatus(id, status)
  
+ deleteBooking(id)


---

### ReviewService

-repository: IRepository

+ getAllReviews()
  
+ getReviewById(id)
  
+ getReviewsByProvider(providerId)
  
+ getAverageRating(providerId)
  
+ createReview(data)
  
+ deleteReview(id)

---

### AuthService

-userRepository: IRepository

-register(data)

-login(credentials)

-hashPassword(password)

-verifyPassword(password, hash)

---

### NotificationService

-sendNotification(userId, message)

---

## 6. Shtresa Repository

### IRepository (Interface)

-getAll()

-getById(id)

-add(entity)

-update(id, data)

-delete(id)

-save()

---

### FileRepository (Current Implementation)

FileRepository implements IRepository

-filePath: string

-data: array

-getAll()

-getById(id)

-add(entity)

-update(id, data)

-delete(id)

-save()

---

### DatabaseRepository(E planifikuar)

DatabaseRepository implements IRepository

-connection: DatabaseConnection

-getAll()

-getById(id)

-add(entity)

-update(id, data)

-delete(id)

-save()

---

## 7. Model Layer

### User

-id: number

-name: string

-email: string

-passwordHash: string

-role: string

-location: string

-createdAt: string

-toCSV()

-fromCSV()

---

### Service

-id: number

-providerId: number

-title: string

-description: string

-category: string

-price: number

-location: string

-createdAt: string

-toCSV()

-fromCSV()

---

### Booking

-id: number

-userId: number

-serviceId: number

-providerId: number

-scheduledDate: string

-status: string

-createdAt: string

-toCSV()

-fromCSV()

---

### Review

-id: number

-userId: number

-providerId: number

-bookingId: number

-rating: number

-comment: string

-createdAt: string

-toCSV()

-fromCSV()

---

## 8. Shtresa Routes

Shembuj:


userRoutes

-GET /users

-GET /users/:id

-POST /users

-PUT /users/:id

-DELETE /users/:id

serviceRoutes

-GET /services

-POST /services

-PUT /services/:id

-DELETE /services/:id

(E njejta strukture aplikohet per  bookingRoutes, reviewRoutes, authRoutes)

---

## 9. Relationships(Marrëdhëniet)

### Marrëdhëniet nga varësia (Dependency)

- Controllers → Services
  
- Services → IRepository
  
- Middleware → Controllers (indirectly through request pipeline)
  
- Routes → Controllers

---

### Implementim

- FileRepository → IRepository (implementimi aktual)
- DatabaseRepository → IRepository (implementimi i planifikuar)

---

### Marrëdhëniet e Entiteteve

- User → Booking (1:N)
- User → Review (1:N)
- Service → Booking (1:N)
- Booking → Review (0..1)
- Provider (User) → Service (1:N)

---

## 10. Justifikimi i Dizajnit

Sistemi demonstron:

- Lidhje të dobëta (loose coupling) përmes interfaces
- Kohezion të lartë brenda shtresave
- Mundësi shkallëzimi përmes abstraksionit të repository
- Siguri përmes middleware
- Zgjerueshmëri për integrim me databazë në të ardhshmen

---

## 11. Përgatitja për Bazën e të Dhënave

Kjo arkitekturë siguron që:

- Kontrollerët dhe shërbimet nuk ndryshojnë
- Vetëm repository duhet të zëvendësohet me DatabaseRepository
- Kalimi në SQL mund të bëhet pa ndërprerje


---

## 12.Konkluzion

Arkitektura është modulare, e shkallëzueshme dhe e ndarë në shtresa. Aktualisht përdor ruajtje në file CSV, por është e gatshme për integrim të bazës së të dhënave.
