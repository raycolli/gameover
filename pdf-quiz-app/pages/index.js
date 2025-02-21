import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-deep-navy">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-cool-gray mb-6 tracking-tight">
            Note Nibbler
            <span className="block text-vibrant-cyan">Study Smarter, Not Harder</span>
          </h1>
          <p className="text-xl text-cool-gray opacity-80 mb-8">
            Turn your study materials into bite-sized, interactive learning experiences. 
            Note Nibbler uses AI to transform dense PDFs into engaging quizzes that help you retain information better.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-deep-navy bg-vibrant-cyan rounded-xl 
            hover:bg-soft-lilac transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            {user ? 'Go to Dashboard' : 'Get Started Free'}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
          <div className="bg-deep-navy border border-cool-gray border-opacity-10 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-vibrant-cyan mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cool-gray mb-2">Smart PDF Processing</h3>
            <p className="text-cool-gray opacity-80">Our AI understands your documents and extracts key concepts automatically.</p>
          </div>

          <div className="bg-deep-navy border border-cool-gray border-opacity-10 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-vibrant-cyan mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cool-gray mb-2">Personalized Learning</h3>
            <p className="text-cool-gray opacity-80">Adaptive quizzes that focus on your weak spots and help reinforce key concepts.</p>
          </div>

          <div className="bg-deep-navy border border-cool-gray border-opacity-10 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-vibrant-cyan mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cool-gray mb-2">Track Progress</h3>
            <p className="text-cool-gray opacity-80">Monitor your learning journey with detailed analytics and performance insights.</p>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-cool-gray mb-8">Trusted by Students and Professionals</h2>
          <div className="flex justify-center space-x-8">
            <div className="text-cool-gray opacity-80">⭐️ 4.9/5 Average Rating</div>
            <div className="text-cool-gray opacity-80">📚 10,000+ Documents Processed</div>
            <div className="text-cool-gray opacity-80">👥 5,000+ Active Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}
