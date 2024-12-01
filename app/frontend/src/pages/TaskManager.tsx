import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EditTaskPopup from "../components/task-manager/EditTaskPopup";

interface Task {
  id: number;
  title: string;
  category: string;
  priority: string;
  deadline: string;
  completed: boolean;
}

const TaskManager: React.FC = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    category: "",
    priority: "Medium",
    deadline: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks from the backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    axios
      .get("http://localhost:4000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setTasks(response.data))
      .catch((error) => console.error(error));
  }, []);

  // Add a new task
  const addTask = () => {
    const token = localStorage.getItem("token");
    if (!newTask.title) return;

    axios
      .post("http://localhost:4000/api/tasks", newTask, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setTasks([...tasks, response.data]))
      .finally(() =>
        setNewTask({
          title: "",
          category: "",
          priority: "Medium",
          deadline: "",
        })
      );
  };

  // Delete a task
  const deleteTask = (taskId: number) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:4000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setTasks(tasks.filter((task) => task.id !== taskId)))
      .catch((error) => console.error(error));
  };

  // Save task updates
  const saveTaskUpdates = (updatedTask: Task) => {
    const token = localStorage.getItem("token");
    axios
      .put(`http://localhost:4000/api/tasks/${updatedTask.id}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTasks(
          tasks.map((task) =>
            task.id === updatedTask.id ? { ...task, ...response.data } : task
          )
        );
      })
      .catch((error) => console.error(error));
  };

  // Toggle Completed
  const toggleCompleted = (taskId: number, currentStatus: boolean) => {
    const token = localStorage.getItem("token");
    axios
      .put(
        `http://localhost:4000/api/tasks/${taskId}`,
        { completed: !currentStatus }, // Toggle the completed status
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        // Update the task list with the updated task
        setTasks(
          tasks.map((task) =>
            task.id === taskId
              ? { ...task, completed: response.data.completed }
              : task
          )
        );
      })
      .catch((error) => console.error("Failed to toggle task status:", error));
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token"); // Clear the token from local storage
    navigate("/login"); // Redirect to the login page
  };

  // Filtered tasks
  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((task) =>
      filterCategory ? task.category === filterCategory : true
    )
    .filter((task) =>
      filterPriority ? task.priority === filterPriority : true
    );

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
          {/* Logout Button */}
          <button
            onClick={logout}
            className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Logout
          </button>
          <h1 className="text-2xl font-bold mb-6 text-center">Task Manager</h1>

          {/* Add Task Form */}
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              />
              <input
                type="date"
                value={newTask.deadline}
                onChange={(e) =>
                  setNewTask({ ...newTask, deadline: e.target.value })
                }
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>
            <div className="flex space-x-4 mb-4">
              <select
                value={newTask.category}
                onChange={(e) =>
                  setNewTask({ ...newTask, category: e.target.value })
                }
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              >
                <option value="">Category</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Shopping">Shopping</option>
              </select>
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button
                onClick={addTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Task
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex space-x-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            >
              <option value="">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Shopping">Shopping</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Task List */}
          <ul className="space-y-4">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className={`p-4 border rounded-md ${
                  task.completed ? "bg-green-100" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.category}</p>
                    <p
                      className={`text-sm ${
                        task.deadline && new Date(task.deadline) < new Date()
                          ? "text-red-500"
                          : "text-gray-600"
                      }`}
                    >
                      {task.deadline ? `Due: ${task.deadline}` : "No deadline"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      task.priority === "High"
                        ? "bg-red-500"
                        : task.priority === "Medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <div className="mt-2 flex space-x-4">
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => toggleCompleted(task.id, task.completed)}
                    className={`${
                      task.completed ? "text-gray-500" : "text-green-500"
                    } hover:underline`}
                  >
                    {task.completed
                      ? "Mark as Incomplete"
                      : "Mark as Completed"}
                  </button>
                  <button
                    onClick={() =>
                      setEditingTask({
                        id: task.id,
                        title: task.title,
                        category: task.category,
                        priority: task.priority,
                        deadline: task.deadline,
                        completed: task.completed,
                      })
                    }
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Edit Task Popup */}
        {editingTask && (
          <EditTaskPopup
            task={editingTask}
            onSave={(updatedTask) => saveTaskUpdates(updatedTask)}
            onClose={() => setEditingTask(null)}
          />
        )}
      </div>
    </>
  );
};

export default TaskManager;
