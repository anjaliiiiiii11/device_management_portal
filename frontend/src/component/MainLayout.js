import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar'; // ✅ Correct
import Footer from './Footer'; // ✅ Correct
import Chatbot from '../pages/Chatbot'; // ✅ Correct
import { ToastContainer } from 'react-toastify';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

const hideChatbotPaths = ['/auth'];
const hideFooterPaths = ['/dashboard'];
const isLoggedIn = !!localStorage.getItem('jwt');
const showChatbot = isLoggedIn && !hideChatbotPaths.some(p => path.startsWith(p));
const showFooter = !hideFooterPaths.includes(path);


  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {children}
      {showChatbot && <Chatbot />}
      {showFooter && <Footer addMarginTop={true} />}
    </>
  );
};

export default MainLayout;
