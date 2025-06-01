// src/services/metrics.service.ts - NUEVO SERVICIO
import { prisma } from '../prisma/client';
import { CronJob } from 'cron';

export class MetricsService {
  private static job: CronJob | null = null;

  /**
   * Actualiza las métricas diarias del sistema
   * Se ejecuta automáticamente cada día a medianoche
   */
  static async updateDailyMetrics(date?: Date): Promise<void> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    console.log(`📊 Updating metrics for ${targetDate.toISOString().split('T')[0]}`);

    try {
      const [
        totalUsers,
        totalPartners,
        totalStudios,
        dailyBookings,
        dailyRevenue,
        activeUsers,
      ] = await Promise.all([
        // Total usuarios
        prisma.user.count({
          where: { role: 'CLIENT' },
        }),
        
        // Total partners
        prisma.partner.count(),
        
        // Total studios activos
        prisma.studio.count({
          where: { isActive: true },
        }),
        
        // Bookings del día
        prisma.booking.count({
          where: {
            createdAt: {
              gte: targetDate,
              lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        }),
        
        // Revenue del día
        prisma.booking.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: {
              gte: targetDate,
              lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          _sum: {
            amountPaid: true,
          },
        }),
        
        // Usuarios activos (con bookings en los últimos 30 días)
        prisma.user.count({
          where: {
            role: 'CLIENT',
            bookings: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        }),
      ]);

      // Insertar o actualizar métricas
      await prisma.systemMetrics.upsert({
        where: { date: targetDate },
        create: {
          date: targetDate,
          totalUsers,
          totalPartners,
          totalStudios,
          totalBookings: dailyBookings,
          totalRevenue: dailyRevenue._sum.amountPaid ?? 0,
          activeUsers,
        },
        update: {
          totalUsers,
          totalPartners,
          totalStudios,
          totalBookings: dailyBookings,
          totalRevenue: dailyRevenue._sum.amountPaid ?? 0,
          activeUsers,
        },
      });

      console.log(`✅ Metrics updated successfully for ${targetDate.toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('❌ Failed to update metrics:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas históricas
   */
  static async getHistoricalMetrics(startDate: Date, endDate: Date) {
    return await prisma.systemMetrics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Inicializa métricas históricas para los últimos 30 días
   * Útil para primera configuración
   */
  static async initializeHistoricalMetrics(): Promise<void> {
    console.log('📊 Initializing historical metrics...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Crear métricas para cada día de los últimos 30 días
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      await this.updateDailyMetrics(new Date(date));
    }

    console.log('✅ Historical metrics initialized');
  }

  /**
   * Inicia el cron job para actualización automática de métricas
   */
  static startMetricsCron(): void {
    // Si ya hay un job corriendo, lo detenemos
    if (this.job) {
      this.job.stop();
    }

    // Cron job que se ejecuta todos los días a las 00:30
    this.job = new CronJob(
      '30 0 * * *', // Cada día a las 00:30
      async () => {
        try {
          await this.updateDailyMetrics();
        } catch (error) {
          console.error('❌ Metrics cron job failed:', error);
        }
      },
      null,
      true, // Start immediately
      'America/New_York' // Timezone
    );

    console.log('📊 Metrics cron job started - runs daily at 00:30');
  }

  /**
   * Detiene el cron job
   */
  static stopMetricsCron(): void {
    if (this.job) {
      this.job.stop();
      this.job = null;
      console.log('📊 Metrics cron job stopped');
    }
  }

  /**
   * Fuerza una actualización manual de métricas
   */
  static async forceUpdateMetrics(): Promise<void> {
    console.log('📊 Force updating metrics...');
    await this.updateDailyMetrics();
  }
}
