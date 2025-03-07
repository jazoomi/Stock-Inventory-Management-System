import React, { useState, useRef, useEffect } from "react";
import "./IngredientList.css";
import "./ImportIngredients";
import ImportIngredients from "./ImportIngredients";

const IngredientCard = ({ ingredient, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedIngredient, setEditedIngredient] = useState({ ...ingredient });
  const cardRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setEditedIngredient({ ...editedIngredient, [name]: "" });
      return;
    }
    if (name === "price" || name === "quantity") {
      if (/^\d*\.?\d*$/.test(value)) {
        setEditedIngredient({ ...editedIngredient, [name]: value });
      }
      return;
    }
    setEditedIngredient({ ...editedIngredient, [name]: value });
  };

  const handleClickOutside = (event) => {
    if (cardRef.current && !cardRef.current.contains(event.target)) {
      if (JSON.stringify(ingredient) !== JSON.stringify(editedIngredient)) {
        onSave({
          ...editedIngredient,
          price: parseFloat(editedIngredient.price) || 0,
          quantity: parseFloat(editedIngredient.quantity) || 0,
        });
      }
      setIsEditing(false);
    }
  };

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
              {/* select option for units */}
              <select name="unit" value={editedIngredient.unit} onChange={handleChange}>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="mL">kg</option>
                <option value="L">L</option>
                <option value="slices">kg</option>
                <option value="units">kg</option>
                <option value="cups">kg</option>
                <option value="Oz">kg</option>
            </select>

            {editedIngredient.unit === "other" && (
              <input
                type="text"
                name="unitSpecification"
                placeholder="Specify unit"
                value={editedIngredient.unitSpecification || ""}
                onChange={handleChange}
              />
            )}
          
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

const IngredientList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "", unit: "", price: "" });
  const [totalCost, setTotalCost] = useState(0);

  const fetchIngredients = () => {
    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => {
        setIngredients(data);
        calculateTotalCost(data);
      })
      .catch((err) => console.error("Error fetching ingredients:", err));
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const calculateTotalCost = (ingredientList) => {
    const total = ingredientList.reduce((sum, ingredient) => sum + (ingredient.price * ingredient.quantity), 0);
    setTotalCost(total);
  };

  const handleSave = (updatedIngredient) => {
    fetch(`http://localhost:3001/raw-ingredients/${updatedIngredient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedIngredient),
    })
    .then(() => fetchIngredients())
    .catch((err) => console.error("Error updating ingredient:", err));
  };

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

    setNewIngredient({ name: "", quantity: "", unit: "", price: "" });
  };

  const handleDelete = (id) => {
    setIngredients((prevIngredients) => {
      const updatedIngredients = prevIngredients.filter(ingredient => ingredient.id !== id);
      calculateTotalCost(updatedIngredients);
      return updatedIngredients;
    });

    fetch(`http://localhost:3001/raw-ingredients/${id}`, {
      method: "DELETE",
    })
    .then(() => fetchIngredients())
    .catch((err) => console.error("Error deleting ingredient:", err));
  };

  return (
    <div className="ingredient-list">
      {ingredients.map((ingredient) => (
        <IngredientCard key={ingredient.id} ingredient={ingredient} onSave={handleSave} onDelete={handleDelete} />
      ))}
    
      <div className="add-ingredient-form">
        <input type="text" placeholder="Name" value={newIngredient.name} onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} />
        <input type="text" placeholder="Amount" value={newIngredient.quantity} onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })} />
        {/* Replace the unit input with a dropdown */}
        <select
          name="unit"
          value={newIngredient.unit}
          onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
        >
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="mL">kg</option>
          <option value="L">L</option>
          <option value="slices">kg</option>
          <option value="units">kg</option>
          <option value="cups">kg</option>
          <option value="Oz">kg</option>
          <option value="other">Other - specify</option>
        </select>

        {newIngredient.unit === "other" && (
          <input
            type="text"
            name="unitSpecification"
            placeholder="Specify unit"
            value={newIngredient.unitSpecification || ""}
            onChange={(e) => setNewIngredient({ ...newIngredient, unitSpecification: e.target.value })}
          />
        )}

        <input type="text" placeholder="Price" value={newIngredient.price} onChange={(e) => setNewIngredient({ ...newIngredient, price: e.target.value })} />
        <button onClick={handleAddIngredient}>Add Ingredient</button>
        <p>Or</p>
        <ImportIngredients refreshIngredients={fetchIngredients}/>
      </div>
  
      <div className="total-cost">
        <h2>Total Cost: ${totalCost.toFixed(2)}</h2>
      </div>
    </div>
  );
}  

export default IngredientList;