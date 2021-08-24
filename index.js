const ADD_GOAL = "ADD_GOAL";
const REMOVE_GOAL = "REMOVE_GOAL";
const ADD_TODO = "ADD_TODO";
const REMOVE_TODO = "REMOVE_TODO";
const TOGGLE_TODO = "TOGGLE_TODO";

const generateId = () =>
  Math.random().toString(36).substring(2) + new Date().getTime().toString(36);

function addTodoAction(todo) {
  return {
    type: ADD_TODO,
    todo,
  };
}

const removeTodoAction = (id) => ({
  type: REMOVE_TODO,
  id,
});

const toggleTodoAction = (id) => ({
  type: TOGGLE_TODO,
  id,
});

const addGoalAction = (goal) => ({
  type: ADD_GOAL,
  goal,
});

const removeGoalAction = (id) => ({
  type: REMOVE_GOAL,
  id,
});



// reducers
const todos = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      return state.concat([action.todo]);
    case REMOVE_TODO:
      return state.filter((todo) => todo.id !== action.id);
    case TOGGLE_TODO:
      return state.map((todo) =>
        todo.id !== action.id
          ? todo
          : Object.assign({}, todo, { complete: !todo.complete })
      );
    default:
      return state;
  }
};
const goals = (state = [], action) => {
  switch (action.type) {
    case ADD_GOAL:
      return state.concat([action.goal]);
    case REMOVE_GOAL:
      return state.filter((goal) => goal.id !== action.id);
    default:
      return state;
  }
};

const combineReducers = Redux.combineReducers({
    todos,
    goals
})

const checkAndDispatch = (store, action) =>{
    if(action.type === ADD_TODO && action.todo.name.toLowerCase().includes('bitcoin')){
      return alert ("Nope, that's a bad idea")
    }
    if(action.type === ADD_GOAL && action.goal.name.toLowerCase().includes('bitcoin')){
      return alert ("Nope, that's a bad idea")
    }
    return store.dispatch(action)
  }

const store = Redux.createStore(combineReducers);

store.subscribe(() => {
  const { goals, todos } = store.getState();
  document.getElementById("goals").innerHTML = "";
  document.getElementById("todos").innerHTML = "";
  goals.forEach(addGoalToDom);
  todos.forEach(addTodoToDom);
});

const addTodo = () => {
  const input = document.getElementById("todo");
  const name = input.value;
  input.value = "";

  name &&
   checkAndDispatch(store,
      addTodoAction({
        name,
        complete: false,
        id: generateId(),
      })
    );
};
const addGoal = () => {
  const input = document.getElementById("goal");
  const name = input.value;
  input.value = "";
  name &&
    checkAndDispatch(store,
      addGoalAction({
        name,
        id: generateId(),
      })
    );
};

document.getElementById("todoBtn").addEventListener("click", addTodo);
document.getElementById("goalBtn").addEventListener("click", addGoal);

const createRemoveButton = (onClick) => {
  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "X";
  removeBtn.addEventListener("click", onClick);
  return removeBtn;
};

const addTodoToDom = (todo) => {
  const node = document.createElement("li");
  const text = document.createTextNode(todo.name);
  const removeBtn = createRemoveButton(() =>
    store.dispatch(removeTodoAction(todo.id))
  );
  node.appendChild(text);
  node.appendChild(removeBtn);
  node.style.textDecoration = todo.complete ? "line-through" : "none";
  node.addEventListener("click", () =>
    store.dispatch(toggleTodoAction(todo.id))
  );

  document.getElementById("todos").appendChild(node);
};
const addGoalToDom = (goal) => {
  const node = document.createElement("li");
  const text = document.createTextNode(goal.name);
  const removeBtn = createRemoveButton(() =>
    store.dispatch(removeGoalAction(goal.id))
  );
  node.appendChild(text);
  node.appendChild(removeBtn);
  document.getElementById("goals").appendChild(node);
};
