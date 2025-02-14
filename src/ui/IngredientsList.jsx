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

    // Allow empty value for placeholders
    if (value === "") {
      setEditedIngredient({ ...editedIngredient, [name]: "" });
      return;
    }
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

  // Manage new ingredient input fields
  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "", unit: "", price: "" });

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

  // Handle saving an edited ingredient
  const handleSave = (updatedIngredient) => {
    fetch(`http://localhost:5000/raw-ingredients/${updatedIngredient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedIngredient),
    })
    .then(() => {
      fetchIngredients(); // Re-fetch ingredient list
    })
    .catch((err) => console.error("Error updating ingredient:", err));
  };

  // Handle adding a new ingredient
  const handleAddIngredient = () => {
    fetch("http://localhost:5000/raw-ingredients", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newIngredient,
        price: newIngredient.price ? parseFloat(newIngredient.price) : 0, // Convert before sending
        quantity: newIngredient.quantity ? parseFloat(newIngredient.quantity) : 0, 
      }),
    })
    .then(() => {
      fetchIngredients(); // Re-fetch ingredient list after adding
      setNewIngredient({ name: "", quantity: "", unit: "", price: "" }); // Reset input fields
    })
    .catch((err) => console.error("Error adding ingredient:", err));
  };

  return (
    <div className="ingredient-list">
      {ingredients.map((ingredient) => (
        <IngredientCard key={ingredient.id} ingredient={ingredient} onSave={handleSave} onDelete={handleDelete} />
      ))}

      <div className="add-ingredient-form">
        <input 
          type="text" 
          placeholder="Name" 
          value={newIngredient.name} 
          onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} 
        />
        <input 
          type="text" 
          placeholder="Quantity" 
          value={newIngredient.quantity} 
          onChange={(e) => {
            if (/^\d*\.?\d*$/.test(e.target.value)) {
              setNewIngredient({ ...newIngredient, quantity: e.target.value });
            }
          }} 
        />
        <input 
          type="text" 
          placeholder="Unit" 
          value={newIngredient.unit} 
          onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })} 
        />
        <input 
          type="text" 
          placeholder="Price" 
          value={newIngredient.price} 
          onChange={(e) => {
            if (/^\d*\.?\d*$/.test(e.target.value)) {
              setNewIngredient({ ...newIngredient, price: e.target.value });
            }
          }} 
        />
        <button onClick={handleAddIngredient}>Add Ingredient</button>
      </div>
    </div>
  );
};

export default IngredientList;
