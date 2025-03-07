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

  const toggleMealSelection = (meal) => {
    if (selectedMeals.some(selected => selected.id === meal.id)) {
      setSelectedMeals(selectedMeals.filter(selected => selected.id !== meal.id));
    } else {
      setSelectedMeals([...selectedMeals, meal]);
      // Set initial combo price to sum of selected meals
      const newTotal = [...selectedMeals, meal].reduce((total, m) => total + m.sellingPrice, 0);
      setComboPrice(newTotal.toFixed(2));
    }
  };

  const handleSaveCombo = () => {
    if (!comboName || selectedMeals.length === 0 || !comboPrice) {
      alert('Please enter a combo name, select meals, and set a price');
      return;
    }

    const newCombo = {
      id: Date.now(),
      name: comboName,
      meals: selectedMeals,
      originalTotal: calculateOriginalTotal(),
      comboPrice: parseFloat(comboPrice),
      savings: calculateSavings()
    };
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