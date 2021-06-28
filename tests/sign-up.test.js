import supertest from 'supertest';
import bcrypt from 'bcrypt'
import pg from 'pg';

const { Pool } = pg;

const user = "postgres";
const password = "123456";
const host = 'localhost';
const port_database = 5432;
const database = 'mywallet';
const app = "https://mywallet-back.herokuapp.com"

const connection = new Pool({
  user,
  password,
  host,
  port_database,
  database
});

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
    const registerUser = await supertest(app).post("/sign-up").send(body);
    expect(registerUser.status).toEqual(201);
  });

  it("returns 409 for duplicated email", async () => {
    const body = {
      name: testUser.name,
      email: "teste4@testando.com",
      password: testUser.password
    };
    const firstRegisterUser = await supertest(app).post("/sign-up").send(body);
    expect(firstRegisterUser.status).toEqual(201);
    const secondRegisterUser = await supertest(app).post("/sign-up").send(body);
    expect(secondRegisterUser.status).toEqual(409);
  });
});
beforeEach(async () => {
  await connection.query('DELETE FROM users');
});

afterAll(() => {
  connection.end();
});
