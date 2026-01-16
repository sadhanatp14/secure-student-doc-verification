import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/api/health")
      .then(res => res.json())
      .then(data => setMessage(data.status))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Secure Course Enrollment System</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
