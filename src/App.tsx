import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import NotFound from './pages/OtherPage/NotFound';

import UserProfiles from './pages/UserProfiles';
import Videos from './pages/UiElements/Videos';
import Images from './pages/UiElements/Images';
import Alerts from './pages/UiElements/Alerts';
import Badges from './pages/UiElements/Badges';
import Avatars from './pages/UiElements/Avatars';
import Buttons from './pages/UiElements/Buttons';
import LineChart from './pages/Charts/LineChart';
import BarChart from './pages/Charts/BarChart';
import Calendar from './pages/Calendar';
import BasicTables from './pages/Tables/BasicTables';
import FormElements from './pages/Forms/FormElements';
import Blank from './pages/Blank';

import AppLayout from './layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import Home from './pages/Dashboard/Home';
import PrivateRoute from './components/private/PrivateRoute';

import CreateCompany from './pages/Company/CreateCompany';
import ViewCompany from './pages/Company/ViewCompany';
import CreateUser from './pages/Users/CreateUser';
import ViewUser from './pages/Users/ViewUser';

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* 🔐 PROTECTED DASHBOARD */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Home />} />

          {/* Company */}
          <Route path="create-company" element={<CreateCompany />} />
          <Route path="view-company" element={<ViewCompany />} />
          
          {/* Users */}
          <Route path="create-user" element={<CreateUser />} />
          <Route path="view-user" element={<ViewUser />} />

          {/* Others */}
          <Route path="profile" element={<UserProfiles />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="blank" element={<Blank />} />

          {/* Forms */}
          <Route path="form-elements" element={<FormElements />} />

          {/* Tables */}
          <Route path="basic-tables" element={<BasicTables />} />

          {/* UI Elements */}
          <Route path="alerts" element={<Alerts />} />
          <Route path="avatars" element={<Avatars />} />
          <Route path="badge" element={<Badges />} />
          <Route path="buttons" element={<Buttons />} />
          <Route path="images" element={<Images />} />
          <Route path="videos" element={<Videos />} />

          {/* Charts */}
          <Route path="line-chart" element={<LineChart />} />
          <Route path="bar-chart" element={<BarChart />} />
        </Route>

        {/* 🔓 AUTH ROUTES */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* ❌ FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
