import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";   // <-- ADD THIS

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);

  const navigate = useNavigate(); // <-- ADD THIS

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await axiosClient.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const daysInMonth = currentMonth.daysInMonth();
  const firstDay = currentMonth.startOf("month").day();

  const goNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
  const goPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));

  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      return dayjs(task.due_date).isSame(date, "day");
    });
  };

  const openDayTasks = (date) => {
    setSelectedDateTasks(getTasksForDate(date));
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 dark:text-white min-h-screen">

      {/* EXIT CALENDAR BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
      >
        ← Back to Tasks
      </button>

      <h1 className="text-3xl font-bold mb-4 text-center">
        {currentMonth.format("MMMM YYYY")}
      </h1>

      {/* Month Navigation */}
      <div className="flex justify-between mb-4">
        <button
          onClick={goPrevMonth}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
        >
          Prev
        </button>

        <button
          onClick={goNextMonth}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
        >
          Next
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 text-center font-semibold">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mt-2">

        {/* Empty squares before month starts */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div
            key={i}
            className="border rounded h-24 bg-gray-200 dark:bg-gray-800"
          ></div>
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = currentMonth.date(i + 1);
          const dayTasks = getTasksForDate(date);

          return (
            <div
              key={i}
              onClick={() => openDayTasks(date)}
              className="border border-gray-300 dark:border-gray-700 rounded h-24 cursor-pointer 
           bg-white dark:bg-gray-800 
           hover:bg-blue-100 dark:hover:bg-gray-700 
           p-1 transition-all"
            >
              <div className="font-bold">{i + 1}</div>

              <div className="text-xs mt-1 space-y-1">
                {dayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className={`px-1 rounded truncate ${
                      task.priority === "high"
                        ? "bg-red-600 text-white"
                        : task.priority === "medium"
                        ? "bg-yellow-500 text-black"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {task.title}
                  </div>
                ))}

                {dayTasks.length > 2 && (
                  <div className="text-[10px] text-gray-500 dark:text-gray-300">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Tasks */}
      {selectedDateTasks.length > 0 && (
        <div className="mt-6 p-4 border border-gray-300 dark:border-gray-700 
                rounded bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Tasks for selected date:</h2>

          {selectedDateTasks.map((task) => (
            <div
              key={task.id}
              className="mb-2 p-2 border rounded dark:border-gray-700"
            >
              <p className="font-bold">{task.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {task.description}
              </p>
              <p className="text-xs mt-1">
                {dayjs(task.due_date).format("MMM D, YYYY")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
