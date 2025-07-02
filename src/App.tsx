import { useEffect, useState } from "react";
import Split from "react-split";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import "./App.css";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content });
    }
  }

  return (
    <main className="main-container">
      <Split
        className="split-container"
        sizes={[30, 70]}
        minSize={200}
        gutterSize={8}
        direction="horizontal"
      >
        {/* Left Panel */}
        <section className="left-panel">
          <h1>My Todos</h1>
          <button onClick={createTodo}>+ New</button>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>{todo.content}</li>
            ))}
          </ul>
          <div className="info-box">
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a
              href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates"
              target="_blank"
              rel="noopener noreferrer"
            >
              Review next steps of this tutorial.
            </a>
          </div>
        </section>

        <section className="right-panel">
          <div className="input-row">
            <input
              type="text"
              className="url-input"
              placeholder="Enter a URL..."
            />
            <button className="ask-button">Ask</button>
          </div>

          <textarea
            className="response-box"
            readOnly
            placeholder="LLM response will appear here..."
          />
        </section>
      </Split>
    </main>
  );
}

export default App;
