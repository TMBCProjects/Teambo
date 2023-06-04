import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { createBrowserHistory } from 'history';
import * as Sentry1 from "@sentry/browser";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';


const history = createBrowserHistory();

Sentry.init({
  dsn: "https://d8a1f333f27c42d081f17bb8a04cf817@o4504706502295552.ingest.sentry.io/4504706503475200",
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [new BrowserTracing(
      {tracePropagationTargets: ["localhost", "teambo.app", /^\//],
      routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
}

  ),
  new Sentry1.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),],
  tracesSampleRate: 1.0,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
  </>
);

serviceWorkerRegistration.register();

