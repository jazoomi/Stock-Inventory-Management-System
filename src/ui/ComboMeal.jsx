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
  const [markdown, setMarkdown] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDollarSavings, setShowDollarSavings] = useState(false);
  const [manualPriceEdit, setManualPriceEdit] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/raw-ingredients")
      .then(res => res.json())
      .then(data => {
        const ingredients = data.map(item => ({
          id: `raw-${item.id}`,
          name: item.name,
          price: parseFloat(item.price),
          type: "raw"
        }));
        setRawIngredients(ingredients);
      });

    fetch("http://localhost:3001/assembled-ingredients")
      .then(res => res.json())
      .then(data => {
        const meals = data.map(item => ({
          id: `assembled-${item.id}`,
          name: item.name,
          price: parseFloat(item.price),
          type: "assembled"
        }));
        setAssembledMeals(meals);
      });

    fetch("http://localhost:3001/combo")
      .then(res => res.json())
      .then(data => {
        const combos = data.map(c => ({ ...c, meals: JSON.parse(c.items) }));
        setSavedCombos(combos);
      });
  }, []);

  const selectedItems = [...selectedRawIngredients, ...selectedAssembledMeals];

  const calculateOriginalTotal = () =>
    selectedItems.reduce((sum, item) => sum + item.price, 0);

  const calculateMarkdownPrice = () => {
    const original = calculateOriginalTotal();
    const percent = parseFloat(markdown) || 0;
    return (original - original * (percent / 100)).toFixed(2);
  };

  const calculateSavings = () => {
    const originalTotal = calculateOriginalTotal();
    const comboPriceFloat = parseFloat(comboPrice) || 0;
    const savings = originalTotal - comboPriceFloat;
    return {
      percentage: originalTotal ? ((savings / originalTotal) * 100).toFixed(1) : 0,
      dollar: savings.toFixed(2)
    };
  };

  useEffect(() => {
    if (!manualPriceEdit) {
      setComboPrice(calculateMarkdownPrice());
    }
  }, [selectedItems, markdown, manualPriceEdit]);

  const toggleSelection = (item, isRaw) => {
    const selected = isRaw ? selectedRawIngredients : selectedAssembledMeals;
    const setter = isRaw ? setSelectedRawIngredients : setSelectedAssembledMeals;
    if (selected.find(i => i.id === item.id)) {
      setter(selected.filter(i => i.id !== item.id));
    } else {
      setter([...selected, item]);
    }
  };

  const handleSaveCombo = () => {
    if (!comboName || selectedItems.length === 0 || !comboPrice) {
      alert("Please fill all fields");
      return;
    }
    const payload = {
      name: comboName,
      price: parseFloat(comboPrice).toFixed(2),
      items: JSON.stringify(selectedItems)
    };
    fetch("http://localhost:3001/combo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(() => {
        fetch("http://localhost:3001/combo")
          .then(res => res.json())
          .then(data => {
            const combos = data.map(c => ({ ...c, meals: JSON.parse(c.items) }));
            setSavedCombos(combos);
          });
        setComboName('');
        setSelectedRawIngredients([]);
        setSelectedAssembledMeals([]);
        setComboPrice('');
        setMarkdown('');
        setManualPriceEdit(false);
      });
  };

  const handleDeleteCombo = (id) => {
    fetch(`http://localhost:3001/combo/${id}`, { method: "DELETE" })
      .then(() => {
        fetch("http://localhost:3001/combo")
          .then(res => res.json())
          .then(data => {
            const combos = data.map(c => ({ ...c, meals: JSON.parse(c.items) }));
            setSavedCombos(combos);
          });
      });
  };

  const filteredRaw = rawIngredients.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredMeals = assembledMeals.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const savings = calculateSavings();
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

      {noResults && <p style={{ color: 'red' }}>No Ingredient Found</p>}

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
            <div className="combo-form">
              <label>
                Combo Name:
                <input
                  type="text"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                />
              </label>

              <label>
                Markdown (%):
                <input
                  type="text"
                  value={markdown}
                  onChange={(e) => {
                    if (/^\d*\.?\d*$/.test(e.target.value)) {
                      setMarkdown(e.target.value);
                      setManualPriceEdit(false);
                    }
                  }}
                />
              </label>

              <label>
                Final Combo Price: $
                <input
                  type="text"
                  value={comboPrice}
                  onChange={(e) => {
                    if (/^\d*\.?\d*$/.test(e.target.value)) {
                      setComboPrice(e.target.value);
                      setManualPriceEdit(true);
                    }
                  }}
                />
              </label>

              <div className="price-details">
                <div className="total-cost-sale">Final Price: ${comboPrice}</div>
                <div className="tax-percentage" onClick={() => setShowDollarSavings(!showDollarSavings)}>
                  Savings: {showDollarSavings ? `$${savings.dollar}` : `${savings.percentage}%`}
                </div>
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
                <th>Savings</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {savedCombos.map(combo => {
                const originalTotal = combo.meals.reduce((sum, item) => sum + item.price, 0);
                const savingsPercent = ((originalTotal - combo.price) / originalTotal * 100).toFixed(1);
                const dollarSavings = (originalTotal - combo.price).toFixed(2);
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