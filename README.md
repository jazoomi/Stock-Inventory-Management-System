# Stock Inventory Management System

A customizable desktop stock inventory management software built for businesses to track inventory metrics effortlessly.

## 🚀 Live Demo & Walkthrough
[![Live Video Demo](https://shields.io)](https://github.com/user-attachments/assets/3a563b3f-7b68-4318-a6bd-2780c7907673)

> 💡 **System Note:** This application runs natively on the desktop via Electron. You can view a complete functional walkthrough in the [Interactive App Demo Video](https://github.com/user-attachments/assets/3a563b3f-7b68-4318-a6bd-2780c7907673).


---

### 🛠️ Built With
* **Runtime Framework:** Electron (Desktop App Environment)
* **Build System & Bundler:** Vite
* **Frontend Architecture:** HTML5, CSS3, JavaScript / TypeScript
* **Testing Framework:** Jest
* **Code Styling & Quality:** ESLint

---

### 💻 Installation & Local Run Instructions

To run this desktop app locally, clone the repository, navigate into the project directory, and run the following commands:

```bash
# Install all required project dependencies
npm i

# Build the production assets
npm run build

# Boot the application in Electron development mode
npm run dev:electron
```

---

# Features

## Ingredient Manager
![Ingredient Manager Interface](https://github.com/user-attachments/assets/47030042-d800-4b6a-8076-8b280041c66c)
This is where users add, edit, and delete ingredients. Ingredients can be imported/exported to and from Excel, and stock can be reduced dynamically based on ingredients consumed by active recipes and combo meals.

## Recipe Creator
![Recipe Creator Interface](https://github.com/user-attachments/assets/a8a9fd50-2e74-4a45-bc7d-69913f7b047f)
Here, users can combine individual raw ingredients to form full menu items, customizing serving sizes and calculating accurate batch assembly costs.

## Combo Creator
![Combo Creator Interface](https://github.com/user-attachments/assets/95312fcb-dd4b-48e6-a165-2b31752f69c6)
Users can seamlessly bundle assembled meals alongside raw standalone ingredients to build dynamic combos, applying configurable custom percentage markdowns to maximize customer value profiles.

---

# Key Milestone Updates (Iteration 3)
This deployment addresses critical core epic stories to finalize business logic requirements:
- **Data Portability:** Added comprehensive Excel Import / Export utilities for bulk inventory updates.
- **Analytics Dashboard:** Integrated profit metric calculations to visually surface the highest and lowest margin assets.
- **Unified UX Flow:** Enhanced interface cohesion across workspace modules.
- **Modernized UI:** Refined layouts and interactive components for smoother navigation.
