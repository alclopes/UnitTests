// 20211104 ok

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("01-should be able to authenticate user", async () => {
    await createUserUseCase.execute({
      name: "User Name 01",
      email: "username@apifin.com",
      password: "pass",
    });

    const sessionCreated = await authenticateUserUseCase.execute({
      email: "username@apifin.com",
      password: "pass",
    });

    expect(sessionCreated).toHaveProperty("token");
  });

  it("02-should not be able to authenticate if nonexistent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "nonexistent@apifin.com",
        password: "pass",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("03-should not be able to authenticate with incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Name 02",
        email: "passwordIncorrect@apifin.com",
        password: "pass",
      });

      await authenticateUserUseCase.execute({
        email: "passwordIncorrect@apifin.com",
        password: "incorrect",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
