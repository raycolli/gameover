import { useRouter } from "next/router"
import { withAuth } from '../components/ProtectedRoute'; // Adjust the import path as necessary
import { useEffect, useState } from "react"

function Timer() {
  const router = useRouter()
  const { task, time } = router.query
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (time) {
      setRemainingTime(parseInt(time) * 60); // Convert minutes to seconds
    }
  }, [time]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timerId = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [remainingTime]);

  if (!task) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 p-8 rounded-lg shadow text-center">
          <h1 className="text-4xl font-bold mb-4 text-blue-400">Let's Go!</h1>
          <p className="text-lg mb-8 text-gray-300">{task}</p>
          
          <div className="text-8xl font-bold text-white">
            {formatTime(remainingTime)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(Timer, ['user', 'admin']); // Adjust roles as necessary 