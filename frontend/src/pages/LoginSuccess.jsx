import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
 
const LoginSuccess = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const hasNavigatedRef = useRef(false); // Prevent multiple navigations
 
  useEffect(() => {
    if (hasNavigatedRef.current) return; // Skip if already navigated
 
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
 
    console.log('LoginSuccess useEffect, URL:', window.location.href); // Debug log
    console.log('Query params:', Object.fromEntries(params));
    console.log('Token:', token);
 
    if (token) {
      login(token); // Save token in context
      localStorage.setItem("jwt", token); // Persist token
      hasNavigatedRef.current = true; // Mark as navigated
      setTimeout(() => {
        navigate("/", { state: { showLoginSuccess: true } }); // Navigate after 1 second
      }, 1000);
    } else {
      toast.error('Login failed: No token provided in URL', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/login");
    }
  }, [login, navigate]);
 
  return <p>Logging you in...</p>;
};
 
export default LoginSuccess;