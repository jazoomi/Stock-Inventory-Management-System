import request from "supertest";
import app from "../../../backend/app.js";


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
    describe("DELETE /combo/:id", () => {
        it("should delete an existing combo meal", async () => {
          const createRes = await request(app)
            .post("/combo")
            .send({
              name: "ComboToDelete",
              items: "Hotdog, Soda",
              price: 7
            });
          const createdId = createRes.body.id;
     
     
          const deleteRes = await request(app).delete(`/combo/${createdId}`);
          expect(deleteRes.statusCode).toBe(200);
          expect(deleteRes.body.message).toBe("combo deleted successfully");
        });
     
     
        it("should return 404 if combo meal does not exist", async () => {
          const randomId = 99999;
          const res = await request(app).delete(`/combo/${randomId}`);
          expect(res.statusCode).toBe(404);
          expect(res.body.message).toBe("did not find that combo.");
        });
    });

    describe("POST /combo", () => {
      it("should correctly calculate total price with tax", async () => {
        const newCombo = {
          name: "Test Combo with Tax",
          items: "Burger, Fries, Soda",
          price: 15,
          tax: 10 // 10% tax
        };
        
        const expectedPriceAfterTax = 15 + (15 * 0.10);
  
        const res = await request(app)
          .post("/combo")
          .send(newCombo);
  
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(parseFloat(res.body.price)).toBeCloseTo(expectedPriceAfterTax, 2);
      });
    });
    
    describe("GET /combo", () => {
      it("should return a combo meal with correct price after tax", async () => {
        const newCombo = {
          name: "Saved Combo with Tax",
          items: "Pizza, Wings",
          price: 20,
          tax: 15 // 15% tax
        };
        
        const createRes = await request(app)
          .post("/combo")
          .send(newCombo);
        
        const createdId = createRes.body.id;
        const expectedPriceAfterTax = 20 + (20 * 0.15);
        
        const getRes = await request(app).get("/combo");
        expect(getRes.statusCode).toBe(200);
        
        const savedCombo = getRes.body.find(combo => combo.id === createdId);
        expect(savedCombo).toBeDefined();
        expect(parseFloat(savedCombo.price)).toBeCloseTo(expectedPriceAfterTax, 2);
      });
    });
     
});
     

