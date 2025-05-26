// src/config/data-source.ts
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

// First create the DataSource configuration
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "postgres",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "rental_user",
  password: process.env.DB_PASSWORD || "rental_password",
  database: process.env.DB_NAME || "rental_db",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  synchronize: false,
  logging: true,
  migrationsRun: false,
//   cache: {
//   type: "redis",
//   options: {
//     host: process.env.REDIS_HOST!,
//     port: parseInt(process.env.REDIS_PORT || "6379"),
//   },
// },
});

// Then add the retry logic
const maxRetries = 5;
let retries = 0;

const connectWithRetry = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");
  } catch (err) {
    if (retries < maxRetries) {
      retries++;
      console.log(`Database connection failed, retry ${retries}/${maxRetries}`);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.error("Database connection failed after retries:", err);
      process.exit(1);
    }
  }
};

// Export the initialization function
export const initializeDatabase = () => {
  connectWithRetry();
  return AppDataSource;
};
