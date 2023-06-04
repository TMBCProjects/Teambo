import Routing from "./Components/Routing/Routing";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

function App() {
  return (
  <Routing/>
  );
}
Sentry.init({
  dsn: "https://d8a1f333f27c42d081f17bb8a04cf817@o4504706502295552.ingest.sentry.io/4504706503475200",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});
export default App;
