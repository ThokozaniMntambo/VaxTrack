// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import VaccineTracker from "layouts/vaccine-tracker";
import ChildProfile from "layouts/child-profile";
import Reminders from "layouts/reminders";
import Calendar from "layouts/calendar";
import Settings from "layouts/settings";

import SignIn from "layouts/auth/sign-in";
import SignUp from "layouts/auth/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  // ================= AUTH (NO SIDEBAR) =================
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    route: "/sign-in",
    layout: "auth",
    component: <SignIn />,
  },
  {
    type: "route",
    name: "Sign Up",
    key: "sign-up",
    route: "/sign-up",
    layout: "auth",
    component: <SignUp />,
  },

  // ================= DASHBOARD =================
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/dashboard",
    layout: "dashboard",
    component: <Dashboard />,
  },

  {
    type: "collapse",
    name: "Vaccine Tracker",
    key: "vaccine-tracker",
    icon: <Icon fontSize="small">vaccines</Icon>,
    route: "/vaccines",
    layout: "dashboard",
    component: <VaccineTracker />,
  },

  {
    type: "collapse",
    name: "Child Profile",
    key: "child-profile",
    icon: <Icon fontSize="small">child_care</Icon>,
    route: "/child-profile",
    layout: "dashboard",
    component: <ChildProfile />,
  },

  {
    type: "collapse",
    name: "Reminders",
    key: "reminders",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/reminders",
    layout: "dashboard",
    component: <Reminders />,
  },

  {
    type: "collapse",
    name: "Calendar",
    key: "calendar",
    icon: <Icon fontSize="small">event</Icon>,
    route: "/calendar",
    layout: "dashboard",
    component: <Calendar />,
  },

  {
    type: "collapse",
    name: "Settings",
    key: "settings",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/settings",
    layout: "dashboard",
    component: <Settings />,
  },
];

export default routes;
