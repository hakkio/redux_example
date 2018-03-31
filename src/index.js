import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { createStore, combineReducers } from "redux";

// Import Provider
import { Provider } from "react-redux";

//
import { connect } from "react-redux";

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
  <ul>{todos.map(todo => <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />)}</ul>
);

/* Create another functional component AddTodo 
This one is also a presentational component */
let nextToDo = 3;
let AddTodo = ({ dispatch }) => {
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
          dispatch({
            type: "ADD_TODO",
            text: input.value,
            id: nextToDo++
          });
          input.value = "";
        }}
      >
        Add Todo
      </button>
    </div>
  );
};


// AddTodo = connect(
//   null, // No need to subscribe the store
//   dispatch => {
//     return { dispatch };
//   }
// )(AddTodo)

// Since dispatch is returning dispatch, it can be removed
// Since both arguments are null, then we can just do this:
AddTodo = connect()(AddTodo)

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
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const { store } = this.context;
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
FilterLink.contextTypes = {
  store: PropTypes.object
};

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

/* Using mapStateToProps() */

const mapStateToTodoListProps = state => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  };
};

const mapDispatchToTodoListProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch({
        type: "TOGGLE_TODO",
        id // this equals `id: id`
      });
    }
  };
};

/* The above two functions map the state to the props of ToDo List component.
This is related to the data.
2nd function maps dispatch method of the store to the callback of the component

So the two describe a container component so well, that we can use the "connect" function
*/

const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps
)(TodoList);

// The above generates the same class as below automatically!

// /* Create another Container component.
// The purpose of container components is to connect 
// presentational component to the redux store and specify
// the data and behavior that it needs!
// */
// class VisibleTodoList extends React.Component {
//   componentDidMount() {
//     const { store } = this.context;
//     this.unsubscribe = store.subscribe(() => this.forceUpdate());
//   }

//   componentWillUnmount() {
//     this.unsubscribe();
//   }

//   render() {
//     const props = this.props;
//     const { store } = this.context;
//     const state = store.getState();
//     return <TodoList />;
//   }
// }
// VisibleTodoList.contextTypes = {
//   store: PropTypes.object
// };




/*
This is the main "app" and is a container component.

This doesn't have to be a class component, so conver to functional component.
Try to do this whenever possible!
Therefore, move props into the arrow function.
Remove render().
Remove the variable that sets getVisibleTodos() and move that into the <Footer>
component itself. Then we can remove the return() as well.

As part of this last one, remove all props because none of the components need it.

Next, we want the store to be consistent, so pass it in as a prop from ReactDOM
*/
const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
);

/* Use Context to pass down store IMPLICITLY */

// class Provider extends Component {
//   getChildContext() {
//     return {
//       store: this.props.store
//     };
//   }

//   render() {
//     return this.props.children;
//   }
// }

// Provider.childContextTypes = {
//   store: PropTypes.object
// };

// Disable this. Instead, import Provider
//   1. yarn add react-redux
//   2. import { Provider} from 'react-redux';

/* MAIN APP AND STORE */

ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById("root")
);
