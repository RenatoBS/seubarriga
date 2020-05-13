const request = require("supertest");

const app = require("../src/app");

test("Devo listar todos os usuarios", () => {
  return request(app)
    .get("/user")
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("name");
    });
});
