import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "./styles/Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const Dashboard = () => {
  const [assembledMeals, setAssembledMeals] = useState([]);

  useEffect(() => {
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
            preparationPrice: parsedRecipe.preparationPrice || 0,
            sellingPrice: parseFloat(item.price) || 0,
          };
        });
        setAssembledMeals(meals);
      })
      .catch((err) => console.error("Error fetching assembled meals:", err));
  }, []);

  // Calculate metrics
  const totalFoodCost = assembledMeals.reduce(
    (sum, meal) => sum + meal.preparationPrice,
    0
  );

  const averageMarkup =
    assembledMeals.length > 0
      ? assembledMeals.reduce(
        (sum, meal) =>
          sum + ((meal.sellingPrice - meal.preparationPrice) / meal.preparationPrice) * 100,
        0
      ) / assembledMeals.length
      : 0;

  const highestProfitItem =
    assembledMeals.length > 0
      ? assembledMeals.reduce((max, meal) =>
        meal.sellingPrice - meal.preparationPrice >
          max.sellingPrice - max.preparationPrice
          ? meal
          : max
      )
      : null;

  // For chart
  const mealsWithMetrics = assembledMeals.map((meal) => ({
    name: meal.name,
    profit: meal.sellingPrice - meal.preparationPrice,
    markup: (meal.sellingPrice - meal.preparationPrice) / meal.preparationPrice * 100,
  }));

  // Top 5 meals with lowest profit (descending order)
  const lowestProfitMeals = mealsWithMetrics
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 3);

  // Top 5 meals with highest profit (ascending order)
  const highestProfitMeals = mealsWithMetrics
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 3);

  // Data for lowest profit chart
  const lowestProfitChartData = {
    labels: lowestProfitMeals.map((meal) => meal.name),
    datasets: [
      {
        label: "Profit ($)",
        data: lowestProfitMeals.map((meal) => meal.profit.toFixed(2)),
        backgroundColor: "#FFFAF0",
        borderColor: "rgb(226, 213, 169)",
        borderWidth: 2,
        barPercentage: 0.5,
      },
    ],
  };

  // Data for highest profit chart
  const highestProfitChartData = {
    labels: highestProfitMeals.map((meal) => meal.name),
    datasets: [
      {
        label: "Profit ($)",
        data: highestProfitMeals.map((meal) => meal.profit.toFixed(2)),
        backgroundColor: "#FFFAF0",
        borderColor: "rgb(226, 213, 169)",
        borderWidth: 2,
        barPercentage: 0.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          font: {
            size: 16,  // Change to the size you want
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 14,  // Adjust the y-axis label size if needed
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const datasetIndex = tooltipItem.datasetIndex;
            const dataIndex = tooltipItem.dataIndex;
            const value = tooltipItem.raw;

            // Get the corresponding markup value
            const markupValue = datasetIndex === 0
              ? lowestProfitMeals[dataIndex].markup.toFixed(2) + "%"
              : highestMarkupMeals[dataIndex].markup.toFixed(2) + "%";

            return `Profit: $${value}, Markup: ${markupValue}`;
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "right",
        color: "#000",
        formatter: (value, context) => {
          const index = context.dataIndex;
          return `${lowestProfitMeals[index].markup.toFixed(2)}%`;
        },
      },
    },
  };

  return (
<div>
    <h2 style={{ fontSize: "40px", fontWeight: "bold" }}>Dashboard</h2>
    <p><strong>Total Assembled Meals:</strong> {assembledMeals.length}</p>
    <p><strong>Total Food Cost:</strong> ${totalFoodCost.toFixed(2)}</p>
    <p><strong>Average Markup:</strong> {averageMarkup.toFixed(2)}%</p>
    {highestProfitItem && (
      <p>
        <strong>Highest Profit Item:</strong> {highestProfitItem.name} (${(highestProfitItem.sellingPrice - highestProfitItem.preparationPrice).toFixed(2)} profit)
      </p>
    )}

    {/* Charts Container */}
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginTop: "30px" }}>
      
      {/* Chart for highest profit items */}
      <div style={{ width: "45%" }}>
        <h3>Top 3 Highest Profit Items</h3>
        <Bar data={highestProfitChartData} options={chartOptions} />
      </div>

      {/* Chart for lowest profit items */}
      <div style={{ width: "45%" }}>
        <h3>Top 3 Lowest Profit Items</h3>
        <Bar key={JSON.stringify(lowestProfitMeals)} data={lowestProfitChartData} options={chartOptions} />
      </div>

    </div>
  </div>
  );
};

export default Dashboard;