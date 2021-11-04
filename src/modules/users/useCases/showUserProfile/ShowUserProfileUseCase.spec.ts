// 20211104 ok

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("01-should be able to show user profile", async () => {
    const user = {
      name: "User Profile",
      email: "user@apifin.com",
      password: "pass",
    };

    const createdUser = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const id = createdUser?.id || "";

    const userData = await showUserProfileUseCase.execute(id);

    expect(userData).toHaveProperty("name");
    expect(userData).toHaveProperty("email");
  });

  it("02-should not be show profile if nonexistent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("new-id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
