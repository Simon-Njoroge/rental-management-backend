import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { AppDataSource } from "./config/data-source";
import { Logger } from "./utils/logger";
import userRoutes from "./routes/user.routes";
import propertyRoutes from "./routes/property.routes";
import categoryRoutes from "./routes/category.routes";
import amenitiesRoutes from "./routes/amenity.routes";
import locationRoutes from "./routes/location.routes";
import regionRoutes from "./routes/region.routes";
import propertyimageRoutes from "./routes/property-image.routes";
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import reviwRoutes from './routes/review.routes';
import supportticketRoutes from './routes/support-ticket.routes';
import subscriptionplanRoutes from './routes/subscription-plan.routes';
import maintenanceRoutes from './routes/maintenance.routes';
class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: any[], port: number) {
    this.app = express();
    this.port = port;

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL,
      }),
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

     const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minuts
      max: 100, // limit each IP to 100 requests per windowMs
    });

    this.app.use(limiter);

    //routers
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/properties", propertyRoutes);
    this.app.use("/api/categories", categoryRoutes);
    this.app.use("/api/amenities", amenitiesRoutes);
    this.app.use("/api/locations", locationRoutes);
    this.app.use("/api/regions", regionRoutes);
    this.app.use("/api/property-images", propertyimageRoutes);
    this.app.use("/api/bookings", bookingRoutes);
    this.app.use("/api/payments", paymentRoutes);
    this.app.use("/api/reviews", reviwRoutes);
    this.app.use("/api/support-tickets", supportticketRoutes);
    this.app.use("/api/subscription-plans", subscriptionplanRoutes);
    this.app.use("/api/maintenance-requests", maintenanceRoutes);

 
   
  }

  private async initializeDatabase() {
    try {
      await AppDataSource.initialize();
      Logger.info("Database connected successfully");
    } catch (error) {
      Logger.error("Database connection failed", error);
      process.exit(1);
    }
  }

  private initializeControllers(controllers: any[]) {
    controllers.forEach((controller) => {
      this.app.use("/api", controller.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Endpoint not found",
      });
    });

    this.app.use((error: any, req: any, res: any, next: any) => {
      Logger.error(error.stack);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      Logger.info(`Server running on port ${this.port}`);
    });
  }
}

export default App;
