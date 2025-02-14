import './App.css'
import IngredientList from './IngredientsList'
import IngredientsManager from './IngredientsManager'
import ComboMeal from './ComboMeal'

function App() {

  return (
    <>
      <div className="App">
        <h>Guests</h>
        <IngredientList/>
        <IngredientsManager/>
        <ComboMeal/>
        

      </div>
    </>
  )
}

export default App
