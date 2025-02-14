// server.test.js
import request from "supertest";
import app from "../../backend/app.js";  // Adjust the path if needed


describe("Server Endpoints", () => {


 // ============ RAW INGREDIENTS TESTS ============


 describe("GET /raw-ingredients", () => {
   it("should return a list (array) of raw ingredients", async () => {
     const res = await request(app).get("/raw-ingredients");
     expect(res.statusCode).toBe(200);
     expect(Array.isArray(res.body)).toBe(true);
   });
 });


 describe("POST /raw-ingredients", () => {
   it("should create a new raw ingredient and return 201", async () => {
     const newIngredient = {
       name: "Test Raw Ingredient",
       quantity: 5,
       unit: "kg",
       price: 10
     };


     const res = await request(app)
       .post("/raw-ingredients")
       .send(newIngredient);


     expect(res.statusCode).toBe(201);
     // check response structure
     expect(res.body).toHaveProperty("id");
     expect(res.body).toMatchObject({
       name: newIngredient.name,
       quantity: newIngredient.quantity,
       unit: newIngredient.unit,
       price: newIngredient.price
     });
   });


   it("should return 400 if required fields are missing", async () => {
     // Missing 'price'
     const incompleteIngredient = {
       name: "Incomplete",
       quantity: 10,
       unit: "pcs"
     };


     const res = await request(app)
       .post("/raw-ingredients")
       .send(incompleteIngredient);


     expect(res.statusCode).toBe(400);
     expect(res.body.error).toBe("Enter all fields (name, quantity, unit and price)");
   });
 });
 describe("PUT /raw-ingredients/:id", () => {
    it("should update an existing raw ingredient", async () => {
      // First create an ingredient to update
      const createRes = await request(app)
        .post("/raw-ingredients")
        .send({
          name: "ToUpdate",
          quantity: 1,
          unit: "pc",
          price: 2
        });
      const createdId = createRes.body.id;
 
 
      // Now update
      const updateData = {
        name: "Updated Name",
        quantity: 10,
        unit: "pcs",
        price: 20
      };
 
 
      const updateRes = await request(app)
        .put(`/raw-ingredients/${createdId}`)
        .send(updateData);
 
 
      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.message).toContain("Raw ingredients updated successfully");
      // verify returned data
      expect(updateRes.body).toMatchObject({
        id: String(createdId),
        ...updateData
      });
    });
 
 
    it("should return 404 if the raw ingredient to update is not found", async () => {
      const randomId = 99999; // presumably not existing
      const updateData = {
        name: "NotFoundName",
        quantity: 10,
        unit: "pcs",
        price: 20
      };
 
 
      const res = await request(app)
        .put(`/raw-ingredients/${randomId}`)
        .send(updateData);
 
 
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("did not find raw ingredient with that id");
    });
  });
 
 
  describe("DELETE /raw-ingredients/:id", () => {
    it("should delete an existing raw ingredient", async () => {
      // create one to delete
      const createRes = await request(app)
        .post("/raw-ingredients")
        .send({
          name: "ToDelete",
          quantity: 2,
          unit: "pcs",
          price: 5
        });
      const createdId = createRes.body.id;
 
 
      // now delete
      const deleteRes = await request(app).delete(`/raw-ingredients/${createdId}`);
      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body.message).toBe("Raw ingredient deleted successfully");
    });
 
 
    it("should return 404 if trying to delete a non-existent raw ingredient", async () => {
      const randomId = 99999;
      const res = await request(app).delete(`/raw-ingredients/${randomId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("did not find that raw ingredient.");
    });
  });
 
});
