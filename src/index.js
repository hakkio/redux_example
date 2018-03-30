import React, { Component } from "react";
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
const Link = ({ active, children, onClick }) => {
  if (active) {
    return <span>{children}</span>;
  }
  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  );
};

/*
In here, basically we are turning FilterLink into a Container Component.
Therefore, at the top most level, <Footer> doesn't have to pass down props.
This is because FilterLink will now access the store directly.
The Footer component doesn't have ot pass in the OnClick and currentFilter either.
These are all now accessed through FilterLink "Container Component".
The "Link" component is now simply a presentational component. It simply shows
the link, has a "active" (or not) varible, and an onClick handler.
*/
class FilterLink extends React.Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const state = store.getState();

    if (state.visibilityFilter === this.props.filter) {
      return <span>{this.props.children}</span>;
    }
    return (
      <Link
        onClick={() => {
          store.dispatch({
            type: "SET_VISIBILITY_FILTER",
            filter: this.props.filter
          });
        }}
      >
        {this.props.children}
      </Link>
    );
  }
}

/* 
To convert the footer to a presentation component, we need ot make sure
it doesn't have any actions or behaviors.
FilterLink does have an onClick! So need to extract that
*/
const Footer = () => (
  <p>
    Show:
    <FilterLink filter="SHOW_ALL">ALL</FilterLink>
    {", "}
    <FilterLink filter="SHOW_ACTIVE">ACTIVE</FilterLink>
    {", "}
    <FilterLink filter="SHOW_COMPLETED">COMPLETED</FilterLink>
  </p>
);

/* Create another Container component.
The purpose of container components is to connect 
presentational component to the redux store and specify
the data and behavior that it needs!
*/
class VisibleTodoList extends React.Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const state = store.getState();
    return (
      <TodoList
        todos={getVisibleTodos(state.todos, state.visibilityFilter)}
        onTodoClick={id => {
          store.dispatch({
            type: "TOGGLE_TODO",
            id // this equals `id: id`
          });
        }}
      />
    );
  }
}

/*
This is the main "app" and is a container component.

This doesn't have to be a class component, so conver to functional component.
Try to do this whenever possible!
Therefore, move props into the arrow function.
Remove render().
Remove the variable that sets getVisibleTodos() and move that into the <Footer>
component itself. Then we can remove the return() as well
*/
const TodoApp = ({ todos, visibilityFilter }) => (
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

    <VisibleTodoList />

    <Footer />
  </div>
);

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
