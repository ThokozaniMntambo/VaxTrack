import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// MUI
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Components
import MDBox from "components/MDBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Themes
import theme from "assets/theme";
import themeDark from "assets/theme-dark";

// RTL (kept but optional)
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Routes
import routes from "routes";

// Context
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, direction, sidenavColor, transparentSidenav, whiteSidenav, darkMode } =
    controller;

  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // 🔐 AUTH STATE
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // RTL setup
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  // Sidebar hover
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, true);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // 🔍 detect auth pages
  const isAuthPage = pathname.includes("/sign-in") || pathname.includes("/sign-up");

  // ⏳ prevent flicker
  if (loading) return null;

  // Floating button
  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small">settings</Icon>
    </MDBox>
  );

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />

      {/* ✅ SHOW DASHBOARD UI ONLY WHEN LOGGED IN AND NOT ON AUTH PAGE */}
      {!isAuthPage && user && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="VaxTrack"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
        </>
      )}

      <Routes>
        {/* ROOT */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/sign-in" />}
        />

        {/* AUTH ROUTES */}
        <Route
          path="/sign-in"
          element={
            !user ? (
              routes.find((r) => r.route === "/sign-in")?.component
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          path="/sign-up"
          element={
            !user ? (
              routes.find((r) => r.route === "/sign-up")?.component
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* PROTECTED ROUTES */}
        {routes
          .filter((r) => r.route && !r.route.includes("sign"))
          .map((r) => (
            <Route
              key={r.key}
              path={r.route}
              element={user ? r.component : <Navigate to="/sign-in" />}
            />
          ))}

        {/* FALLBACK */}
        <Route
          path="*"
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/sign-in" />}
        />
      </Routes>
    </ThemeProvider>
  );
}
