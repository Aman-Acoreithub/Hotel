import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import Pageheader from './Components/Pageheader';
import AddProperty from './AddProperty';
import Login from './Components/Login';
import Register from './Components/Register';
import Subscription from './Components/Subscription';
import Reels from "./Components/Reels";
import CreateReel from './Components/CreateReel';
import HotelDetails from './Components/HotelDetailBanquet';
import Userprofile from './Components/Userprofile';
import Dashboardmain from './Components/Welcome Dashboard/Dashboardmain';
import ChatPanel from './Components/ChatPanel'
import { ToastContainer } from "react-toastify";
import Createroom from './Components/Createroom';
import UpdateForm from "./Components/UpdateForm";
function ConditionalPageheader() {
  const location = useLocation();
  return location.pathname !== '/reels' ? <Pageheader /> : null;
}
function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
       <ToastContainer />
      <ConditionalPageheader />
      <Routes>
        <Route path='/' element={<Dashboardmain />} />
        <Route path="/hb" element={<Dashboard />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<ChatPanel />} />
        <Route path='/userprofile' element={<Userprofile />}></Route>
        <Route path="/reels" element={<Reels />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/createreel" element={<CreateReel />} />
        <Route path='/createroom' element={<Createroom />}></Route>
        <Route path="/update/hotel/:id" element={<UpdateForm />} />
        <Route path="/update/banquet/:id" element={<UpdateForm />} />
        <Route
          path="/HotelAndBanquetDetails/:HotelAndBanquetDetailsId"
          element={<HotelDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
