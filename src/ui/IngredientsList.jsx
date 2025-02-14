import React, { useState, useRef, useEffect } from "react";
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
    <div className="ingredient-card" ref={cardRef} onClick={() => !isEditing && setIsEditing(true)}>
      {isEditing ? (
        <>
          <input type="text" name="name" value={editedIngredient.name} onChange={handleChange} autoFocus />
          <div className="ingredient-details">
            <input type="text" name="quantity" value={editedIngredient.quantity} onChange={handleChange} />
            <input type="text" name="unit" value={editedIngredient.unit} onChange={handleChange} />
            <input type="text" name="price" value={editedIngredient.price} onChange={handleChange} />
          </div>
        </>
      ) : (
        <>
          <h3>{ingredient.name}</h3>
          <div className="ingredient-details">
            <p>{ingredient.quantity} {ingredient.unit}</p>
            <p>${Number(ingredient.price).toFixed(2)}</p>
          </div>
        </>
      )}
      <button onClick={() => onDelete(ingredient.id)}>Delete</button>
    </div>
  );
};

// Manages list of ingredients
const IngredientList = () => {
  // Store the list of ingredients
  const [ingredients, setIngredients] = useState([]);

  // Fetch ingredients
  const fetchIngredients = () => {
    fetch("http://localhost:5000/raw-ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error("Error fetching ingredients:", err));
  };

  // Fetch ingredients on mount
  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <div className="ingredient-list">
      {ingredients.map((ingredient) => (
        <IngredientCard key={ingredient.id} ingredient={ingredient} onSave={handleSave} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default IngredientList;
