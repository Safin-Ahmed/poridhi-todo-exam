import { Request, Response } from "express";
import { JsonController, Body, Post, Req, Res } from "routing-controllers";
import { IsEmail, IsString } from "class-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppDataSource } from "../database/data-source";
import { User } from "../database/entities/User";

class LoginRequest {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

@JsonController("/api")
export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  @Post("/signup")
  async signup(@Body() body: LoginRequest, @Res() res: Response) {
    try {
      // check if the user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: body.email },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }

      const hashedPassword = await bcrypt.hash(body.password, 10);
      const user = this.userRepository.create({
        email: body.email,
        password: hashedPassword,
      });
      await this.userRepository.save(user);
      return { message: "User created successfully" };
    } catch (err) {
      console.log("Error in signup");
      return res.status(500).json({ message: "error" });
    }
  }

  @Post("/login")
  async login(@Body() body: LoginRequest, @Req() req: Request) {
    const user = await this.userRepository.findOneBy({ email: body.email });
    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ id: user.id }, "secretKey", { expiresIn: "1h" });
    return { token };
  }
}
