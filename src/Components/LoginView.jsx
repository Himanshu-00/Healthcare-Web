import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, signInWithEmailAndPassword, onAuthStateChanged } from "../firebaseConfig";

const LoginView = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Signed in Successfully:", userCredential.user);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="flex items-center justify-center h-screen bg-[#F5F5F5]">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-96">
        <h2 className="text-3xl font-bold text-center text-[#004d4D] font-mono mb-6">Welcome Back!</h2>
        <form className="space-y-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            value={email}
            placeholder="Email"
            className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            required
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            value={password}
            placeholder="Password"
            className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            required
          />
          <button 
            type="button" 
            onClick={handleSignIn} 
            className="w-full p-4 bg-[#004d4D] hover:bg-[#003030] text-white font-bold rounded-lg shadow-md hover:003030 transition duration-200"
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-gray-500 font-mono mt-6">
          Don't have an account? <a href="/signup" className="text-[#002A2A] hover:underline font-mono font-semibold"> Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginView;
