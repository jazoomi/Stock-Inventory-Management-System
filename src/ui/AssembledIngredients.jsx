import React, { useState, useEffect } from "react";

const AssembledIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [mealName, setMealName] = useState("");
  const [mealPercentage, setMealPercentage] = useState("");
  const [assembledMeals, setAssembledMeals] = useState([]);
  const [editMeal, setEditMeal] = useState(null); // State to track which meal is being edited

  // Fetch ingredients from DB
  useEffect(() => {
    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error("Error fetching ingredients:", err));
  
    // Also fetch assembled meals from DB
    fetchAssembledMeals();
  }, []);

// fetch assembled meals from DB
const fetchAssembledMeals = () => {
  fetch("http://localhost:3001/assembled-ingredients")
    .then((res) => res.json())
    .then((data) => {
      const meals = data.map((item) => {
        let parsedRecipe = {};
        try {
          parsedRecipe = JSON.parse(item.recipe); // recipe is JSON with extra info
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


  // Handle ingredient selection
  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.some((item) => item.id === ingredient.id)) {
      setSelectedIngredients(selectedIngredients.filter((item) => item.id !== ingredient.id));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  // Calculate total price of selected ingredients
  const calculateTotalPrice = () => {
    return selectedIngredients.reduce((total, ingredient) => total + ingredient.price, 0);
  };

  // Calculate selling price based on percentage
  const calculateSellingPrice = () => {
    const totalPrice = calculateTotalPrice();
    const percentage = parseFloat(mealPercentage) || 0;
    return totalPrice + (totalPrice * (percentage / 100)); // Add percentage to total price
  };

  // Handle saving the assembled meal
  const handleAssembleMeal = () => {
    if (!mealName || selectedIngredients.length === 0 || mealPercentage === "") {
      alert("Please enter a meal name, select at least one ingredient, and provide a percentage.");
      return;
    }

    const preparationPrice = calculateTotalPrice();
    const sellingPrice = calculateSellingPrice();

    const newMeal = {
      id: Date.now(), // Temporary ID
      name: mealName,
      preparationPrice: preparationPrice,
      percentage: mealPercentage,
      sellingPrice: sellingPrice,
      ingredients: selectedIngredients,
    };

    if (editMeal) {
      // Update existing meal (PUT)
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
          setEditMeal(null); // exit edit mode
        })
        .catch((err) => console.error(err));
    } else {
      // Create new meal (POST)
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
    

    // Reset fields
    setMealName("");
    setMealPercentage("");
    setSelectedIngredients([]);
  };

  // Handle edit button click
  const handleEditMeal = (meal) => {
    setEditMeal(meal); // Set the meal to be edited
    setMealName(meal.name); // Set form fields to meal values
    setMealPercentage(meal.percentage);
    setSelectedIngredients(meal.ingredients);
  };

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
          {ingredients.map((ingredient) => (
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

      {/* Show selected ingredients with detailed tags */}
      <h3>Selected Ingredients</h3>
      <table border="1" style={{ width: "100%", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {selectedIngredients.map((ingredient) => (
            <tr key={ingredient.id}>
              <td>{ingredient.name}</td>
              <td>${ingredient.price.toFixed(2)}</td>
              <td>{ingredient.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Show total ingredients' names and total cost */}
      {selectedIngredients.length > 0 && (
        <div>
          <p><strong>Total Ingredients:</strong> {selectedIngredients.map((ingredient) => ingredient.name).join(", ")}</p>
          <p><strong>Total Cost:</strong> ${calculateTotalPrice().toFixed(2)}</p>
        </div>
      )}

      {/* Save Meal Button */}
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
                <th>Ingredients (Name & Cost)</th>
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
                          {ingredient.name} - ${ingredient.price.toFixed(2)} {ingredient.unit ? `per ${ingredient.unit}` : ""}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>${meal.preparationPrice.toFixed(2)}</td>
                  <td>{meal.percentage}%</td>
                  <td>${meal.sellingPrice.toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleEditMeal(meal)}>Edit</button>
                    <button onClick={() => handleDeleteMeal(meal.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assembledMeals.length > 0 && (
        <div style={{
          border: "2px solid black",
          padding: "10px",
          width: "300px",
          marginTop: "20px",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9",
          fontWeight: "bold"
        }}>
          <p>Total Preparation Price = ${assembledMeals.reduce((sum, meal) => sum + meal.preparationPrice, 0).toFixed(2)}</p>
          <p>Total Selling Price = ${assembledMeals.reduce((sum, meal) => sum + meal.sellingPrice, 0).toFixed(2)}</p>
          <p>Total Margin = ${(assembledMeals.reduce((sum, meal) => sum + (meal.sellingPrice - meal.preparationPrice), 0)).toFixed(2)}</p>
        </div>
      )}

    </div>
  );
};

export default AssembledIngredients;
