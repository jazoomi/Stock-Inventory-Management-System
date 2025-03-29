import React from "react";
import "./styles/IngredientSummaryCard.css";

const IngredientSummaryCard = ({ ingredient, isSelected, onClick }) => {
  const quantity = parseFloat(ingredient.quantity);
  const threshold = parseFloat(ingredient.threshold);
  const isLow = !isNaN(quantity) && !isNaN(threshold) && quantity < threshold;

  return (
    <div
      className={`ingredient-summary-card ${isLow ? "low-stock" : ""} ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <h4>{ingredient.name}</h4>
      <p>{ingredient.quantity} {ingredient.unit}</p>
    </div>
  );
};

export default IngredientSummaryCard;
