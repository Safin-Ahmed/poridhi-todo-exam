import {
  JsonController,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Authorized,
  Req,
} from "routing-controllers";
import { IsString, IsBoolean, IsOptional, IsDate } from "class-validator";
import { AppDataSource } from "../database/data-source";
import { Task, toEntity } from "../database/entities/Task";
import { Request } from "express";

export class TaskRequest {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsDate()
  @IsOptional()
  date?: Date;
}

export class TaskUpdateRequest {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsDate()
  @IsOptional()
  date?: Date;
}

@JsonController("/api")
export class TaskController {
  private taskRepository = AppDataSource.getRepository(Task);

  @Post("/tasks")
  @Authorized()
  async createTask(@Req() req: any, @Body() body: TaskRequest) {
    try {
      const entity = toEntity(body);
      if (req.userId) {
        entity.user = req.userId;
      }
      const task = await this.taskRepository.save(entity);
      return task;
    } catch (err) {
      console.error("Error in task controller: ", { err });
    }
  }

  @Get("/tasks")
  @Authorized()
  async getTasks(@Req() req: any) {
    return this.taskRepository.find({ where: { user: { id: req.userId } } });
  }

  @Put("/tasks/:id")
  @Authorized()
  async updateTask(@Param("id") id: number, @Body() body: TaskUpdateRequest) {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) throw new Error("Task not found");

    Object.assign(task, body);
    await this.taskRepository.save(task);
    return task;
  }

  @Delete("/tasks/:id")
  @Authorized()
  async deleteTask(@Param("id") id: number) {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) throw new Error("Task not found");

    await this.taskRepository.remove(task);
    return { message: "Task deleted successfully" };
  }
}
