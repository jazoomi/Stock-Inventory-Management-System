import React, { useState } from "react";
import "./styles/App.css";
import IngredientList from "./IngredientsList";
import IngredientsManager from "./IngredientsManager";
import ComboMeal from "./ComboMeal";
import CostCalculator from "./CostCalculator";

function App() {
  const [activePage, setActivePage] = useState("home");

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="top-nav">

        <button onClick={() => setActivePage("home")}>Home</button>
        <button onClick={() => setActivePage("ingredient-list")}>Ingredient List</button>
        <button onClick={() => setActivePage("ingredients-manager")}>Recipe Manager</button>
        <button onClick={() => setActivePage("combo-meal")}>Combo Meal</button>
        <button onClick={() => setActivePage("cost-calculator")}>Cost Calculator</button>
      </nav>

      {/* Render the active page */}
      <div className="page-content">
        {activePage === "home" && <Home />}
        {activePage === "ingredient-list" && <IngredientList />}
        {activePage === "ingredients-manager" && <IngredientsManager />}
        {activePage === "combo-meal" && <ComboMeal />}
        {activePage === "cost-calculator" && <CostCalculator />}
      </div>
    </div>
  );
}

// Simple Home Page Component
const Home = () => (
  <div className="home-container">
    <h1>Welcome to the Ingredients Manager</h1>
    <p>Select a page from the navigation bar above.</p>

    <div className="template-download">
      <h2>Will you be importing your ingredients?</h2>
      <p>You can download the pre-formatted Excel file below, fill in your ingredients, and import it using the Ingredient List page.</p>
      <a
        href="http://localhost:3001/ingredient-template.xlsx"
        download
        className="download-button"
      >
        Download Import Template
      </a>
    </div>
  </div>
);

export default App;
