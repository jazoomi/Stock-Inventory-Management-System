import React, { useState, useRef, useEffect } from "react";
import "./IngredientList.css";
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
    if (name === "price" || name === "quantity" || name === "threshold") {
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
        // Parse values as numbers, not strings
        const savedIngredient = {
          ...editedIngredient,
          price: parseFloat(editedIngredient.price) || 0,
          quantity: parseFloat(editedIngredient.quantity) || 0,
          threshold: parseFloat(editedIngredient.threshold) || 0,
        };
        onSave(savedIngredient);
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

  // Ensure both are parsed as numbers for comparison
  const quantityNum = parseFloat(ingredient.quantity);
  const thresholdNum = parseFloat(ingredient.threshold);
  // Only consider it low if we have valid numbers and quantity is below threshold
  const isLow = !isNaN(quantityNum) && !isNaN(thresholdNum) && quantityNum < thresholdNum;

  return (
    <div
      className={`ingredient-card ${isLow ? 'low-stock' : ''}`}
      ref={cardRef}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <>
          <input type="text" name="name" value={editedIngredient.name} onChange={handleChange} autoFocus />
          <div className="ingredient-details">
            <input type="text" name="quantity" value={editedIngredient.quantity} onChange={handleChange} placeholder="Amount" />
              {/* select option for units */}
              <select name="unit" value={editedIngredient.unit} onChange={handleChange}>
                <option value="">Please Select</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="mL">mL</option>
                <option value="L">L</option>
                <option value="slices">slices</option>
                <option value="units">units</option>
                <option value="cups">cups</option>
                <option value="Oz">Oz</option>
                <option value="other">Other - specify</option>
            </select>

            {editedIngredient.unit === "other" && (
              <input
                type="text"
                name="unitSpecification"
                placeholder="Specify unit"
                value={editedIngredient.unitSpecification}
                onChange={handleChange}
              />
            )}

            <input type="text" name="price" value={editedIngredient.price} onChange={handleChange} placeholder="Price" />
          </div>
          <div className="threshold-container">
            <input type="text" name="threshold" value={editedIngredient.threshold} onChange={handleChange} placeholder="Threshold" />
            <span>Notify when below this amount</span>
          </div>
        </>
      ) : (
        <>
          <h3>{ingredient.name}</h3>
          <div className="ingredient-details">
            <p>{ingredient.quantity} {ingredient.unit}</p>
            <p>${parseFloat(ingredient.price).toFixed(2)}</p>
          </div>
          <div className="threshold-info">
            <p>Threshold: {ingredient.threshold} {ingredient.unit}</p>
            {isLow && <span className="stock-warning">Low Stock!</span>}
          </div>
        </>
      )}
      <button onClick={() => onDelete(ingredient.id)}>Delete</button>
    </div>
  );
};

const IngredientList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
    unit: "",
    price: "",
    threshold: ""
  });
  const [totalCost, setTotalCost] = useState(0);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchIngredients = () => {
    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => {
        // Ensure all numeric fields are actually parsed as numbers
        const processedData = data.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity) || 0,
          threshold: parseFloat(item.threshold) || 0,
          price: parseFloat(item.price) || 0
        }));
        
        setIngredients(processedData);
        calculateTotalCost(processedData);
        checkLowStockItems(processedData);
      })
      .catch((err) => console.error("Error fetching ingredients:", err));
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  // Calculate total cost whenever ingredients change
  useEffect(() => {
    calculateTotalCost(ingredients);
  }, [ingredients]);

  // Check for low stock items whenever ingredients change
  useEffect(() => {
    if (ingredients.length > 0) {
      checkLowStockItems(ingredients);
    }
  }, [ingredients]);

  const calculateTotalCost = (ingredientList) => {
    const total = ingredientList.reduce((sum, ingredient) => {
      // Ensure price and quantity are treated as numbers
      const price = parseFloat(ingredient.price) || 0;
      const quantity = parseFloat(ingredient.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    
    setTotalCost(total);
  };

  const checkLowStockItems = (ingredients) => {
    // Filter for items with quantity below threshold
    const lowItems = ingredients.filter(item => {
      const quantity = parseFloat(item.quantity);
      const threshold = parseFloat(item.threshold);
      // Only return true if both values are valid numbers and quantity is below threshold
      return !isNaN(quantity) && !isNaN(threshold) && threshold > 0 && quantity < threshold;
    });
    
    if (lowItems.length > 0) {
      const itemNames = lowItems.map(item => item.name).join(', ');
      setNotification(`Low stock alert: ${itemNames}`);
    } else {
      setNotification(null);
    }
  };

  const handleSave = (updatedIngredient) => {
    // Update local state immediately for better UX
    setIngredients(prevIngredients =>
      prevIngredients.map(ingredient =>
        ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
      )
    );

    // Then update server
    fetch(`http://localhost:3001/raw-ingredients/${updatedIngredient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedIngredient),
    })
    .catch((err) => console.error("Error updating ingredient:", err));
  };

  const handleAddIngredient = () => {
    const preparedIngredient = {
      ...newIngredient,
      price: parseFloat(newIngredient.price) || 0,
      quantity: parseFloat(newIngredient.quantity) || 0,
      threshold: parseFloat(newIngredient.threshold) || 0,
    };

    fetch("http://localhost:3001/raw-ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preparedIngredient),
    })
    .then((res) => res.json())
    .then((addedIngredient) => {
      // Update the ingredients list with the new ingredient from the server
      setIngredients(prevIngredients => [...prevIngredients, addedIngredient]);
      // The useEffect hook will handle calculating the new total cost
    })
    .catch((err) => console.error("Error adding ingredient:", err));

    setNewIngredient({ name: "", quantity: "", unit: "", price: "", threshold: "" });
  };

  const handleDelete = (id) => {
    // Update local state first for immediate response
    setIngredients(prevIngredients => prevIngredients.filter(ingredient => ingredient.id !== id));
    // The useEffect hook will handle recalculating the total cost

    fetch(`http://localhost:3001/raw-ingredients/${id}`, {
      method: "DELETE",
    })
    .catch((err) => console.error("Error deleting ingredient:", err));
  };

  // Close notification
  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="ingredient-list">
      {notification && (
        <div className="notification">
          <p>{notification}</p>
          <button className="close-btn" onClick={closeNotification}>×</button>
        </div>
      )}
      
      {ingredients.map((ingredient) => (
        <IngredientCard key={ingredient.id} ingredient={ingredient} onSave={handleSave} onDelete={handleDelete} />
      ))}
    
      <div className="add-ingredient-form">
        <input type="text" placeholder="Name" value={newIngredient.name} onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} />
        <input type="text" placeholder="Amount" value={newIngredient.quantity} onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })} />
        {/* Replace the unit input with a dropdown */}
        <select
          name="Unit/Measrument"
          value={newIngredient.unit}
          onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
        >
          <option value="">Please Select</option>
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="mL">mL</option>
          <option value="L">L</option>
          <option value="slices">slices</option>
          <option value="units">units</option>
          <option value="cups">cups</option>
          <option value="Oz">Oz</option>
          <option value="other">Other - specify</option>
        </select>

        {newIngredient.unit === "other" && (
          <input
            type="text"
            name="unitSpecification"
            placeholder="Specify unit"
            value={newIngredient.unitSpecification}
            onChange={(e) => setNewIngredient({ ...newIngredient, unitSpecification: e.target.value })}
          />
        )}
        <input type="text" placeholder="Price" value={newIngredient.price} onChange={(e) => setNewIngredient({ ...newIngredient, price: e.target.value })} />
        <input type="text" placeholder="Threshold" value={newIngredient.threshold} onChange={(e) => setNewIngredient({ ...newIngredient, threshold: e.target.value })} />
        <button onClick={handleAddIngredient}>Add Ingredient</button>
        <p>Or</p>
        <ImportIngredients refreshIngredients={fetchIngredients}/>
      </div>
  
      <div className="total-cost">
        <h2>Total Cost: ${totalCost.toFixed(2)}</h2>
      </div>
    </div>
  );
};

export default IngredientList;