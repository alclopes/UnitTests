// 20211104 ok

import "reflect-metadata";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("1-should be able to show statement operation", async () => {
    const createdUser = await createUserUseCase.execute({
      name: "User name",
      email: "user@apifin.com",
      password: "pass",
    });

    const createdStatement = await createStatementUseCase.execute({
      user_id: createdUser?.id as string,
      type: "deposit" as OperationType,
      amount: 100,
      description: "deposit",
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: createdUser?.id as string,
      statement_id: createdStatement?.id as string,
    });

    expect(statementOperation).toEqual(createdStatement);
  });

  it("2-should not be able to show balance with nonexistent user", async () => {
    await expect(async () => {
      const createdUser = await createUserUseCase.execute({
        name: "New User",
        email: "newuser@apifin.com",
        password: "pass",
      });

      const createdStatement = await createStatementUseCase.execute({
        user_id: createdUser?.id as string,
        type: "deposit" as OperationType,
        amount: 100,
        description: "deposit",
      });

      await getStatementOperationUseCase.execute({
        user_id: "New User",
        statement_id: createdStatement?.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("3-should not be able to show balance with nonexistent statement", async () => {
    await expect(async () => {
      const createdUser = await createUserUseCase.execute({
        name: "New Other User",
        email: "newotheruser@apifin.com",
        password: "pass",
      });

      await createStatementUseCase.execute({
        user_id: createdUser?.id as string,
        type: "deposit" as OperationType,
        amount: 100,
        description: "deposit",
      });

      await getStatementOperationUseCase.execute({
        user_id: createdUser?.id as string,
        statement_id: "new-statement",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
