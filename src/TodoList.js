import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

const GET_TODOS = gql`
  query GetTodos {
    getTodos { id name description completed }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($name: String!, $description: String) {
    addTodo(name: $name, description: $description) {
      id name description completed
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) { id completed }
  }
`;

function TodoList() {
  const [name, setName] = useState('');
  const { loading, error, data } = useQuery(GET_TODOS);
  const [addTodo] = useMutation(ADD_TODO, { refetchQueries: [{ query: GET_TODOS }] });
  const [toggleTodo] = useMutation(TOGGLE_TODO);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Todo name" 
      />
      <button onClick={() => {
        addTodo({ variables: { name } });
        setName('');
      }}>Add Todo</button>

      <ul>
        {data.getTodos.map(todo => (
          <li key={todo.id} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.name}
            <button onClick={() => toggleTodo({ variables: { id: todo.id } })}>
              {todo.completed ? 'Undo' : 'Complete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;