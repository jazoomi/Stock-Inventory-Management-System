import React, { useState, useEffect } from "react";
import "./styles/CollapsibleReduceStock.css";

const CollapsibleReduceStock = ({ onStockUpdated }) => {
  const [showSection, setShowSection] = useState(false);
  const [assembledMeals, setAssembledMeals] = useState([]);
  const [comboMeals, setComboMeals] = useState([]);
  const [selectedAssembled, setSelectedAssembled] = useState({});
  const [selectedCombo, setSelectedCombo] = useState({});

  const [ingredients, setIngredients] = useState([]);


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

    fetch("http://localhost:3001/combo")
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((combo) => ({
          ...combo,
          meals: JSON.parse(combo.items),
        }));
        setComboMeals(parsed);
      });

    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data));
  }, []);

  const handleCheckboxChange = (id, type, isChecked) => {
    if (type === "assembled") {
      setSelectedAssembled((prev) => ({
        ...prev,
        [id]: isChecked ? 1 : undefined,
      }));
    } else {
      setSelectedCombo((prev) => ({
        ...prev,
        [id]: isChecked ? 1 : undefined,
      }));
    }
  };

  const handleQuantityChange = (id, type, quantity) => {
    const value = parseInt(quantity) || 1;
    if (type === "assembled") {
      setSelectedAssembled((prev) => ({ ...prev, [id]: value }));
    } else {
      setSelectedCombo((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleBulkReduce = async () => {
    let updatedIngredients = [...ingredients];
  
    for (const meal of assembledMeals) {
      const quantity = selectedAssembled[meal.id];
      if (!quantity) continue;
  
      for (const ingredient of meal.recipe.ingredients) {
        const deduction = parseFloat((ingredient.serving * ingredient.servingAmount * quantity).toFixed(2));
        const match = updatedIngredients.find((i) => i.id === ingredient.id);
        if (match) {
            match.quantity = parseFloat(Math.max(0, match.quantity - deduction).toFixed(2));
        }
      }
    }
  
    for (const combo of comboMeals) {
      const quantity = selectedCombo[combo.id];
      if (!quantity) continue;
  
      for (const item of combo.meals) {
        if (item.type === "raw") {
          const match = updatedIngredients.find((i) => i.id === item.id);
          if (match) {
            // Deduct based on quantity sold
            const deduction = parseFloat(((match.serving || 1) * quantity).toFixed(2));
            match.quantity = parseFloat(Math.max(0, match.quantity - deduction).toFixed(2));
          }
        } else if (item.type === "assembled") {
          const meal = assembledMeals.find((m) => m.id === item.id);
          if (!meal) continue;
  
          for (const ingredient of meal.recipe.ingredients) {
            const deduction = parseFloat((ingredient.serving * ingredient.servingAmount * quantity).toFixed(2));
            const match = updatedIngredients.find((i) => i.id === ingredient.id);
            if (match) {
                match.quantity = parseFloat(Math.max(0, match.quantity - deduction).toFixed(2));
            }
          }
        }
      }
    }
    // Push updates to server
    for (const ing of updatedIngredients) {
      await fetch(`http://localhost:3001/raw-ingredients/${ing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ing),
      });
    }

    alert("Stock successfully reduced.");
    if (onStockUpdated) {
        onStockUpdated();
      }
    console.log()
  };

  return (
    <div className="reduce-stock-wrapper">
      <button onClick={() => setShowSection((prev) => !prev)}>
        {showSection ? "Hide Reduce Stock" : "Reduce Stock by Meal Sold"}
      </button>

      {showSection && (
        <div className="reduce-stock-columns-boxed">
          <div className="boxed-column">
            <h4>Assembled Meals</h4>
            {assembledMeals.map((meal) => (
              <div key={meal.id} className="stock-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedAssembled[meal.id] !== undefined}
                    onChange={(e) =>
                      handleCheckboxChange(meal.id, "assembled", e.target.checked)
                    }
                  />
                  {meal.name}
                </label>
                <input
                  type="number"
                  min={1}
                  value={selectedAssembled[meal.id] || ""}
                  disabled={selectedAssembled[meal.id] === undefined}
                  onChange={(e) =>
                    handleQuantityChange(meal.id, "assembled", e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <div className="boxed-column">
            <h4>Combo Meals</h4>
            {comboMeals.map((combo) => (
              <div key={combo.id} className="stock-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCombo[combo.id] !== undefined}
                    onChange={(e) =>
                      handleCheckboxChange(combo.id, "combo", e.target.checked)
                    }
                  />
                  {combo.name}
                </label>
                <input
                  type="number"
                  min={1}
                  value={selectedCombo[combo.id] || ""}
                  disabled={selectedCombo[combo.id] === undefined}
                  onChange={(e) =>
                    handleQuantityChange(combo.id, "combo", e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <div className="reduce-stock-actions">
            <button onClick={handleBulkReduce}>Reduce Stock</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleReduceStock;