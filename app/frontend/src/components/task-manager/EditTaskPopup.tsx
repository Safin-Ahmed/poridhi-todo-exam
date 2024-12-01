import React, { useState } from "react";

interface EditTaskPopupProps {
  task: {
    id: number;
    title: string;
    category: string;
    priority: string;
    deadline: string;
    completed: boolean;
  };
  onSave: (updatedTask: {
    id: number;
    title: string;
    category: string;
    priority: string;
    deadline: string;
    completed: boolean;
  }) => void;
  onClose: () => void;
}

const EditTaskPopup: React.FC<EditTaskPopupProps> = ({
  task,
  onSave,
  onClose,
}) => {
  const [editedTask, setEditedTask] = useState(task);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>
        <div className="mb-4">
          <input
            type="text"
            name="title"
            value={editedTask.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Task Title"
          />
        </div>
        <div className="mb-4">
          <select
            name="category"
            value={editedTask.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="">Select Category</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Shopping">Shopping</option>
          </select>
        </div>
        <div className="mb-4">
          <select
            name="priority"
            value={editedTask.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="mb-4">
          <input
            type="date"
            name="deadline"
            value={editedTask.deadline}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskPopup;
