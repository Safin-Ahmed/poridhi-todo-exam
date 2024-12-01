import { AppDataSource } from "./database/data-source";
import swaggerUi from "swagger-ui-express";
import "reflect-metadata";
import cors from "cors";
import express from "express";
import {
  createExpressServer,
  getMetadataArgsStorage,
} from "routing-controllers";
import { UserController } from "./controllers/UserController";
import { TaskController } from "./controllers/TaskController";
import { routingControllersToSpec } from "routing-controllers-openapi";
import authMiddleware from "./middlewares/auth";

interface AuthRequestBody {
  email: string;
  password: string;
}

const app = createExpressServer({
  controllers: [UserController, TaskController],
  authorizationChecker: authMiddleware,
  cors: true,
});

// Enable CORS
// app.use(cors());

// Generate swagger documentation
const swaggerSpec = routingControllersToSpec(
  getMetadataArgsStorage(),
  {
    controllers: [UserController, TaskController],
  },
  {
    info: {
      title: "To-Do App API",
      version: "1.0.0",
    },
  }
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 4000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.error("Database connection failed:", error));

// app.post("/api/signup", async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   const userRepository = AppDataSource.getRepository(User);

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = userRepository.create({ email, password: hashedPassword });
//     await userRepository.save(user);
//     res.status(201).json({ message: "User created successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create user" });
//   }
// });

// app.post(
//   "/api/login",
//   async (
//     req: Request<{}, {}, { email: string; password: string }>,
//     res: Response
//   ): Promise<any> => {
//     const { email, password } = req.body;
//     const userRepository = AppDataSource.getRepository(User);

//     try {
//       const user = await userRepository.findOneBy({ email });
//       if (!user || !(await bcrypt.compare(password, user.password))) {
//         return res.status(401).json({ error: "Invalid credentials" });
//       }
//       const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "", {
//         expiresIn: "1h",
//       });
//       return res.status(200).json({ token });
//     } catch (error) {
//       return res.status(500).json({ error: "Login failed" });
//     }
//   }
// );

// app.post("/api/tasks", authMiddleware, async (req, res): Promise<any> => {
//   const { title, category, priority, deadline, userId } = req.body;
//   const taskRepository = AppDataSource.getRepository(Task);

//   try {
//     const task = taskRepository.create({
//       title,
//       category,
//       priority,
//       deadline,
//       user: { id: userId },
//     });
//     await taskRepository.save(task);
//     res.status(201).json(task);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create task" });
//   }
// });

// app.get("/api/tasks", authMiddleware, async (req, res) => {
//   const taskRepository = AppDataSource.getRepository(Task);

//   try {
//     const tasks = await taskRepository.find({
//       relations: ["user"],
//     });
//     res.json(tasks);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch tasks" });
//   }
// });

// // Update a task
// app.put(
//   "/api/tasks/:id",
//   authMiddleware,
//   async (req: Request<{ id: string }>, res: Response): Promise<any> => {
//     const { id } = req.params;
//     const { title, category, priority, deadline, completed } = req.body;
//     const taskRepository = AppDataSource.getRepository(Task);

//     try {
//       const task = await taskRepository.findOne({
//         where: { id: parseInt(id), user: { id: req.userId } },
//       });

//       if (!task) {
//         return res.status(404).json({ error: "Task not found" });
//       }

//       task.title = title || task.title;
//       task.category = category || task.category;
//       task.priority = priority || task.priority;
//       task.deadline = deadline || task.deadline;
//       task.completed = completed !== undefined ? completed : task.completed;

//       await taskRepository.save(task);
//       return res.json(task);
//     } catch (error) {
//       console.error("Error updating task:", error);
//       return res.status(500).json({ error: "Failed to update task" });
//     }
//   }
// );

// // Delete a task
// app.delete(
//   "/api/tasks/:id",
//   authMiddleware,
//   async (req: Request<{ id: string }>, res: Response): Promise<any> => {
//     const { id } = req.params;
//     const taskRepository = AppDataSource.getRepository(Task);

//     try {
//       const task = await taskRepository.findOne({
//         where: { id: parseInt(id), user: { id: req.userId } },
//       });

//       if (!task) {
//         return res.status(404).json({ error: "Task not found" });
//       }

//       await taskRepository.remove(task);
//       return res.status(200).json({ message: "Task deleted successfully" });
//     } catch (error) {
//       console.error("Error deleting task:", error);
//       return res.status(500).json({ error: "Failed to delete task" });
//     }
//   }
// );
