import * as dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Task } from "./entities/Task";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "todo_db",
  synchronize: true,
  logging: true,
  entities: [User, Task],
  migrations: ["src/migrations/*.ts"],
});
