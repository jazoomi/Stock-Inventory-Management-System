import './App.css'
import IngredientList from './IngredientsList'
import IngredientsManager from './IngredientsManager'
import ComboMeal from './ComboMeal'
import CostCalculator from './CostCalculator'


function App() {

  return (
    <>
      <div className="App">
        <h>Guests</h>
        <IngredientList/>
        <IngredientsManager/>
        <ComboMeal/>
        <CostCalculator/>
        

      </div>
    </>
  )
}

export default App
