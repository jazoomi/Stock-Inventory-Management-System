// server.test.js
import request from "supertest";
import app from "../../backend/server.js";  // Adjust the path if needed


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
});
