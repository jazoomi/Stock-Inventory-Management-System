import React from "react";

const CostCalculator = () => {
  return (
    <div className="cost-calculator">
      <h2>Cost Calculation Formulas</h2>

      <div className="formula-box">
        <h3>Original Total Price Calculation</h3>
        <p>Calculates the total price of selected meals before applying a combo discount.</p>
        <code>
          {" originalTotal = start with 0; for each selected meal, add its selling price to the total (if no price, add 0); the final total is the sum of all prices."}
        </code>
      </div>

      <div className="formula-box">
        <h3>Combo Savings Calculation</h3>
        <p>Determines the percentage of savings when purchasing a combo meal.</p>
        <code>
          {"const savings = ((originalTotal - comboPrice) / originalTotal) * 100;"}
        </code>
      </div>

      <div className="formula-box">
        <h3>Ingredient Price Calculation</h3>
        <p>Stores ingredient prices and calculates their total cost in a meal.</p>
        <code>
          {" totalIngredientCost = ingredient.price * ingredient.quantity;"}
        </code>
      </div>

      <div className="formula-box">
        <h3>Ingredient Update</h3>
        <p>Ensures ingredient prices and quantities are stored correctly after edits.</p>
        <code>
          {" updatedIngredient = { ...ingredient, price: if price is a number, keep it; otherwise set it to 0, quantity: if quantity is a number, keep it; otherwise set it to 0 };"}
        </code>
      </div>
    </div>
  );
};

export default CostCalculator;
