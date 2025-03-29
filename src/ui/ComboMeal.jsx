import React, { useState, useEffect } from 'react';
import './styles/ComboMeal.css';

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
  const [showDollarSavings, setShowDollarSavings] = useState(false);
  const [manualPriceEdit, setManualPriceEdit] = useState(false);

  const fetchRawIngredients = () => {
    fetch("http://localhost:3001/raw-ingredients")
      .then(res => res.json())
      .then(data => {
        const ingredients = data.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          type: "raw"
        }));
        setRawIngredients(ingredients);
      });
  };

  const fetchAssembledMeals = () => {
    fetch("http://localhost:3001/assembled-ingredients")
      .then(res => res.json())
      .then(data => {
        const meals = data.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          type: "assembled"
        }));
        setAssembledMeals(meals);
      });
  };

  const fetchSavedCombos = () => {
    fetch("http://localhost:3001/combo")
      .then(res => res.json())
      .then(data => {
        const combos = data.map(c => ({ ...c, meals: JSON.parse(c.items) }));
        setSavedCombos(combos);
      });
  };

  useEffect(() => {
    fetchRawIngredients();
    fetchAssembledMeals();
    fetchSavedCombos();
  }, []);

  const selectedItems = [...selectedRawIngredients, ...selectedAssembledMeals];

  useEffect(() => {
    if (!manualPriceEdit) {
      const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
      setComboPrice(total.toFixed(2));
    }
  }, [selectedItems, manualPriceEdit]);

  const toggleSelection = (item, isRaw) => {
    const selected = isRaw ? selectedRawIngredients : selectedAssembledMeals;
    const setter = isRaw ? setSelectedRawIngredients : setSelectedAssembledMeals;
    if (selected.find(i => i.id === item.id)) {
      setter(selected.filter(i => i.id !== item.id));
    } else {
      setter([...selected, item]);
    }
  };

  const calculateOriginalTotal = () => selectedItems.reduce((sum, item) => sum + item.price, 0);

  const calculateSavings = () => {
    const originalTotal = calculateOriginalTotal();
    const totalAfterTax = parseFloat(totalCostSale) || 0;
    const savings = totalAfterTax - originalTotal;
    return {
      percentage: originalTotal ? ((savings / originalTotal) * 100).toFixed(1) : 0,
      dollar: savings.toFixed(2)
    };
  };

  const updateTotalCostSale = (price, taxVal) => {
    const priceNum = parseFloat(price) || 0;
    const taxNum = parseFloat(taxVal) || 0;
    const total = (priceNum + (priceNum * taxNum / 100)).toFixed(2);
    setTotalCostSale(total);
  };

  const handleSaveCombo = () => {
    if (!comboName || selectedItems.length === 0 || !comboPrice) {
      alert("Please fill all fields");
      return;
    }
    const price = parseFloat(comboPrice);
    const priceWithTax = price + (price * (parseFloat(tax) || 0) / 100);
    const payload = {
      name: comboName,
      price: priceWithTax.toFixed(2),
      items: JSON.stringify(selectedItems)
    };
    fetch("http://localhost:3001/combo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(() => {
        fetchSavedCombos();
        setComboName('');
        setSelectedRawIngredients([]);
        setSelectedAssembledMeals([]);
        setComboPrice('');
        setTax('');
        setTotalCostSale('');
        setManualPriceEdit(false);
      });
  };

  const handleDeleteCombo = (id) => {
    fetch(`http://localhost:3001/combo/${id}`, { method: "DELETE" })
      .then(() => fetchSavedCombos());
  };

  const filteredRaw = rawIngredients.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredMeals = assembledMeals.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const savings = calculateSavings();

  // Check if there are no results
  const noResults = filteredRaw.length === 0 && filteredMeals.length === 0;

  return (
    <div className="combo-meal-container">
      <h1 className="centered">Create Combo Meal</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search for ingredients or meals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {noResults && (
        <p style={{ color: 'red' }}>No Ingredient Found</p>
      )}

      <div className="combo-main-container">
        <div className="combo-sidebar two-columns">
          <div className="column">
            <h4>Raw Ingredients</h4>
            {filteredRaw.map(item => (
              <div
                key={item.id}
                className={`summary-pill ${selectedItems.find(i => i.id === item.id) ? "selected" : ""}`}
                onClick={() => toggleSelection(item, true)}
              >
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="column">
            <h4>Assembled Meals</h4>
            {filteredMeals.map(item => (
              <div
                key={item.id}
                className={`summary-pill ${selectedItems.find(i => i.id === item.id) ? "selected" : ""}`}
                onClick={() => toggleSelection(item, false)}
              >
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="combo-detail-panel">
          <h3>Selected Items</h3>
          {selectedItems.length === 0 ? (
            <p>No items selected.</p>
          ) : (
            selectedItems.map(item => (
              <div key={item.id} className="summary-pill selected">
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))
          )}

          {selectedItems.length > 0 && (
            <div className="price-section">
              <input
                type="text"
                placeholder="Combo Name"
                value={comboName}
                onChange={(e) => setComboName(e.target.value)}
              />

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

              <div className="combo-tax-input">
                <label>Tax (%): </label>
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

              <div>
                <p>Total w/ Tax: ${totalCostSale}</p>
                <p
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowDollarSavings(!showDollarSavings)}
                >
                  Savings: {showDollarSavings ? `$${savings.dollar}` : `${savings.percentage}%`}
                </p>
              </div>

              <button onClick={handleSaveCombo}>Save Combo</button>
            </div>
          )}
        </div>
      </div>

      {savedCombos.length > 0 && (
        <div className="combo-list">
          <h3>Saved Combos</h3>
          <table className="combo-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Items</th>
                <th>Combo Price</th>
                <th>Profit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {savedCombos.map(combo => {
                const originalTotal = combo.meals.reduce((sum, item) => sum + item.price, 0);
                const savingsPercent = ((combo.price - originalTotal) / originalTotal * 100).toFixed(1);
                const dollarSavings = (combo.price - originalTotal).toFixed(2);
                return (
                  <tr key={combo.id}>
                    <td>{combo.name}</td>
                    <td>{combo.meals.map(i => i.name).join(', ')}</td>
                    <td>${combo.price}</td>
                    <td onClick={() => setShowDollarSavings(!showDollarSavings)} style={{ cursor: 'pointer' }}>
                      {showDollarSavings ? `$${dollarSavings}` : `${savingsPercent}%`}
                    </td>
                    <td><button onClick={() => handleDeleteCombo(combo.id)}>Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComboMeal;