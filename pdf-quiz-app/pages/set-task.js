import { useState } from "react"
import { useRouter } from "next/router"
import { withAuth } from '../components/ProtectedRoute'; // Adjust the import path as necessary

function SetTask() {
  const [task, setTask] = useState("")
  const [time, setTime] = useState("")
  const router = useRouter()

  const handleSetTimer = () => {
    if (task.trim() && time.trim()) {
      router.push({
        pathname: '/timer',
        query: { task: task, time: time },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-400">Set Your Task</h1>
          
          <p className="text-gray-300 mb-4 text-center">
            Write down the task you want to achieve during this session
          </p>

          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full p-2 rounded mb-4 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Enter your task"
          />

          <input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 rounded mb-4 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Enter time in minutes"
          />

          <button
            onClick={handleSetTimer}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Set Timer
          </button>
        </div>
      </div>
    </div>
  )
}

export default withAuth(SetTask, ['user', 'admin']); // Adjust roles as necessary