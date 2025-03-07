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
  
  // Calculate original price
  const calculateOriginalTotal = () => {
    return selectedMeals.reduce((total, meal) => total + meal.sellingPrice, 0);
  };

  // this is how much the customer would save on combo as opposed to buying seperately
  const calculateSavings = () => {
    const originalTotal = calculateOriginalTotal();
    const newTotal = parseFloat(comboPrice) || 0;
    if (originalTotal === 0) return 0;
    return ((originalTotal - newTotal) / originalTotal * 100).toFixed(1);
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

  // Save the combo to the DB
  const handleSaveCombo = () => {
    if (!comboName || selectedItems.length === 0 || !comboPrice) {
      alert('Please enter a combo name, select items, and set a price');
      return;
    }

    const payload = {
      name: comboName,
      // Save selected items as a JSON string
      items: JSON.stringify(selectedItems),
      price: parseFloat(comboPrice)
    };

    fetch("http://localhost:3001/combo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        fetchSavedCombos();
        // Reset selections and form fields
        setComboName('');
        setSelectedRawIngredients([]);
        setSelectedAssembledMeals([]);
        setComboPrice('');
      })
      .catch(err => console.error("Error saving combo:", err));
  };

  const handleDeleteCombo = (comboId) => {
    const updatedCombos = savedCombos.filter(combo => combo.id !== comboId);
    localStorage.setItem('savedCombos', JSON.stringify(updatedCombos));
    setSavedCombos(updatedCombos);
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

        <h3>Select Assembled Meals for Combo</h3>
        <div className="meal-selection">
          {assembledMeals.map(meal => (
            <div
              key={meal.id}
              className={`meal-card ${selectedMeals.some(selected => selected.id === meal.id) ? 'selected' : ''}`}
              onClick={() => toggleMealSelection(meal)}
            >
              <div className="meal-card-header">
                <h3>{meal.name}</h3>
                <input
                  type="checkbox"
                  checked={selectedMeals.some(selected => selected.id === meal.id)}
                  onChange={() => toggleMealSelection(meal)}
                />
              </div>
              <p>Price: ${meal.sellingPrice.toFixed(2)}</p>
              <p>Ingredients: {meal.ingredients.map(ing => ing.name).join(', ')}</p>
            </div>
          ))}
        </div>

        {selectedMeals.length > 0 && (
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
                <th>Included Meals</th>
                <th>Original Total</th>
                <th>Combo Price</th>
                <th>Savings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedCombos.map(combo => (
                <tr key={combo.id}>
                  <td>{combo.name}</td>
                  <td>{combo.meals.map(meal => meal.name).join(', ')}</td>
                  <td>${combo.originalTotal.toFixed(2)}</td>
                  <td>${combo.comboPrice.toFixed(2)}</td>
                  <td>{combo.savings}%</td>
                  <td>
                    <button onClick={() => handleDeleteCombo(combo.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComboMeal;