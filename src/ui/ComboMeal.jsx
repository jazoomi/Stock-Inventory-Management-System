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
  const [tax, setTax] = useState('');
  const [totalCostSale, setTotalCostSale] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDollarSavings, setShowDollarSavings] = useState(false); // New state for toggling profits display
  const [manualPriceEdit, setManualPriceEdit] = useState(false); // New state to track manual price edit

  const fetchRawIngredients = () => {
    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => {
        const ingredients = data.map(item => ({
          id: item.id,
          name: item.name,
          sellingPrice: parseFloat(item.price) * parseFloat(item.quantity),
          type: "raw"
        }));
        setRawIngredients(ingredients);
      })
      .catch(err => console.error("Error fetching raw ingredients:", err));
  };

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

  const fetchSavedCombos = () => {
    fetch("http://localhost:3001/combo")
      .then((res) => res.json())
      .then((data) => {
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

  const selectedItems = [...selectedRawIngredients, ...selectedAssembledMeals];

  useEffect(() => {
    if (!manualPriceEdit) {
      const total = selectedItems.reduce((sum, item) => sum + item.sellingPrice, 0);
      setComboPrice(total.toFixed(2));
    }
  }, [selectedItems, manualPriceEdit]);

  const updateTotalCostSale = (comboPrice, tax) => {
    const price = parseFloat(comboPrice) || 0;
    const taxAmount = (price * parseFloat(tax) / 100) || 0;
    const totalSale = (price + taxAmount).toFixed(2);
    setTotalCostSale(totalSale);
  };

  const toggleRawSelection = (ingredient) => {
    if (selectedRawIngredients.some(item => item.id === ingredient.id)) {
      setSelectedRawIngredients(selectedRawIngredients.filter(item => item.id !== ingredient.id));
    } else {
      setSelectedRawIngredients([...selectedRawIngredients, ingredient]);
    }
  };

  const toggleAssembledSelection = (meal) => {
    if (selectedAssembledMeals.some(item => item.id === meal.id)) {
      setSelectedAssembledMeals(selectedAssembledMeals.filter(item => item.id !== meal.id));
    } else {
      setSelectedAssembledMeals([...selectedAssembledMeals, meal]);
    }
  };

  const calculateOriginalTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.sellingPrice, 0);
  };

  const calculateSavings = () => {
    const originalTotal = calculateOriginalTotal();
    const totalAfterTax = parseFloat(totalCostSale) || 0;

    if (originalTotal === 0) return 0;

    const savings = totalAfterTax - originalTotal;
    return {
      percentage: ((savings / originalTotal) * 100).toFixed(1),
      dollar: savings.toFixed(2)
    };
  };

  const handleSaveCombo = () => {
    if (!comboName || selectedItems.length === 0 || !comboPrice) {
      alert('Please enter a combo name, select items, and set a price');
      return;
    }

    const priceAfterTax = parseFloat(comboPrice) + (parseFloat(comboPrice) * (parseFloat(tax) / 100) || 0);
    
    const payload = {
      name: comboName,
      items: JSON.stringify(selectedItems),
      price: priceAfterTax.toFixed(2)
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
      setTax('');
      setTotalCostSale('');
      setManualPriceEdit(false);
    })
    .catch(err => console.error("Error saving combo:", err));
  };

  const handleDeleteCombo = (comboId) => {
    fetch(`http://localhost:3001/combo/${comboId}`, {
      method: "DELETE",
    })
    .then(() => fetchSavedCombos())
    .catch(err => console.error("Error deleting combo:", err));
  };

  const filteredRawIngredients = rawIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssembledMeals = assembledMeals.filter(meal =>
    meal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const savings = calculateSavings();

  return (
    <div className="combo-meal-container">
      <h1>Create Combo Meal</h1>
      <div className="combo-form">
        <input
          type="text"
          placeholder="Combo Name"
          value={comboName}
          onChange={(e) => setComboName(e.target.value)}
        />

        {/* Add search bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for ingredients or meals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Display message if no ingredients or meals found */}
          {(filteredRawIngredients.length === 0 && filteredAssembledMeals.length === 0 && searchQuery) && (
            <span style={{ color: 'red', marginLeft: '10px' }}>X No ingredient or meal found</span>
          )}
        </div>

        {/* Section for Raw Ingredients */}
        <h3>Select Raw Ingredients for Combo</h3>
        <div className="meal-selection">
          {filteredRawIngredients.map(ingredient => (
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
          {filteredAssembledMeals.map(meal => (
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
                      setManualPriceEdit(true);
                      updateTotalCostSale(e.target.value, tax);
                    }
                  }}
                />
              </div>
              {comboPrice && (
                <p onClick={() => setShowDollarSavings(!showDollarSavings)} style={{ cursor: 'pointer' }}>
                  Savings: {showDollarSavings ? `$${savings.dollar}` : `${savings.percentage}%`}
                </p>
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
                <th>Profit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedCombos.map(combo => {
                const originalTotal = combo.meals.reduce((sum, item) => sum + item.sellingPrice, 0);
                const savings = originalTotal ? ((combo.price - originalTotal) / originalTotal * 100).toFixed(1) : 0;
                const dollarSavings = (combo.price - originalTotal).toFixed(2);
                return (
                  <tr key={combo.id}>
                    <td>{combo.name}</td>
                    <td>{combo.meals.map(item => item.name).join(', ')}</td>
                    <td>${originalTotal.toFixed(2)}</td>
                    <td>${combo.price.toFixed(2)}</td>
                    <td onClick={() => setShowDollarSavings(!showDollarSavings)} style={{ cursor: 'pointer' }}>
                      {showDollarSavings ? `$${dollarSavings}` : `${savings}%`}
                    </td>
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
      <div className="total-cost-box total-cost">
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
                  updateTotalCostSale(comboPrice, e.target.value);
                }
              }} 
            />

          </div>
        </div>
      </div>

      <p> </p>
      <p> </p>
      <p> </p>
    </div>
  );  
};

export default ComboMeal;
