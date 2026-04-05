import { useState, useEffect } from "react";
import LandingPage from "./LandingPage";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import { GLOBAL, LANDING, AUTH, DASH } from "./styles";

export default function App() {
  const [page, setPage] = useState("landing");
  const [userName, setUserName] = useState("");

  // On first load, set the initial history entry
  useEffect(() => {
    window.history.replaceState({ page: "landing" }, "", "/");
  }, []);

  // Listen for browser back/forward button clicks
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setPage(e.state.page);
      } else {
        setPage("landing");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const onNav = (dest, name = "") => {
    setPage(dest);
    if (dest === "dashboard" && name) {
      setUserName(name);
    }
    // Push a new history entry so browser back button works
    window.history.pushState({ page: dest }, "", "/");
  };

  return (
    <>
      <style>{GLOBAL + LANDING + AUTH + DASH}</style>

      {page === "landing" && <LandingPage onNav={onNav} />}

      {(page === "login" || page === "register") && (
        <AuthPage mode={page} onNav={onNav} />
      )}

      {page === "dashboard" && (
        <Dashboard userName={userName} onNav={onNav} />
      )}
    </>
  );
}
export { App };