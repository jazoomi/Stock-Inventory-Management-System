import React, { useState, useEffect } from "react";

const AssembledIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [mealName, setMealName] = useState("");
  const [mealPercentage, setMealPercentage] = useState("");
  const [assembledMeals, setAssembledMeals] = useState([]);
  const [editMeal, setEditMeal] = useState(null); // Track which meal is being edited
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch raw ingredients from DB
  useEffect(() => {
    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error("Error fetching ingredients:", err));

    // Also fetch assembled meals from DB
    fetchAssembledMeals();
  }, []);

  // 2. Helper to fetch assembled meals from DB
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
            percentage: parsedRecipe.percentage || "",
            ingredients: parsedRecipe.ingredients || [],
          };
        });
        setAssembledMeals(meals);
      })
      .catch((err) => console.error("Error fetching assembled meals:", err));
  };

  // 3. Toggle ingredient selection
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

  // 4. Calculate total price of selected raw ingredients
  const calculateTotalPrice = () => {
    return selectedIngredients.reduce(
      (total, ingredient) => total + ingredient.price,
      0
    );
  };

  // 5. Calculate selling price based on percentage
  const calculateSellingPrice = () => {
    const totalPrice = calculateTotalPrice();
    const percentage = parseFloat(mealPercentage) || 0;
    return totalPrice + totalPrice * (percentage / 100);
  };

  // 6. Create or update an assembled meal
  const handleAssembleMeal = () => {
    if (!mealName || selectedIngredients.length === 0 || mealPercentage === "") {
      alert(
        "Please enter a meal name, select at least one ingredient, and provide a percentage."
      );
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
        percentage: mealPercentage,
      }),
      price: sellingPrice,
    };

    if (editMeal) {
      fetch(`http://localhost:3001/assembled-ingredients/${editMeal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error updating assembled meal");
          }
          return res.json();
        })
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
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error creating assembled meal");
          }
          return res.json();
        })
        .then(() => {
          fetchAssembledMeals();
        })
        .catch((err) => console.error(err));
    }

    setMealName("");
    setMealPercentage("");
    setSelectedIngredients([]);
  };

  // 7. Delete a meal from DB
  const handleDeleteMeal = (id) => {
    fetch(`http://localhost:3001/assembled-ingredients/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error deleting assembled meal");
        }
        fetchAssembledMeals();
      })
      .catch((err) => console.error(err));
  };

  // 8. Start editing a meal
  const handleEditMeal = (meal) => {
    setEditMeal(meal);
    setMealName(meal.name);
    setMealPercentage(meal.percentage);
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
    <div>
      <h2>Assemble a Meal</h2>

      {/* Meal Name and Percentage */}
      <div>
        <label>
          Meal Name:
          <input
            type="text"
            placeholder="Meal Name"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Percentage (%):
          <input
            type="text"
            placeholder="Percentage (%)"
            value={mealPercentage}
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.target.value)) {
                setMealPercentage(e.target.value);
              }
            }}
          />
        </label>
      </div>

      {/* Add search bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* Display message if no ingredients found */}
        {filteredIngredients.length === 0 && searchQuery && (
          <span style={{ color: 'red', marginLeft: '10px' }}> No ingredient found</span>
        )}
      </div>

      {/* Ingredient Selection Table */}
      <h3>Select Ingredients</h3>
      <table border="1" style={{ width: "100%", marginBottom: "20px" }}>
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
                  checked={selectedIngredients.some(
                    (item) => item.id === ingredient.id
                  )}
                  onChange={() => toggleIngredient(ingredient)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Show selected ingredients */}
      <h3>Selected Ingredients</h3>
      <table border="1" style={{ width: "100%", marginBottom: "20px" }}>
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
              <td>{ingredient.serving} x{" "}
                <select
                  value={ingredient.servingAmount}
                  onChange={(e) => handleServingChange(ingredient.id, e.target.value)}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const value = i + 1;
                    return (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    );
                  })}
                </select>
              </td>
              <td>{ingredient.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedIngredients.length > 0 && (
        <div>
          <p>
            <strong>Total Ingredients:</strong>{" "}
            {selectedIngredients.map((ingredient) => ingredient.name).join(", ")}
          </p>
          <p>
            <strong>Total Cost:</strong> ${calculateTotalPrice().toFixed(2)}
          </p>
        </div>
      )}

      {/* Save or Update Meal */}
      <button onClick={handleAssembleMeal}>
        {editMeal ? "Update Meal" : "Save Meal"}
      </button>

      {/* Assembled Meals Table */}
      {assembledMeals.length > 0 && (
        <div>
          <h3>Assembled Meals</h3>
          <table border="1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Ingredients (Name & Serving Amount)</th>
                <th>Preparation Price ($)</th>
                <th>Percentage (%)</th>
                <th>Selling Price ($)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assembledMeals.map((meal) => (
                <tr key={meal.id}>
                  <td>{meal.name}</td>
                  <td>
                    <ul>
                      {meal.ingredients.map((ingredient) => (
                        <li key={ingredient.id}>
                          {ingredient.servingAmount} x{" "}
                          {ingredient.name} -{" "} 
                          {ingredient.serving} {" "}
                          {ingredient.unit} per serving
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>${meal.preparationPrice.toFixed(2)}</td>
                  <td>{meal.percentage}%</td>
                  <td>${meal.sellingPrice.toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleEditMeal(meal)}>Edit</button>
                    <button onClick={() => handleDeleteMeal(meal.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Display Total Preparation, Selling Price, and Margin */}
      {assembledMeals.length > 0 && (
        <div
          style={{
            border: "2px solidrgb(10, 166, 10)",
            padding: "10px",
            width: "300px",
            marginTop: "20px",
            borderRadius: "10px",
            fontWeight: "bold",
          }}
        >
          <p>
            Total Preparation Price = $
            {assembledMeals
              .reduce((sum, meal) => sum + meal.preparationPrice, 0)
              .toFixed(2)}
          </p>
          <p>
            Total Selling Price = $
            {assembledMeals
              .reduce((sum, meal) => sum + meal.sellingPrice, 0)
              .toFixed(2)}
          </p>
          <p>
            Total Margin = $
            {assembledMeals
              .reduce(
                (sum, meal) => sum + (meal.sellingPrice - meal.preparationPrice),
                0
              )
              .toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssembledIngredients;