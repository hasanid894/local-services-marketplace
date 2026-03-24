const express = require('express');
const errorHandler = require('./middleware/errorHandler');
 
const app = express();
app.use(express.json());
 
// Routes
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews',  require('./routes/reviewRoutes'));
 
app.use(errorHandler);
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
