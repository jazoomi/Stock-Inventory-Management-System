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

    it("should return 400 if required fields are missing", async () => {
        // Missing 'price'
        const incompleteCombo = {
          name: "Incomplete Combo",
          items: "Burger, Fries"
        };
        const res = await request(app)
          .post("/combo")
          .send(incompleteCombo);
   
   
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Enter all fields (name, items, and price)");
      });
    });
   
   
    describe("PUT /combo/:id", () => {
      it("should update an existing combo meal", async () => {
        // create one first
        const createRes = await request(app)
          .post("/combo")
          .send({
            name: "ComboToUpdate",
            items: "Burger, Fries",
            price: 12
          });
        const createdId = createRes.body.id;
   
   
        // update
        const updateData = {
          name: "UpdatedCombo",
          items: "Pizza, Wings",
          price: 20
        };
   
   
        const updateRes = await request(app)
          .put(`/combo/${createdId}`)
          .send(updateData);
   
   
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.message).toContain("combo updated successfully");
        expect(updateRes.body).toMatchObject({
          id: String(createdId),
          ...updateData
        });
      });
    });
   

});

