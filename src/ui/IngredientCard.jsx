import React, { useRef, useEffect, useState } from "react";
import "./styles/IngredientCard.css";

const IngredientCard = ({ ingredient, onSave, onDelete, isEditing, setIsEditing }) => {
  const [editedIngredient, setEditedIngredient] = useState({ ...ingredient });
  const cardRef = useRef(null);

  useEffect(() => {
    setEditedIngredient({ ...ingredient });
  }, [ingredient]);

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
      className={`ingredient-card ${isLow ? "low-stock" : ""}`}
      ref={cardRef}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <div className="ingredient-edit-form">
          <label>
            Name:
            <input type="text" name="name" value={editedIngredient.name} onChange={handleChange} autoFocus />
          </label>

          <label>
            Quantity:
            <input type="text" name="quantity" value={editedIngredient.quantity} onChange={handleChange} placeholder="Amount" />
          </label>

          <label>
            Unit:
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
          </label>

          {editedIngredient.unit === "other" && (
            <label>
              Specify Unit:
              <input
                type="text"
                name="unitSpecification"
                placeholder="Specify unit"
                value={editedIngredient.unitSpecification}
                onChange={handleChange}
              />
            </label>
          )}

          <label>
            Serving Size:
            <input type="text" name="serving" value={editedIngredient.serving} onChange={handleChange} />
          </label>

          <label>
            Price per Serving:
            <input type="text" name="price" value={editedIngredient.price} onChange={handleChange} placeholder="Price" />
          </label>

          <label className="threshold-group">
            Threshold:
            <input type="text" name="threshold" value={editedIngredient.threshold} onChange={handleChange} placeholder="Threshold" />
            <span className="note">Notify when below this amount</span>
          </label>
        </div>
      ) : (
        <>
          <h3>{ingredient.name}</h3>
          <div className="ingredient-details">
            <p>Amount: {ingredient.quantity} {ingredient.unit}</p>
            <p>Serving Size: {ingredient.serving} {ingredient.unit}</p>
            <p>Price per Serving: ${parseFloat(ingredient.price).toFixed(2)}</p>
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
