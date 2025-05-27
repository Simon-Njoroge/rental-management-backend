import "reflect-metadata";
import dotenv from "dotenv";
import App from "./app";
// import AuthController from './controllers/auth.controller';
import { Logger } from "./utils/logger";

dotenv.config();

(async () => {
  try {
    const app = new App(
      [
        // new AuthController(),
      ],
      parseInt(process.env.PORT || "3000"),
    );
    app.listen();
  } catch (error) {
    Logger.error("Failed to start server", error);
    process.exit(1);
  }
})();
