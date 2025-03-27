import React, { useState } from "react";

const CostCalculator = () => {

  const [expanded, setExpanded] = useState({});

  const toggleExplanation = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="cost-calculator">
      <h1>Cost Calculation Formulas</h1>

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
    {
      key: "ingredientUpdate",
      formula: "updatedIngredient = { price: validPrice, quantity: validQuantity }",
      explanation:
        "Ensures ingredient prices and quantities are stored correctly after edits."
    },
    {
      key: "preparationPrice",
      formula: "preparationPrice = Σ P_i",
      explanation: "Determines the total cost of ingredients used in meal preparation."
    },
    {
      key: "sellingPrice",
      formula: "sellingPrice = C + (C * markupPercentage / 100)",
      explanation:
        "Determines the final selling price of a meal based on a percentage markup."
    },
    {
      key: "totalMargin",
      formula: "totalMargin = totalSellingPrice - totalPreparationPrice",
      explanation:
        "Displays total profit margin."
    }

].map(({ key, formula, explanation }) => (
  <div
    className="formula-box"
    key={key}
    onClick={() => toggleExplanation(key)}
    style={{
      border: expanded[key] ? "2px solid #f09813" : "2px solid transparent",
      padding: "10px",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "border 0.3s ease-in-out"
    }}
  >
    <h3>{key.replace(/([A-Z])/g, " $1").trim()} Calculation</h3>
    <code>{expanded[key] ? explanation : formula}</code>
  </div>
))}

    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <p>&nbsp;</p>

    </div>
  );
};

export default CostCalculator;
