import React, { useState } from "react";
import "./styles/AddIngredient.css";

const AddIngredient = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "",
    price: "",
    serving: "",
    threshold: "",
    unitSpecification: ""
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const { name, quantity, unit, price, serving, threshold, unitSpecification } = formData;

    if (!name || !quantity || !unit || !price || !serving || !threshold) {
      setError("Please fill in all fields");
      return;
    }

    if (unit === "other" && !unitSpecification) {
      setError("Please specify unit");
      return;
    }

    if (![quantity, price, serving, threshold].every(val => /^\d*\.?\d*$/.test(val))) {
      setError("Quantity, price, serving, and threshold must be valid numbers");
      return;
    }

    const preparedIngredient = {
      ...formData,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      serving: parseFloat(serving),
      threshold: parseFloat(threshold)
    };

    onAdd(preparedIngredient);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Ingredient</h2>
        <input name="name" type="text" placeholder="Name" onChange={handleChange} />
        <input name="quantity" type="text" placeholder="Quantity" onChange={handleChange} />
        <select name="unit" value={formData.unit} onChange={handleChange}>
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
        {formData.unit === "other" && (
          <input name="unitSpecification" type="text" placeholder="Specify unit" onChange={handleChange} />
        )}
        <input name="serving" type="text" placeholder="Serving Size" onChange={handleChange} />
        <input name="price" type="text" placeholder="Price" onChange={handleChange} />
        <input name="threshold" type="text" placeholder="Threshold" onChange={handleChange} />
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button onClick={handleSubmit}>Add</button>
          <button onClick={onClose} className="cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddIngredient;
