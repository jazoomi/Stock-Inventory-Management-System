import request from "supertest";
import app from "../../backend/app.js";


describe("Server Endpoints", () => {


 // ============ ASSEMBLED INGREDIENTS TESTS ============


 describe("GET /assembled-ingredients", () => {
    it("should return a list of assembled ingredients", async () => {
      const res = await request(app).get("/assembled-ingredients");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
 
 
  describe("POST /assembled-ingredients", () => {
    it("should create a new assembled ingredient", async () => {
      const newAssembled = {
        name: "Test Assembled",
        quantity: 10,
        recipe: "Mix everything",
        price: 25
      };
 
 
      const res = await request(app)
        .post("/assembled-ingredients")
        .send(newAssembled);
 
 
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toMatchObject({
        name: newAssembled.name,
        quantity: newAssembled.quantity,
        recipe: newAssembled.recipe,
        price: newAssembled.price
      });
    });


    it("should return 400 if required fields are missing", async () => {
      // Missing 'recipe'
      const incompleteAssembled = {
        name: "Incomplete",
        quantity: 2,
        price: 10
      };
      const res = await request(app)
        .post("/assembled-ingredients")
        .send(incompleteAssembled);
 
 
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Enter all fields (name, quantity, recipe and price)");
    });
  });
 
 
  describe("PUT /assembled-ingredients/:id", () => {
    it("should update an existing assembled ingredient", async () => {
      // first create one
      const createRes = await request(app)
        .post("/assembled-ingredients")
        .send({
          name: "AssembledToUpdate",
          quantity: 3,
          recipe: "recipe text",
          price: 50
        });
      const createdId = createRes.body.id;
 
 
      // now update
      const updateData = {
        name: "UpdatedAssembled",
        quantity: 5,
        recipe: "new recipe",
        price: 70
      };
 
 
      const updateRes = await request(app)
        .put(`/assembled-ingredients/${createdId}`)
        .send(updateData);
 
 
      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.message).toContain("assembled ingredients updated successfully");
      expect(updateRes.body).toMatchObject({
        id: String(createdId),
        ...updateData
      });
    });
 
 
    it("should return 404 if assembled ingredient to update is not found", async () => {
      const randomId = 99999;
      const updateData = {
        name: "nope",
        quantity: 1,
        recipe: "none",
        price: 10
      };
 
 
      const res = await request(app)
        .put(`/assembled-ingredients/${randomId}`)
        .send(updateData);
 
 
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("did not find assembled ingredient with that id");
    });
  });

  describe("DELETE /assembled-ingredients/:id", () => {
    it("should delete an existing assembled ingredient", async () => {
      const createRes = await request(app)
        .post("/assembled-ingredients")
        .send({
          name: "ToDeleteAssembled",
          quantity: 2,
          recipe: "recipe text",
          price: 10
        });
      const createdId = createRes.body.id;
 
 
      const deleteRes = await request(app)
        .delete(`/assembled-ingredients/${createdId}`);
      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body.message).toBe("assembled ingredient deleted successfully");
    });
 
 
    it("should return 404 if assembled ingredient does not exist", async () => {
      const randomId = 99999;
      const res = await request(app).delete(`/assembled-ingredients/${randomId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("did not find that asssembled ingredient.");
    });
  });
 
});
