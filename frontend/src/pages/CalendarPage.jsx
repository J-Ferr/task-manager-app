import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import dayjs from "dayjs";

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);

  // Fetch tasks with due dates
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
  const firstDay = currentMonth.startOf("month").day(); // 0 = Sunday

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
    <div className="p-6 dark:text-white">
      <h1 className="text-3xl font-bold mb-4 text-center">
        {currentMonth.format("MMMM YYYY")}
      </h1>

      {/* Month Navigation */}
      <div className="flex justify-between mb-4">
        <button onClick={goPrevMonth} className="px-4 py-2 bg-gray-700 text-white rounded">
          Prev
        </button>
        <button onClick={goNextMonth} className="px-4 py-2 bg-gray-700 text-white rounded">
          Next
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center font-semibold">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-2">
        {/* Empty squares before month starts */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={i} className="border rounded h-24 bg-gray-200 dark:bg-gray-800"></div>
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = currentMonth.date(i + 1);
          const dayTasks = getTasksForDate(date);

          return (
            <div
              key={i}
              onClick={() => openDayTasks(date)}
              className="border rounded h-24 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 p-1"
            >
              <div className="font-bold">{i + 1}</div>

              {/* Show up to 2 task indicators */}
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

                {/* If more tasks exist */}
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

      {/* Selected date tasks popup */}
      {selectedDateTasks.length > 0 && (
        <div className="mt-6 p-4 border rounded bg-white dark:bg-gray-800 shadow">
          <h2 className="text-xl font-semibold mb-3">Tasks for selected date:</h2>

          {selectedDateTasks.map((task) => (
            <div key={task.id} className="mb-2 p-2 border rounded dark:border-gray-700">
              <p className="font-bold">{task.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
              <p className="text-xs mt-1">{dayjs(task.due_date).format("MMM D, YYYY")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
