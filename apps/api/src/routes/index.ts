// apps/api/src/routes/index.ts - ACTUALIZADO CON RUTAS DE PAGOS
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import partnerRoutes from './partner.routes';
import studioRoutes from './studio.routes';
import classRoutes from './class.routes';
import bookingRoutes from './booking.routes';
import adminRoutes from './admin.routes';
import paymentRoutes from './payment.routes'; // NUEVA IMPORTACIÓN

const router: Router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/partners', partnerRoutes);
router.use('/studios', studioRoutes);
router.use('/classes', classRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes); // NUEVA RUTA

// API info
router.get('/', (req, res) => {
  res.json({
    message: 'Tudo API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      partners: '/api/partners',
      studios: '/api/studios',
      classes: '/api/classes',
      bookings: '/api/bookings',
      admin: '/api/admin',
      payments: '/api/payments', // NUEVO ENDPOINT
    },
  });
});

export default router;