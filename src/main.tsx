
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { ResponsiveStage } from "./app/ResponsiveStage.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <ResponsiveStage>
      <App />
    </ResponsiveStage>,
  );
