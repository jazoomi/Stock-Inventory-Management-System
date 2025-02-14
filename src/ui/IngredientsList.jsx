import React, { useState } from "react";
import "./IngredientList.css";

// Ingredient card component
const IngredientCard = ({ ingredient, onSave, onDelete }) => {
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  
  // Stores edited data
  const [editedIngredient, setEditedIngredient] = useState({ ...ingredient });

  // Handles input changes and allows decimal values
  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditedIngredient({ ...editedIngredient, [name]: value });
  };

  return (
    <div className="ingredient-card">
        <>
          <h3>{ingredient.name}</h3>
          <div className="ingredient-details">
            <p>{ingredient.quantity} {ingredient.unit}</p>
            <p>${Number(ingredient.price).toFixed(2)}</p>
          </div>
        </>
      <button onClick={() => onDelete(ingredient.id)}>Delete</button>
    </div>
  );
};