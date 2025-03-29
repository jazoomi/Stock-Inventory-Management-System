import React, { useState, useRef, useEffect } from "react";
import "./styles/IngredientList.css";

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
    if (["price", "quantity", "threshold", "serving"].includes(name)) {
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
        const savedIngredient = {
          ...editedIngredient,
          price: parseFloat(editedIngredient.price) || 0,
          quantity: parseFloat(editedIngredient.quantity) || 0,
          threshold: parseFloat(editedIngredient.threshold) || 0,
          serving: parseFloat(editedIngredient.serving) || 0,
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

  const quantityNum = parseFloat(ingredient.quantity);
  const thresholdNum = parseFloat(ingredient.threshold);
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
            <select name="unit" value={editedIngredient.unit} onChange={handleChange}>
              <option value="">Units</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
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
            <input type="text" name="serving" value={editedIngredient.serving} onChange={handleChange} placeholder="Serving" />
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
            <p>Amount: {ingredient.quantity} {ingredient.unit}</p>
            <p>Serving Size: {ingredient.serving} {ingredient.unit}</p>
            <p>Price: ${parseFloat(ingredient.price).toFixed(2)}</p>
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

export default IngredientCard;