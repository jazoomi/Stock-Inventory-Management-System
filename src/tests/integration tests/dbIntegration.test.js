import request from "supertest";
import app from "../../../backend/app.js";
import db from "../../../backend/database/db.js";

describe("Integration Tests DB", () => {
    let rawIngredientId, assembledMealId, comboId;

    beforeAll((done) => {
        //reset the database before running tests
        db.serialize(() => {
            db.run("DELETE FROM raw_ingredients");
            db.run("DELETE FROM assembled_ingredients");
            db.run("DELETE FROM combo", done);
        });
    });

    afterAll((done) => {
        db.close(() => done()); //close DB connection after tests
    });

    test("add a raw ingredient", async () => {
        const response = await request(app)
            .post("/raw-ingredients")
            .send({ name: "Tomato", quantity: 10, unit: "kg", price: 5.99 })
            .expect(201);

        expect(response.body).toHaveProperty("id");
        rawIngredientId = response.body.id; // Store for later
    });

    test("retrieve raw ingredients", async () => {
        const response = await request(app)
            .get("/raw-ingredients")
            .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
    });

    test("create an assembled meal", async () => {
        const mealPayload = {
            name: "Salad",
            quantity: 1,
            recipe: JSON.stringify({
                ingredients: [{ id: rawIngredientId, name: "Tomato", price: 5.99 }],
                preparationPrice: 5.99,
                percentage: "20"
            }),
            price: 7.19
        };

        const response = await request(app)
            .post("/assembled-ingredients")
            .send(mealPayload)
            .expect(201);

        expect(response.body).toHaveProperty("id");
        assembledMealId = response.body.id;
    });

    test("get assembled meals", async () => {
        const response = await request(app)
            .get("/assembled-ingredients")
            .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
    });

    test("create a combo meal", async () => {
        const comboPayload = {
            name: "Lunch Combo",
            items: JSON.stringify([
                { id: rawIngredientId, name: "Tomato", sellingPrice: 5.99 },
                { id: assembledMealId, name: "Salad", sellingPrice: 7.19 }
            ]),
            price: 12.00
        };

        const response = await request(app)
            .post("/combo")
            .send(comboPayload)
            .expect(201);

        expect(response.body).toHaveProperty("id");
        comboId = response.body.id; 
    });

    test("get saved combos", async () => {
        const response = await request(app)
            .get("/combo")
            .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
    });

    test("delete a combo meal", async () => {
        const response = await request(app)
            .delete(`/combo/${comboId}`)
            .expect(200);

        expect(response.body.message).toContain("deleted successfully");
    });

    test("make sure combo meal is deleted", async () => {
        const response = await request(app)
            .get("/combo")
            .expect(200);

        expect(response.body.some(item => item.id === comboId)).toBe(false);
    });

    test("delete an assembled meal", async () => {
        const response = await request(app)
            .delete(`/assembled-ingredients/${assembledMealId}`)
            .expect(200);

        expect(response.body.message).toContain("deleted successfully");
    });

    test("make sure assembled meal is deleted", async () => {
        const response = await request(app)
            .get("/assembled-ingredients")
            .expect(200);

        expect(response.body.some(item => item.id === assembledMealId)).toBe(false);
    });

    test("delete a raw ingredient", async () => {
        const response = await request(app)
            .delete(`/raw-ingredients/${rawIngredientId}`)
            .expect(200);

        expect(response.body.message).toContain("deleted successfully");
    });

    test("make sure raw ingredient is deleted", async () => {
        const response = await request(app)
            .get("/raw-ingredients")
            .expect(200);

        expect(response.body.some(item => item.id === rawIngredientId)).toBe(false);
    });
});