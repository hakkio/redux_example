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
    id: 2,
    text: "Hello Ho",
    completed: false
  },
  {
    id: 3,
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

const TodoList = ({ todos }) => (
  <ul>
    {todos.map(t => (
      <Todo
        key={todo.id}
        text={t.text}
        completed={t.completed}
        onClick={e => {
          store.dispatch({
            type: "TOGGLE_TODO",
            id: t.id
          });
        }}
      />
    ))}
  </ul>
);

class TodoApp extends React.Component {
  render() {
    const { todos, visibilityFilter } = this.props;
    const visibleTodos = getVisibleTodos(todos, visibilityFilter);
    return (
      <div>
        <input
          ref={node => {
            this.input = node;
          }}
        />
        <button
          onClick={e => {
            e.preventDefault();
            store.dispatch({
              type: "ADD_TODO",
              text: this.input.value,
              id: nextToDo++
            });
            this.input.value = "";
          }}
        >
          Add Todo
        </button>
        <TodoList todos={visibleTodos} />
        <FilterLink filter="SHOW_ALL" currentFilter={visibilityFilter}>
          ALL
        </FilterLink>
        <br />
        <FilterLink filter="SHOW_ACTIVE" currentFilter={visibilityFilter}>
          ACTIVE
        </FilterLink>
        <br />
        <FilterLink filter="SHOW_COMPLETED" currentFilter={visibilityFilter}>
          COMPLETED
        </FilterLink>
      </div>
    );
  }
}

const FilterLink = ({ filter, currentFilter, children }) => {
  if (filter === currentFilter) {
    return <span>{children}</span>;
  }
  return (
    <a
      href="#"
      onClick={e => {
        store.dispatch({
          type: "SET_VISIBILITY_FILTER",
          filter: filter
        });
      }}
    >
      {children}
    </a>
  );
};

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
