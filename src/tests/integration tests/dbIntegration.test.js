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
});