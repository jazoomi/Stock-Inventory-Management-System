import React from "react";

const CostCalculator = () => {

  const [expanded, setExpanded] = useState({});

  const toggleExplanation = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="cost-calculator">
      <h2>Cost Calculation Formulas</h2>

{[
    {
      key: "originalTotal",
      formula: "originalTotal = Σ P_i",
      explanation:
        "Original Total = Start with 0; for each selected meal, add its selling price to the total (if no price, add 0); the final total is the sum of all prices."
    },
    {
      key: "comboSavings",
      formula: "savings = ((originalTotal - comboPrice) / originalTotal) * 100",
      explanation:
        "Determines the percentage of savings when purchasing a combo meal."
    },
    {
      key: "comboTax",
      formula: "totalCost = originalCost + (originalCost * taxRate)",
      explanation: "Determines the total cost of the combo with tax."
    },
    {
      key: "ingredientCost",
      formula: "totalIngredientCost = P * Q",
      explanation: "Stores ingredient prices and calculates their total cost in a meal."
    },
    











]}
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
        <h3>Combo Tax Calculation</h3>
        <p>Determines the total cost of the combo with tax.</p>
        <code>
          {"total cost = (original cost * tax_value %) + original cost;"}
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

      <div className="formula-box">
        <h3>Preparation Price Calculation</h3>
        <p>Determines the total cost of ingredients used in meal preparation.</p>
        <code>
          {" preparationPrice = sum of selected ingredient prices;"}
        </code>
      </div>

      <div className="formula-box">
        <h3>Selling Price Calculation</h3>
        <p>Determines the final selling price of a meal based on a percentage markup.</p>
        <code>
          {" sellingPrice = total ingredient cost + (total ingredient cost * percentage / 100);"}
        </code>
      </div>

      <div className="formula-box">
        <h3>Total Margin</h3>
        <p>Displays total profit margin.</p>
      <code>
          {" totalMargin = totalSellingPrice - totalPreparationPrice;"}
        </code>
      </div>
    </div>
  );
};

export default CostCalculator;
