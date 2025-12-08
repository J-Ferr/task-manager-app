import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await axiosClient.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <p className="p-6">Loading tasks...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Your Tasks</h1>

      {tasks.length === 0 ? (
        <p>No tasks yet. Create one!</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li 
              key={task.id}
              className="border p-3 rounded shadow-sm bg-white flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  {task.title}
                </h2>
                <p className="text-gray-600">{task.description}</p>
                <p className="text-sm mt-1">
                  Status:{" "}
                  <span className={task.completed ? "text-green-600" : "text-red-600"}>
                    {task.completed ? "Completed" : "Pending"}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

