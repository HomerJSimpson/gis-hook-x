import './App.css';

import * as React from 'react';

import jwt_decode from 'jwt-decode';

import useScript from './use-script';

interface IHookArgs {
  googleBtnRef: any;
  clientId: string;
}

declare global {
  interface Window {
    google: any;
  }
}
const DISCOVERY_DOC =
  "https://sheets.googleapis.com/$discovery/rest?version=v4";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

function useGoogleAuth(args: IHookArgs) {
  const status = useScript("https://accounts.google.com/gsi/client");
  const [credential, setCredential] = React.useState<string | any>(null);

  function handleCredentialResponse(resp: any) {
    setCredential(resp.credential);
    // console.log([resp, jwt_decode(resp.credential)]);
  }

  React.useEffect(() => {
    if (status === "ready" && args.googleBtnRef) {
      window.google.accounts.id.initialize({
        client_id: args.clientId,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        args.googleBtnRef,
        { theme: "outline", size: "large" } // customization attributes
      );
      window.google.accounts.id.prompt();
    }
    return () => {
      console.log("cleanup effect");
    };
  }, [status, args.clientId, args.googleBtnRef]);

  return { status, credential };
}

interface GISProfileCardArgs {
  credential: string | any;
}

function GISProfileCard(gisProfileCardArgs: GISProfileCardArgs) {
  try {
    console.log({ gisProfileCardArgs });
    const jwt: any = jwt_decode(gisProfileCardArgs.credential);
    return (
      <>
        Test {jwt && "email: " + jwt.email}
        <div className="gis-profile-card">
          <div className="profile-pic">
            <img src={jwt.picture} alt="" />
          </div>
          <div className="display-name">
            <div>Logged in as:</div>
            <div>{jwt.name}</div>
          </div>
          <div className="stats">
            <div>Logged in since:</div>
            <div>{new Date(jwt.iat * 1000).toLocaleString()}</div>
          </div>
        </div>
      </>
    );
  } catch (e) {
    console.error(e, { gisProfileCardArgs });
  }
  return <>-</>;
}

function App() {
  const googleBtnRef = React.useRef(null);
  const { status, credential } = useGoogleAuth({
    googleBtnRef: googleBtnRef.current,
    clientId:
      "247918953740-4g7h4gb1mip4j5d50cqvp28b04qr6ic3.apps.googleusercontent.com",
  });

  return (
    <div className="App">
      <p>{status === "ready" ? "📄" : status}</p>
      {!credential && <div ref={googleBtnRef}></div>}
      {credential && <GISProfileCard credential={credential} />}
      <div className="test-ui">
        <div className="item">
          <span>Sheetname:</span>
          <input type="text" />
          <button>create sheet</button>
        </div>
      </div>
    </div>
  );
}

export default App;
