import React, { useState, useEffect } from "react";
import AssembledIngredients from "./AssembledIngredients";

const IngredientsManager = () => {
  const [ingredients, setIngredients] = useState([]);

  // Fetch ingredients from backend
  const fetchIngredients = () => {
    fetch("http://localhost:3001/raw-ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error("Error fetching ingredients:", err));
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <div>
      <h1>Recipe Manager</h1>
      <AssembledIngredients ingredients={ingredients} />
    </div>
  );
};

export default IngredientsManager;