import React from "react";
import ReactDOM from "react-dom";
import { createStore, combineReducers } from "redux";

/* Reducers */

const todo = (state, action) => {
  switch (action.type) {
    case "ADD_TODO":
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case "TOGGLE_TODO":
      if (state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};
const initialTodos = [
  {
    id: 0,
    text: "Hello there",
    completed: false
  },
  {
    id: 1,
    text: "Hello Ho",
    completed: false
  },
  {
    id: 2,
    text: "Hello Hey",
    completed: false
  }
];
const todos = (state = initialTodos, action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, todo(undefined, action)];
    case "TOGGLE_TODO":
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

const visibilityFilter = (state = "SHOW_ALL", action) => {
  switch (action.type) {
    case "SET_VISIBILITY_FILTER":
      return action.filter;
    default:
      return state;
  }
};

const todoApp = combineReducers({
  todos,
  visibilityFilter
});

/* REACT COMPONENTS */
let nextToDo = 3;

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case "SHOW_ALL":
      return todos;
    case "SHOW_COMPLETED":
      return todos.filter(t => t.completed);
    case "SHOW_ACTIVE":
      return todos.filter(t => !t.completed);
    default:
      return todos;
  }
};

/*
Convert ToDo to a presentational component.

Presentational components -> Only concerned with how things look
or how they render. Should not specify behavior.
To do this, extract the "onClick up to the props!"
Also, instead of passing in an object, pass in only the values it needs.
*/
const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? "line-through" : "none"
    }}
  >
    {text}
  </li>
);

/*
Let's convert it to a Presentational component
*/
const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map(todo => (
      <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
    ))}
  </ul>
);

/* Create another functional component AddTodo 
This one is also a presentational component */
const AddTodo = ({ onAddClick }) => {
  let input;
  return (
    <div>
      <input
        ref={node => {
          input = node;
        }}
      />
      <button
        onClick={e => {
          onAddClick(input.value);
          input.value = "";
        }}
      >
        Add Todo
      </button>
    </div>
  );
};

const FilterLink = ({ filter, currentFilter, children, onClick }) => {
  if (filter === currentFilter) {
    return <span>{children}</span>;
  }
  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault();
        onClick(filter);
      }}
    >
      {children}
    </a>
  );
};

/* 
To convert the footer to a presentation component, we need ot make sure
it doesn't have any actions or behaviors.
FilterLink does have an onClick! So need to extract that
*/
const Footer = ({ currentFilter, onFilterClick }) => (
  <p>
    Show:
    <FilterLink
      onClick={onFilterClick}
      filter="SHOW_ALL"
      currentFilter={currentFilter}
    >
      ALL
    </FilterLink>
    {", "}
    <FilterLink
      onClick={onFilterClick}
      filter="SHOW_ACTIVE"
      currentFilter={currentFilter}
    >
      ACTIVE
    </FilterLink>
    {", "}
    <FilterLink
      onClick={onFilterClick}
      filter="SHOW_COMPLETED"
      currentFilter={currentFilter}
    >
      COMPLETED
    </FilterLink>
  </p>
);

/*
This is the main "app" and is a container component
*/
class TodoApp extends React.Component {
  render() {
    const { todos, visibilityFilter } = this.props;
    const visibleTodos = getVisibleTodos(todos, visibilityFilter);

    return (
      <div>
        <AddTodo
          onAddClick={value => {
            store.dispatch({
              type: "ADD_TODO",
              text: value,
              id: nextToDo++
            });
          }}
        />

        <TodoList
          todos={visibleTodos}
          onTodoClick={id => {
            store.dispatch({
              type: "TOGGLE_TODO",
              id // this equals `id: id`
            });
          }}
        />

        <Footer
          currentFilter={visibilityFilter}
          onFilterClick={filter => {
            store.dispatch({
              type: "SET_VISIBILITY_FILTER",
              filter: filter
            });
          }}
        />
      </div>
    );
  }
}

/* MAIN APP AND STORE */

const store = createStore(todoApp);

const render = () => {
  ReactDOM.render(
    <TodoApp {...store.getState()} />,
    document.getElementById("root")
  );
};

store.subscribe(render);
render();
