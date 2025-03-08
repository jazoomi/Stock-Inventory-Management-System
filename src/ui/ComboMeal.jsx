import React, { useState, useEffect } from 'react';
import './ComboMeal.css';

const ComboMeal = () => {
  const [rawIngredients, setRawIngredients] = useState([]);
  const [assembledMeals, setAssembledMeals] = useState([]);
  const [selectedRawIngredients, setSelectedRawIngredients] = useState([]);
  const [selectedAssembledMeals, setSelectedAssembledMeals] = useState([]);
  const [comboName, setComboName] = useState('');
  const [comboPrice, setComboPrice] = useState('');
  const [savedCombos, setSavedCombos] = useState([]);
  const [tax, setTax] = useState(''); // State for tax input
  const [totalCostSale, setTotalCostSale] = useState(''); // State for total cost sale


  // Fetch raw ingredients from the DB and compute sellingPrice = price * quantity
  const fetchRawIngredients = () => {
    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => {
        const ingredients = data.map(item => ({
          id: item.id,
          name: item.name,
          // Use the total cost as price: price * quantity
          sellingPrice: parseFloat(item.price) * parseFloat(item.quantity),
          type: "raw"
        }));
        setRawIngredients(ingredients);
      })
      .catch(err => console.error("Error fetching raw ingredients:", err));
  };

  // Fetch assembled meals from the DB
  const fetchAssembledMeals = () => {
    fetch("http://localhost:3001/assembled-ingredients")
      .then((res) => res.json())
      .then((data) => {
        const meals = data.map(m => ({
          id: m.id,
          name: m.name,
          sellingPrice: parseFloat(m.price),
          type: "assembled"
        }));
        setAssembledMeals(meals);
      })
      .catch(err => console.error("Error fetching assembled meals:", err));
  };

  // Fetch saved combos from the DB
  const fetchSavedCombos = () => {
    fetch("http://localhost:3001/combo")
      .then((res) => res.json())
      .then((data) => {
        // 'items' is stored as a JSON string in the DB; parse it.
        const combos = data.map(combo => ({
          ...combo,
          meals: JSON.parse(combo.items)
        }));
        setSavedCombos(combos);
      })
      .catch(err => console.error("Error fetching saved combos:", err));
  };

  useEffect(() => {
    fetchRawIngredients();
    fetchAssembledMeals();
    fetchSavedCombos();
  }, []);

  // Combine the selected raw ingredients and assembled meals
  const selectedItems = [...selectedRawIngredients, ...selectedAssembledMeals];

  // Automatically update combo price when selections change
  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => sum + item.sellingPrice, 0);
    setComboPrice(total.toFixed(2));
  }, [selectedItems]);

  const updateTotalCostSale = (comboPrice, tax) => {
    const price = parseFloat(comboPrice) || 0;
    const taxAmount = (price * parseFloat(tax) / 100) || 0;
    const totalSale = (price + taxAmount).toFixed(2);
    setTotalCostSale(totalSale);
  };
  
  // Toggle selection for raw ingredients
  const toggleRawSelection = (ingredient) => {
    if (selectedRawIngredients.some(item => item.id === ingredient.id)) {
      setSelectedRawIngredients(selectedRawIngredients.filter(item => item.id !== ingredient.id));
    } else {
      setSelectedRawIngredients([...selectedRawIngredients, ingredient]);
    }
  };

  // Toggle selection for assembled meals
  const toggleAssembledSelection = (meal) => {
    if (selectedAssembledMeals.some(item => item.id === meal.id)) {
      setSelectedAssembledMeals(selectedAssembledMeals.filter(item => item.id !== meal.id));
    } else {
      setSelectedAssembledMeals([...selectedAssembledMeals, meal]);
    }
  };

  // Calculate the original total of the selected items
  const calculateOriginalTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.sellingPrice, 0);
  };

  // Calculate percentage savings
  const calculateSavings = () => {
    const originalTotal = calculateOriginalTotal();
    const newTotal = parseFloat(comboPrice) || 0;
    if (originalTotal === 0) return 0;
    return ((originalTotal - newTotal) / originalTotal * 100).toFixed(1);
  };

  const handleSaveCombo = () => {
    if (!comboName || selectedItems.length === 0 || !comboPrice) {
      alert('Please enter a combo name, select items, and set a price');
      return;
    }
  
    // Calculate price after tax
    const priceAfterTax = parseFloat(comboPrice) + (parseFloat(comboPrice) * (parseFloat(tax) / 100) || 0);
    
    const payload = {
      name: comboName,
      items: JSON.stringify(selectedItems),
      price: priceAfterTax.toFixed(2) // Save the total price after tax
    };
  
    fetch("http://localhost:3001/combo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      fetchSavedCombos();
      setComboName('');
      setSelectedRawIngredients([]);
      setSelectedAssembledMeals([]);
      setComboPrice('');
      setTax(''); // Reset tax when saving
      setTotalCostSale(''); // Reset total cost sale when saving
    })
    .catch(err => console.error("Error saving combo:", err));
  };
  
  
   // Delete a combo from the DB
   const handleDeleteCombo = (comboId) => {
   fetch(`http://localhost:3001/combo/${comboId}`, {
   method: "DELETE",
   })
   .then(() => fetchSavedCombos())
   .catch(err => console.error("Error deleting combo:", err));
   };  

  return (
    <div className="combo-meal-container">
      <h2>Create Combo Meal</h2>
      <div className="combo-form">
        <input
          type="text"
          placeholder="Combo Name"
          value={comboName}
          onChange={(e) => setComboName(e.target.value)}
        />

        {/* Section for Raw Ingredients */}
        <h3>Select Raw Ingredients for Combo</h3>
        <div className="meal-selection">
          {rawIngredients.map(ingredient => (
            <div
              key={ingredient.id}
              className={`meal-card ${selectedRawIngredients.some(item => item.id === ingredient.id) ? 'selected' : ''}`}
              onClick={() => toggleRawSelection(ingredient)}
            >
              <div className="meal-card-header">
                <h3>{ingredient.name}</h3>
                <input
                  type="checkbox"
                  checked={selectedRawIngredients.some(item => item.id === ingredient.id)}
                  onChange={() => toggleRawSelection(ingredient)}
                />
              </div>
              <p>Price: ${ingredient.sellingPrice.toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Section for Assembled Meals */}
        <h3>Select Assembled Meals for Combo</h3>
        <div className="meal-selection">
          {assembledMeals.map(meal => (
            <div
              key={meal.id}
              className={`meal-card ${selectedAssembledMeals.some(item => item.id === meal.id) ? 'selected' : ''}`}
              onClick={() => toggleAssembledSelection(meal)}
            >
              <div className="meal-card-header">
                <h3>{meal.name}</h3>
                <input
                  type="checkbox"
                  checked={selectedAssembledMeals.some(item => item.id === meal.id)}
                  onChange={() => toggleAssembledSelection(meal)}
                />
              </div>
              <p>Price: ${meal.sellingPrice.toFixed(2)}</p>
            </div>
          ))}
        </div>

        {selectedItems.length > 0 && (
          <div className="price-details">
            <div>
              <p>Original Total: ${calculateOriginalTotal().toFixed(2)}</p>
              <div className="combo-price-input">
                <label>Combo Price: $</label>
                <input
                  type="text"
                  value={comboPrice}
                  onChange={(e) => {
                    if (/^\d*\.?\d*$/.test(e.target.value)) {
                      setComboPrice(e.target.value);
                      updateTotalCostSale(e.target.value, tax); // Update total sale cost when combo price changes
                    }
                  }}
                />
              </div>
              {comboPrice && (
                <p>Savings: {calculateSavings()}%</p>
              )}
            </div>
            <button onClick={handleSaveCombo}>Save Combo</button>
          </div>
        )}
      </div>

      {savedCombos.length > 0 && (
        <div className="combo-list">
          <h3>Saved Combo Meals</h3>
          <table className="combo-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Included Items</th>
                <th>Original Total</th>
                <th>Combo Price</th>
                <th>Savings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedCombos.map(combo => {
                const originalTotal = combo.meals.reduce((sum, item) => sum + item.sellingPrice, 0);
                const savings = originalTotal ? ((originalTotal - combo.price) / originalTotal * 100).toFixed(1) : 0;
                return (
                  <tr key={combo.id}>
                    <td>{combo.name}</td>
                    <td>{combo.meals.map(item => item.name).join(', ')}</td>
                    <td>${originalTotal.toFixed(2)}</td>
                    <td>${combo.price.toFixed(2)}</td>
                    <td>{savings}%</td>
                    <td>
                      <button onClick={() => handleDeleteCombo(combo.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Total Cost and Tax section at the bottom */}
 <div className="total-cost-box total-cost"> {/* Apply total-cost class */}
          <h3>Total Costs</h3>
          <div className="total-costs">
          <div>
          <label>Total Cost (Raw): $</label>
          <span>{calculateOriginalTotal().toFixed(2)}</span>
          </div>
          <div>
          <label>Total Cost (Sale): $</label>
          <span>{totalCostSale || '0.00'}</span>
          </div>
          <div>
          <label>Tax (%):</label>
          <input 
          type="text" 
          value={tax} 
          onChange={(e) => {
            if (/^\d*\.?\d*$/.test(e.target.value)) {
              setTax(e.target.value);
              updateTotalCostSale(comboPrice, e.target.value); // Update total sale when tax changes
            }
          }} 
          />
          </div>
          </div>
          </div>
          </div>
    
  );
};

export default ComboMeal;