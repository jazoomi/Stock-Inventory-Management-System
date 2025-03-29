import React, { useState, useEffect } from "react";
import "./styles/IngredientList.css";
import ImportIngredients from "./ImportIngredients";
import IngredientCard from "./IngredientCard";
import IngredientSummaryCard from "./IngredientSummaryCard";
import AddIngredient from "./AddIngredient"; // renamed modal component
import CollapsibleReduceStock from "./CollapsibleReduceStock";

const exportToExcel = () => {
  window.location.href = "http://localhost:3001/export-raw-ingredients";
};

const IngredientList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngredientId, setSelectedIngredientId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchIngredients = () => {
    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => {
        const processedData = data.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity) || 0,
          threshold: parseFloat(item.threshold) || 0,
          price: parseFloat(item.price) || 0,
          serving: parseFloat(item.serving) || 0
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

  useEffect(() => {
    calculateTotalCost(ingredients);
    checkLowStockItems(ingredients);
  }, [ingredients]);

  
  const calculateTotalCost = (ingredientList) => {
    const total = ingredientList.reduce((sum, ingredient) => {
      const price = parseFloat(ingredient.price) || 0;
      const quantity = parseFloat(ingredient.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    setTotalCost(total);
  };

  const checkLowStockItems = (ingredients) => {
    const lowItems = ingredients.filter(item => {
      const quantity = parseFloat(item.quantity);
      const threshold = parseFloat(item.threshold);
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
    setIngredients(prevIngredients =>
      prevIngredients.map(ingredient =>
        ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
      )
    );

    fetch(`http://localhost:3001/raw-ingredients/${updatedIngredient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedIngredient),
    }).catch((err) => console.error("Error updating ingredient:", err));
  };

  const handleAddIngredient = (preparedIngredient) => {
    fetch("http://localhost:3001/raw-ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preparedIngredient),
    })
      .then((res) => res.json())
      .then((addedIngredient) => {
        setIngredients(prevIngredients => [...prevIngredients, addedIngredient]);
      })
      .catch((err) => console.error("Error adding ingredient:", err));
  };

  const handleDelete = (id) => {
    setIngredients(prevIngredients => prevIngredients.filter(ingredient => ingredient.id !== id));
    if (selectedIngredientId === id) setSelectedIngredientId(null);

    fetch(`http://localhost:3001/raw-ingredients/${id}`, {
      method: "DELETE",
    }).catch((err) => console.error("Error deleting ingredient:", err));
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedIngredient = ingredients.find(ing => ing.id === selectedIngredientId);

  return (
    <div className="ingredient-list">
      <h1 className="centered">Ingredients</h1>

      {notification && (
        <div className="notification">
          <p>{notification}</p>
          <button className="close-btn" onClick={closeNotification}>×</button>
        </div>
      )}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {filteredIngredients.length === 0 && searchQuery && (
          <span style={{ color: 'red', marginLeft: '10px' }}>X No ingredient found</span>
        )}
      </div>

      <div className="action-buttons">
        <button onClick={() => setShowAddModal(true)}>+ Add Ingredient</button>
        <ImportIngredients refreshIngredients={fetchIngredients} />
        <button onClick={exportToExcel}>Export to Excel</button>
      </div>

      {showAddModal && (
        <AddIngredient
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddIngredient}
        />
      )}

      <CollapsibleReduceStock onStockUpdated={fetchIngredients} />

      <div className="ingredient-main-container">
        <div className="ingredient-sidebar">
          {[...filteredIngredients].reverse().map((ingredient) => (
            <IngredientSummaryCard
              key={ingredient.id}
              ingredient={ingredient}
              isSelected={ingredient.id === selectedIngredientId}
              onClick={() => setSelectedIngredientId(ingredient.id)}
            />
          ))}
        </div>

        <div className="ingredient-detail-panel">
          {selectedIngredient ? (
            <IngredientCard
              ingredient={selectedIngredient}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ) : (
            <p>Select an ingredient to view details.</p>
          )}
        </div>
      </div>

      <div className="total-cost">
        <h2>Total Cost: ${totalCost.toFixed(2)}</h2>
      </div>
    </div>
  );
};

export default IngredientList;
