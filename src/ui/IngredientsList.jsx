import React, { useState, useRef, useEffect } from "react";
import "./IngredientList.css";

// Ingredient card component
const IngredientCard = ({ ingredient, onSave, onDelete }) => {
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  
  // Stores edited data
  const [editedIngredient, setEditedIngredient] = useState({ ...ingredient });

  // Ref to detect clicks outside the component
  const cardRef = useRef(null);

  // Handles input changes and allows decimal values
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow empty value for placeholders
    if (value === "") {
      setEditedIngredient({ ...editedIngredient, [name]: "" });
      return;
    }

    // Ensure price input allows decimals
    if (name === "price") {
      if (/^\d*\.?\d*$/.test(value)) { // Regex to allow only numbers and one decimal point
        setEditedIngredient({ ...editedIngredient, [name]: value });
      }
      return;
    }

    // Ensure quantity input allows numbers
    if (name === "quantity") {
      if (/^\d*\.?\d*$/.test(value)) {
        setEditedIngredient({ ...editedIngredient, [name]: value });
      }
      return;
    }

    setEditedIngredient({ ...editedIngredient, [name]: value });
  };

  // Detect click outside the card and save changes
  const handleClickOutside = (event) => {
    if (cardRef.current && !cardRef.current.contains(event.target)) {
      if (JSON.stringify(ingredient) !== JSON.stringify(editedIngredient)) {
        // Convert price & quantity to float before saving
        onSave({
          ...editedIngredient,
          price: editedIngredient.price ? parseFloat(editedIngredient.price) : 0,
          quantity: editedIngredient.quantity ? parseFloat(editedIngredient.quantity) : 0,
        });
      }
      setIsEditing(false); // Exit edit mode
    }
  };

  // Add/remove click event listener when editing
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => document.addEventListener("click", handleClickOutside), 0);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isEditing, editedIngredient]);

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
    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => {
        setIngredients(data);
        calculateTotalCost(data);
      })
      .catch((err) => console.error("Error fetching ingredients:", err));
  };
  

  // Fetch ingredients on mount
  useEffect(() => {
    fetchIngredients();
  }, []);

  const [totalCost, setTotalCost] = useState(0); // 
  
  const calculateTotalCost = (ingredientList) => {
    const total = ingredientList.reduce((sum, ingredient) => sum + (ingredient.price * ingredient.quantity), 0);
    setTotalCost(total);
  };
  


  // Handle saving an edited ingredient
  const handleSave = (updatedIngredient) => {
    fetch(`http://localhost:3001/raw-ingredients/${updatedIngredient.id}`, {
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
fetch("http://localhost:3001/raw-ingredients", { 
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...newIngredient,
    price: parseFloat(newIngredient.price) || 0,
    quantity: parseFloat(newIngredient.quantity) || 0,
  }),
})
.then((res) => res.json())
.then((addedIngredient) => {
  setIngredients((prevIngredients) => {
    const updatedIngredients = [...prevIngredients, addedIngredient];
    calculateTotalCost(updatedIngredients);
    return updatedIngredients;
  });
})
.catch((err) => console.error("Error adding ingredient:", err));

  };

  // Handle deleting an ingredient
  const handleDelete = (id) => {
    fetch(`http://localhost:3001/raw-ingredients/${id}`, {
      method: "DELETE",
    })
    .then(() => {
      fetchIngredients(); // Re-fetch ingredient list after deletion
    })
    .catch((err) => console.error("Error deleting ingredient:", err));
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

      <h2>Total Cost: ${totalCost.toFixed(2)}</h2>

    </div>
  );
};

export default IngredientList;
