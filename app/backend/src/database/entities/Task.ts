import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { TaskRequest } from "../../controllers/TaskController";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  category!: string;

  @Column({ default: "Medium" })
  priority!: string;

  @Column({ type: "date", nullable: true })
  deadline!: Date;

  @Column({ default: false })
  completed!: boolean;

  @ManyToOne(() => User, (user: User) => user.tasks)
  user!: User;
}

export const toEntity = (req: TaskRequest) => {
  const entity = new Task();

  entity.title = req.title;
  entity.category = req.category || "";
  entity.priority = req.priority || "Medium";
  entity.deadline = req.date || new Date();
  entity.completed = req.completed || false;

  return entity;
};
