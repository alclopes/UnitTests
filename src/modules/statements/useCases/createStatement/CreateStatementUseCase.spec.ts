// 20211104 ok

import "reflect-metadata";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });
  //01
  it("01-should be able to do deposit statement", async () => {
    const createdUser = await createUserUseCase.execute({
      name: "UserName",
      email: "statement@apifin.com",
      password: "pass",
    });

    const statementeCreated = await createStatementUseCase.execute({
      user_id: createdUser?.id as string,
      type: "deposit" as OperationType,
      amount: 100,
      description: "deposit",
    });

    expect(statementeCreated).toEqual(
      expect.objectContaining({
        user_id: createdUser?.id as string,
        type: "deposit",
        amount: 100,
        description: "deposit",
      })
    );
  });
  //02
  it("02-should be able to do withdraw statement", async () => {
    const createdUser = await createUserUseCase.execute({
      name: "UserName",
      email: "statement@apifin.com",
      password: "pass",
    });

    await createStatementUseCase.execute({
      user_id: createdUser?.id as string,
      type: "deposit" as OperationType,
      amount: 100,
      description: "deposit",
    });

    const statementeCreated = await createStatementUseCase.execute({
      user_id: createdUser?.id as string,
      type: "withdraw" as OperationType,
      amount: 50,
      description: "withdraw",
    });

    expect(statementeCreated).toEqual(
      expect.objectContaining({
        user_id: createdUser?.id as string,
        type: "withdraw" as OperationType,
        amount: 50,
        description: "withdraw",
      })
    );
  });

  //03
  it("03-Should not be able to do a statement with nonexistent user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "new-user-id",
        type: "deposit" as OperationType,
        amount: 50,
        description: "deposit",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  //04
  it("04-Should not be able to do a withdraw with insufficient fund", async () => {
    expect(async () => {
      const createdUser = await createUserUseCase.execute({
        name: "UserName",
        email: "statement@apifin.com",
        password: "pass",
      });

      await createStatementUseCase.execute({
        user_id: createdUser?.id as string,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "withdraw",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
