import { useEffect, useState } from "react";
import Split from "react-split";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { InferenceClient } from "@huggingface/inference";
import "./App.css";

const client = generateClient<Schema>();

// WARNING: For testing only! Do not expose API tokens in frontend.
const hfClient = new InferenceClient("");

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleAskClick() {
    if (!inputUrl.trim()) return;

    setLoading(true);
    setResponseText("Thinking...");

    try {
      const chatCompletion = await hfClient.chatCompletion({
        provider: "novita",
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          {
            role: "user",
            content: inputUrl,
          },
        ],
      });

      setResponseText(chatCompletion.choices[0].message.content || "(No response)");
    } catch (err) {
      setResponseText("Error: " + (err as any).message);
    } finally {
      setLoading(false);
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

        {/* Right Panel */}
        <section className="right-panel">
          <div className="input-row">
            <input
              type="text"
              className="url-input"
              placeholder="Enter a URL or question..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
            <button className="ask-button" onClick={handleAskClick} disabled={loading}>
              {loading ? "Asking..." : "Ask"}
            </button>
          </div>

          <textarea
            className="response-box"
            readOnly
            placeholder="LLM response will appear here..."
            value={responseText}
          />
        </section>
      </Split>
    </main>
  );
}

export default App;
