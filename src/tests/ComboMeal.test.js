import request from "supertest";
import app from "../../backend/app.js";


describe("Server Endpoints", () => {

// ============ COMBO TESTS ============


describe("GET /combo", () => {
    it("should return a list of combo meals", async () => {
      const res = await request(app).get("/combo");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
 
 
  describe("POST /combo", () => {
    it("should create a new combo meal", async () => {
      const newCombo = {
        name: "Test Combo",
        items: "Burger, Fries, Soda",
        price: 15
      };
      const res = await request(app)
        .post("/combo")
        .send(newCombo);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toMatchObject({
        name: newCombo.name,
        items: newCombo.items,
        price: newCombo.price
      });
    });
    


});
});
