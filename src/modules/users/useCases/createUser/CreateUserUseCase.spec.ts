// 20211104 Ok

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("01-should be able to create a new user", async () => {
    const user = {
      name: "User Name 01",
      email: "username01@apifin.com",
      password: "pass",
    };

    const userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    expect(userCreated).toHaveProperty("id");
  });

  it("02-should not be able to create if exists a same email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Name 02",
        email: "username02@apifin.com",
        password: "pass",
      });

      await createUserUseCase.execute({
        name: "User Name 02 Again",
        email: "username02@apifin.com",
        password: "pass",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
