import React, { useState, useEffect } from "react";
import "./styles/AssembledIngredients.css";

const AssembledIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [mealName, setMealName] = useState("");
  const [mealMarkup, setMealMarkup] = useState("");
  const [assembledMeals, setAssembledMeals] = useState([]);
  const [editMeal, setEditMeal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error("Error fetching ingredients:", err));

    fetchAssembledMeals();
  }, []);

  const fetchAssembledMeals = () => {
    fetch("http://localhost:3001/assembled-ingredients")
      .then((res) => res.json())
      .then((data) => {
        const meals = data.map((item) => {
          let parsedRecipe = {};
          try {
            parsedRecipe = JSON.parse(item.recipe);
          } catch (err) {
            console.error("Error parsing recipe for item:", item.id, err);
          }

          return {
            id: item.id,
            name: item.name,
            sellingPrice: parseFloat(item.price) || 0,
            preparationPrice: parsedRecipe.preparationPrice || 0,
            markup: parsedRecipe.markup || "",
            ingredients: parsedRecipe.ingredients || [],
          };
        });
        setAssembledMeals(meals);
      })
      .catch((err) => console.error("Error fetching assembled meals:", err));
  };

  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.some((item) => item.id === ingredient.id)) {
      setSelectedIngredients(
        selectedIngredients.filter((item) => item.id !== ingredient.id)
      );
    } else {
      setSelectedIngredients([
        ...selectedIngredients,
        { ...ingredient, servingAmount: 1 }
      ]);
    }
  };

  const calculateTotalPrice = () => {
    return selectedIngredients.reduce(
      (total, ingredient) => total + ingredient.price,
      0
    );
  };

  const calculateSellingPrice = () => {
    const totalPrice = calculateTotalPrice();
    const markup = parseFloat(mealMarkup) || 0;
    return totalPrice + totalPrice * (markup / 100);
  };

  const handleAssembleMeal = () => {
    if (!mealName || selectedIngredients.length === 0 || mealMarkup === "") {
      alert("Please enter a meal name, select at least one ingredient, and provide a markup.");
      return;
    }

    const preparationPrice = calculateTotalPrice();
    const sellingPrice = calculateSellingPrice();

    const payload = {
      name: mealName,
      quantity: 1,
      recipe: JSON.stringify({
        ingredients: selectedIngredients,
        preparationPrice: preparationPrice,
        markup: mealMarkup,
      }),
      price: sellingPrice,
    };

    if (editMeal) {
      fetch(`http://localhost:3001/assembled-ingredients/${editMeal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          fetchAssembledMeals();
          setEditMeal(null);
        })
        .catch((err) => console.error(err));
    } else {
      fetch("http://localhost:3001/assembled-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          fetchAssembledMeals();
        })
        .catch((err) => console.error(err));
    }

    setMealName("");
    setMealMarkup("");
    setSelectedIngredients([]);
  };

  const handleDeleteMeal = (id) => {
    fetch(`http://localhost:3001/assembled-ingredients/${id}`, {
      method: "DELETE",
    })
      .then(() => fetchAssembledMeals())
      .catch((err) => console.error(err));
  };

  const handleEditMeal = (meal) => {
    setEditMeal(meal);
    setMealName(meal.name);
    setMealMarkup(meal.markup);
    setSelectedIngredients(meal.ingredients);
  };

  const handleServingChange = (id, newServing) => {
    setSelectedIngredients(prev =>
      prev.map(ingredient =>
        ingredient.id === id
          ? { ...ingredient, servingAmount: parseInt(newServing) }
          : ingredient
      )
    );
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="assembled-container">
      <h2>Assemble a Meal</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search for ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {filteredIngredients.length === 0 && searchQuery && (
          <span className="no-results">No ingredient found</span>
        )}
      </div>

      <h3>Select Ingredients</h3>
      <table className="ingredient-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Unit</th>
            <th>Select</th>
          </tr>
        </thead>
        <tbody>
          {filteredIngredients.map((ingredient) => (
            <tr key={ingredient.id}>
              <td>{ingredient.name}</td>
              <td>${ingredient.price.toFixed(2)}</td>
              <td>{ingredient.unit}</td>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIngredients.some((item) => item.id === ingredient.id)}
                  onChange={() => toggleIngredient(ingredient)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Selected Ingredients</h3>
      <table className="ingredient-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Serving Amount</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {selectedIngredients.map((ingredient) => (
            <tr key={ingredient.id}>
              <td>{ingredient.name}</td>
              <td>${ingredient.price.toFixed(2)}</td>
              <td>
                {ingredient.serving} x{" "}
                <select
                  value={ingredient.servingAmount}
                  onChange={(e) => handleServingChange(ingredient.id, e.target.value)}
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </td>
              <td>{ingredient.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedIngredients.length > 0 && (
        <>
          <div className="summary-box">
            <p><strong>Total Ingredients:</strong> {selectedIngredients.map((i) => i.name).join(", ")}</p>
            <p><strong>Total Cost:</strong> ${calculateTotalPrice().toFixed(2)}</p>
          </div>

          <div className="input-group under-summary">
            <input
              type="text"
              placeholder="Meal Name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Markup (%)"
              value={mealMarkup}
              onChange={(e) => {
                if (/^\d*\.?\d*$/.test(e.target.value)) {
                  setMealMarkup(e.target.value);
                }
              }}
            />
          </div>

          <button className="save-btn" onClick={handleAssembleMeal}>
            {editMeal ? "Update Meal" : "Save Meal"}
          </button>
        </>
      )}

      {assembledMeals.length > 0 && (
        <div>
          <h3>Assembled Meals</h3>
          <table className="ingredient-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Ingredients</th>
                <th>Preparation Price</th>
                <th>Markup</th>
                <th>Selling Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assembledMeals.map((meal) => (
                <tr key={meal.id}>
                  <td>{meal.name}</td>
                  <td>
                    <ul>
                      {meal.ingredients.map((ing) => (
                        <li key={ing.id}>
                          {ing.servingAmount} x {ing.name} – {ing.serving} {ing.unit}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>${meal.preparationPrice.toFixed(2)}</td>
                  <td>{meal.markup}%</td>
                  <td>${meal.sellingPrice.toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleEditMeal(meal)}>Edit</button>
                    <button onClick={() => handleDeleteMeal(meal.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals-box">
            <p>Total Preparation Price = ${assembledMeals.reduce((sum, m) => sum + m.preparationPrice, 0).toFixed(2)}</p>
            <p>Total Selling Price = ${assembledMeals.reduce((sum, m) => sum + m.sellingPrice, 0).toFixed(2)}</p>
            <p>Total Margin = ${assembledMeals.reduce((sum, m) => sum + (m.sellingPrice - m.preparationPrice), 0).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssembledIngredients;
