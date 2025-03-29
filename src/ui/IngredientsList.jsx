import React, { useState, useEffect } from "react";
import "./styles/IngredientList.css";
import ImportIngredients from "./ImportIngredients";
import IngredientCard from "./IngredientCard";
import IngredientSummaryCard from "./IngredientSummaryCard";
import AddIngredient from "./AddIngredient"; // renamed modal component

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
  const [assembledMeals, setAssembledMeals] = useState([]);
  const [selectedMealId, setSelectedMealId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState(1);

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

  //Define log sale logic
  const handleLogSale = async () => {
    const meal = assembledMeals.find((m) => m.id == selectedMealId);
    if (!meal || !saleQuantity) return;

    for (const ingredient of meal.recipe.ingredients) {
      const amountToDeduct = ingredient.serving * ingredient.servingAmount * saleQuantity;

      const matchingRaw = ingredients.find((ing) => ing.id === ingredient.id);
      if (!matchingRaw) continue;

      const updatedQuantity = Math.max(0, matchingRaw.quantity - amountToDeduct);

      await fetch(`http://localhost:3001/raw-ingredients/${ingredient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...matchingRaw, quantity: updatedQuantity }),
      });
    }

    fetchIngredients();
    alert("Stock updated based on sale.");
  };

  //Fetch assembled meals in useEffect
  useEffect(() => {
    fetch("http://localhost:3001/assembled-ingredients")
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((meal) => ({
          ...meal,
          recipe: JSON.parse(meal.recipe),
        }));
        setAssembledMeals(parsed);
      });
  }, []);

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

      {/* ui for log sales based on meals */}
      <div className="log-sales">
        <h4>Reduce Stock by Meal Sold</h4>
        <select value={selectedMealId} onChange={(e) => setSelectedMealId(e.target.value)}>
          <option value="">Select Meal</option>
          {assembledMeals.map(meal => (
            <option key={meal.id} value={meal.id}>{meal.name}</option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          placeholder="Quantity Sold"
          value={saleQuantity}
          onChange={(e) => setSaleQuantity(parseInt(e.target.value) || 1)}
        />
        <button onClick={handleLogSale}>Reduce Stock</button>
      </div>

      {showAddModal && (
        <AddIngredient
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddIngredient}
        />
      )}

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
