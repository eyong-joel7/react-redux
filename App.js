React;

const ADD_GOAL = "ADD_GOAL";
const REMOVE_GOAL = "REMOVE_GOAL";
const ADD_TODO = "ADD_TODO";
const REMOVE_TODO = "REMOVE_TODO";
const TOGGLE_TODO = "TOGGLE_TODO";
const RECEIVE_DATA = 'RECEIVE_DATA'

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

const getAllDataAction = (todos, goals) => ({
    type: RECEIVE_DATA,
    todos,
    goals,
})

const handleDeleteTodo = (todo) => {
  return (dispatch) => {
    dispatch(removeTodoAction(todo.id));
    return API.deleteTodo(todo.id).catch(() => {
      dispatch(addTodoAction(todo))
      alert('An error occured')
    });
  }
}
const handleDeleteGoal = (goal) => {
  return (dispatch) => {
    dispatch(removeGoalAction(goal.id));
    return API.deleteGoal(goal.id).catch(() => {
      dispatch(addGoalAction(goal))
      alert('An error occured')
    });
  }
}

const handleAddGoal = (goal, cb) => {
return (dispatch) => {
  return API.saveGoal(goal)
  .then(
    (goal) => {dispatch(addGoalAction(goal))
    cb();
    }
  )
  .catch(() => alert("An error occured please try again"));

}
}
const handleAddTodo = (todo, cb) => {
return (dispatch) => {
  return API.saveTodo(todo)
  .then(
    (todo) => {dispatch(addTodoAction(todo))
    cb();
    }
  )
  .catch(() => alert("An error occured please try again"));

}
}

const handleToggleTodo = (id) => {
  return (dispatch) => {
    dispatch(toggleTodoAction(id));
    return API.saveTodoToggle(id)
    .catch(() => {
     dispatch(toggleTodoAction(id))
      alert('An error occured. Fail to toggle Item');
    }
    );
  }
}

const handleInitialData = () =>{
  return(dispatch) => {
    Promise.all([
      API.fetchTodos(),
      API.fetchGoals()
    ]).then(([ todos, goals ]) => {
       dispatch(getAllDataAction(todos, goals));
    })
  }
}
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
      case RECEIVE_DATA: 
      return action.todos
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
    case RECEIVE_DATA: 
    return action.goals
      default:
      return state;
  }
};
const loading = (state = true, action)=> {
switch(action.type){
    case RECEIVE_DATA: 
    return false
    default:
      return state
}
}

// combine reducers
const combineReducers = Redux.combineReducers({
  todos,
  goals,
  loading
});


// Middlewares
const checker = (store) => (next) => (action) => {
  if (
    action.type === ADD_TODO &&
    action.todo.name.toLowerCase().includes("bitcoin")
  ) {
    return alert("Nope, that's a bad idea");
  }
  if (
    action.type === ADD_GOAL &&
    action.goal.name.toLowerCase().includes("bitcoin")
  ) {
    return alert("Nope, that's a bad idea");
  }
  return next(action);
};

const logger = (store) => (next) => (action) => {
  console.group(action.type);
  console.log("The action", action);
  const result = next(action);
  console.log("The new state is", store.getState());
  console.groupEnd();
  return result;
};


// store
const store = Redux.createStore(
  combineReducers,
  Redux.applyMiddleware(ReduxThunk.default, checker, logger)
);


// React UI
const List = ({items, removeItem, toggleHandler}) => {

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}  onClick = { () => toggleHandler && toggleHandler(item.id) }>
            {/* onClick = {() => toggleHandler ? toggleHandler(item.id)} */}
          {" "}
          <span style = {{textDecorationLine: item.complete? 'line-through' : 'none'}}>{item.name}</span>
          <button onClick = {()=> removeItem(item)}>X</button>
        </li>
      ))}
    </ul>
  );
};

class Todos extends React.Component {
  addItem = (e) => {
    e.preventDefault();
    const name = this.input.value;
    if(name.length > 0) this.props.store.dispatch(handleAddTodo(name, () =>  this.input.value = ""))
  };

  removeItem = (todo) => {
    this.props.store.dispatch(handleDeleteTodo(todo));
  }

  toggleHandler = (id) => {
    this.props.store.dispatch(handleToggleTodo(id))
}
  render() {
    const {todos}  = this.props;
    return (
      <div>
        <h1>Todo List</h1>
        <input
          type="text"
          placeholder="Add Todo"
          ref={(input) => (this.input = input)}
        />
        <button onClick={this.addItem}>Add Todo</button>
        <List items = {todos} removeItem = {this.removeItem} toggleHandler = {this.toggleHandler}/>
      </div>
    );
  }
}

class Goals extends React.Component {
  
    addItem = (e) => {
        e.preventDefault();
        const name = this.input.value;
        name.length > 0 && this.props.store.dispatch(handleAddGoal(name, () => this.input.value = ''));
      };


      removeItem = (goal) => {
        this.props.store.dispatch(handleDeleteGoal(goal));
      }
      
  render() {
      const {goals}  = this.props;
    return (
        <div>
        <h1>Goal List</h1>
        <input
          type="text"
          placeholder="Add Goal"
          ref={(input) => (this.input = input)}
        />
        <button onClick={this.addItem}>Add Todo</button>
        <List items = {goals} removeItem = {this.removeItem}/>
      </div>
    );
  }
}

class App extends React.Component {
    componentDidMount(){
    
        const {store}  = this.props;
        store.dispatch(handleInitialData());
        store.subscribe(()=> this.forceUpdate())
  
    }
  render() {
    const {store}  = this.props;
    const { goals, todos, loading } = store.getState();
   if(loading) return <h3>loading ...</h3>
    return (
      <div>
        <Todos todos = {todos} store = {store}/>
        <Goals goals = {goals} store = {store}/>
      </div>
    );
  }
}

ReactDOM.render(<App store = {store} />, document.getElementById("app"));
