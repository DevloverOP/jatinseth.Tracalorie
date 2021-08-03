class Storage {
  constructor() {
    this.container = [];
  }

  store(mealdata) {
    if (localStorage.getItem("meals") === null) {
      this.container = [];
    } else {
      this.container = JSON.parse(localStorage.getItem("meals"));
    }
    this.container.push(mealdata);
    localStorage.setItem("meals", JSON.stringify(this.container));
  }

  fetchData() {
    if (localStorage.getItem("meals") !== null) {
      return JSON.parse(localStorage.getItem("meals"));
    } else return [];
  }

  clear() {
    localStorage.clear();
  }

  update(id, newData) {
    let temp = this.fetchData();
    temp.forEach((meal) => {
      if (meal.id === id) {
        meal.name = newData.name;
        meal.calories = newData.calories;
      }
    });
    this.container = temp;
    localStorage.setItem("meals", JSON.stringify(this.container));
  }
  deleteFromStore(id) {
    let temp = this.fetchData();
    temp.forEach((meal, index) => {
      if (meal.id === id) {
        temp.splice(index, 1);
      }
    });
    this.container = temp;
    localStorage.setItem("meals", JSON.stringify(this.container));
  }
}

let LS = new Storage();

// UI
const UIctrl = (function () {
  const selectors = {
    meal: "#meal",
    calories: "#cals",
    lists: ".list",
    tCals: "#totalcal",
    pencil: ".edit",
    editBtns: "#editpane",
    addmeals: "#addmeal",
    update: "#updmeal",
    delete: "#delmeal",
    back: "#back",
    clearAll: "#clear",
  };

  //populate list
  const populateData = function (mealsData = []) {
    document.querySelector(selectors.lists).innerHTML = "";
    mealsData.forEach((meal) => {
      let li = document.createElement("li");
      li.innerHTML += `<strong>${meal.name}</strong>
                     <em>${meal.calories}</em>
                     <a href=""class="edit"></a>`;
      document.querySelector(selectors.lists).appendChild(li);
    });
  };
  //To show or Hide Edit panel
  const Editpane = function (action) {
    let bt = document.querySelector(selectors.editBtns).children;
    bt = Array.from(bt);
    bt.forEach((child) => {
      if (action === "show") {
        if (child.getAttribute("id") === "addmeal") {
          child.setAttribute("style", "display:none");
        } else child.setAttribute("style", "display:inline-block");
      } else if (action === "hide") {
        if (child.getAttribute("id") === "addmeal") {
          child.setAttribute("style", "display:inline-block");
        } else child.setAttribute("style", "display:none");
      }
    });
  };

  // Clearing the input fields
  const clearfields = function () {
    document.querySelector(selectors.meal).value = "";
    document.querySelector(selectors.calories).value = "";
  };

  //setting fields to update
  const setFields = function (listitem) {
    document.querySelector(selectors.meal).value = listitem[0].innerHTML;
    document.querySelector(selectors.calories).value = listitem[1].innerHTML;
    return { name: listitem[0].innerHTML, calories: listitem[1].innerHTML };
  };

  const editControls = function (e, callback) {
    e.preventDefault();
    if (e.target.className === "edit") {
      //show editpane
      Editpane("show");
      callback(setFields(e.target.parentElement.children));
    }
  };
  const hideControls = function () {
    //hide editpane
    Editpane("hide");
    //clear fields
    clearfields();
  };

  return {
    getselectors: selectors,
    populate: populateData,
    editpane: editControls,
    hideEditpane: hideControls,
    clear: clearfields,
  };
})();

// items
const ItemCtrl = (function () {
  let meals = [];
  //load data
  const loadData = function () {
    meals = LS.fetchData();
    console.log("laded", meals);
    return meals;
  };

  //adding meals to the data structure
  const additems = function (item) {
    let mealObj = { id: 0, name: "", calories: "" };
    if (item.name !== "" && item.calories !== "") {
    
      //checking for repeated value
   if((meals.filter((meal)=>{return meal.name===item.name;})).length===0){
      mealObj.id = meals.length + 1 - 1;
      mealObj.name = item.name;
      mealObj.calories = item.calories;
      meals.push(mealObj);
      LS.store(mealObj);
      return meals;
     }else alert('already Exists !!');}
  };

  //Calculating total calories
  const totalCals = function () {
    let cal = 0;
    if (meals.length > 0) {
      meals.forEach((meal) => {
        cal += parseInt(meal.calories);
      });
      return cal;
    } else return 0;
  };

  // getting meal to update
  const getMealData = function (gotmeal) {
    //console.log(gotmeal);
    return meals.find((meal) => {
      return meal.name === gotmeal.name && meal.calories === gotmeal.calories;
    });
  };

  //Update the meal
  const updateData = function (id, newData) {
    LS.update(id, newData);
  };
  // delete the meal
  const deleteData = function (id) {
    LS.deleteFromStore(id);
  };

  return {
    newmeal: additems,
    getTotalCals: totalCals,
    loadmeals: loadData,
    getMeal: getMealData,
    updateMeal: updateData,
    DeleteMeal: deleteData,
  };
})();

// App initials
const App = (function (ui, itemctr) {
  this.ID;
  // getting input data
  const getInputMeals = function () {
    let addedmeal = {
      name: document.querySelector(ui.getselectors.meal).value,
      calories: document.querySelector(ui.getselectors.calories).value,
    };
    return addedmeal;
  };

  // adding meal process
  const addmeal = function () {
    let meal = getInputMeals(); //getting meal
    if ((meals = itemctr.newmeal(meal))) {
      //add to data
      ui.populate(meals); //adding to ui
      ui.clear();
      setTotalCals();
    }
  };

  //setting total calories
  const setTotalCals = function () {
    let Tcals = itemctr.getTotalCals();
    document.querySelector(
      ui.getselectors.tCals
    ).innerHTML = `Total Calories:${Tcals}`;
  };

  //clearing all data
  const clearAllData = function () {
    LS.clear();
    ui.populate(itemctr.loadmeals());
    setTotalCals();
  };

  const getID = (e) => {
    ui.editpane(e, (data) => {
      this.ID = itemctr.getMeal(data).id;
    });
  };

  const Update = function () {
    let updData = getInputMeals();
    itemctr.updateMeal(ID, updData);
    ui.populate(itemctr.loadmeals());
    setTotalCals();
    ui.clear();
    ui.hideEditpane();
    alert("Meal Updated.")
  };

  const deleteMeal = function () {
    console.log(ID);
    itemctr.DeleteMeal(ID);
    ui.clear();
    ui.populate(itemctr.loadmeals());
    setTotalCals();
    ui.hideEditpane();
    alert("Meal Deleted.")
  };

  return {
    start: function () {
      //load DATA
      ui.populate(itemctr.loadmeals());
      setTotalCals();
      // add meal
      document
        .querySelector(ui.getselectors.addmeals)
        .addEventListener("click", addmeal);
      //Edit data
      document.body.addEventListener("click", getID);

      //back to add meal
      document
        .querySelector(ui.getselectors.back)
        .addEventListener("click", ui.hideEditpane);
      //clear All data
      document
        .querySelector(ui.getselectors.clearAll)
        .addEventListener("click", clearAllData);
      //clear All data
      document
        .querySelector(ui.getselectors.update)
        .addEventListener("click", Update);
      //delete the meal
      document
        .querySelector(ui.getselectors.delete)
        .addEventListener("click", deleteMeal);
    },
  };
})(UIctrl, ItemCtrl);

App.start();
