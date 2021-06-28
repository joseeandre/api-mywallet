import supertest from 'supertest';
import pg from 'pg';
import server from '../src/server';
import connection from '../src/database/database';

const { Pool } = pg;


const testUser = {
  name: "teste",
  email: "teste3@teste.com",
  password: "123456"
}

describe("POST /sign-up", () => {
  it("returns 201 for valid params", async () => {
    const body = {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password
    };
    const registerUser = await supertest(server).post("/sign-up").send(body);
    expect(registerUser.status).toEqual(201);
  });

  it("returns 409 for duplicated email", async () => {
    const body = {
      name: testUser.name,
      email: "teste4@testando.com",
      password: testUser.password
    };
    const firstRegisterUser = await supertest(server).post("/sign-up").send(body);
    expect(firstRegisterUser.status).toEqual(201);
    const secondRegisterUser = await supertest(server).post("/sign-up").send(body);
    expect(secondRegisterUser.status).toEqual(409);
  });
});
beforeEach(async () => {
  await connection.query('DELETE FROM users');
});

afterAll(() => {
  connection.end();
});
