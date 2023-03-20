import { useEffect, useState } from "react";
import useScript from "./use-script.js";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface IHookArgs {
  spreadsheetId: string;
}

interface IHookArgsReturnValue {
  status: string;
  data: any;
  error: any;
  gapiLoadingStatus: any;
  onOpenSheet?:any;
}

function useGoogleSheet(args: IHookArgs): IHookArgsReturnValue {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { spreadsheetId } = args;
  const gapiLoadingStatus = useScript("https://apis.google.com/js/api.js");
  const [status, setStatus] = useState("idle");
  const [tokenClient, setTokenClient] = useState<any|null>(null);

  const API_KEY = "AIzaSyCx8sSfnPFF1iEi4CSM_mrTQA5c5n-ErtM";
  const CLIENT_ID = "247918953740-7h8onnik4m5vmjc05let02c6vask5ic3.apps.googleusercontent.com";
  const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4";
  const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

  useEffect(() => {
    async function initializeGapiClient() {
      await window.gapi.client.init({
        apiKey: API_KEY,
        scopes:SCOPES,
        discoveryDocs: [DISCOVERY_DOC],
      });
      setStatus("gapi client initialized");
    }

    if (gapiLoadingStatus === "ready" && !tokenClient) {
      setStatus("loading gapi client");
      window.gapi.load("client", initializeGapiClient);
    }

    if(status === "gapi client initialized") {
      setTokenClient(window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
      }));
      setStatus("token client initialized");
      console.log("token client initialized");
    // Let's define a callback
    }
//
    if(status === "token client initialized") {
      setStatus('call that thang');
      console.log('call that thang');
    }
    return () => {
      // cleanup
    };
  }, [gapiLoadingStatus, status, tokenClient]);

  function onOpenSheet() {
    console.log("onOpenSheet")
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse: any): Promise<void> => {
        if (tokenResponse && tokenResponse.access_token) {
          window.gapi.client.setApiKey(API_KEY);
          let response;
          try {
            response = await window.gapi.client.sheets.spreadsheets.values.get({ spreadsheetId, range: "Tractor" });
            console.log('onOpenSheet: ', response);

          } catch (err) {
            console.error('onOpensheet:', err);
          }
        }
      },
    });
    client.requestAccessToken({prompt:''});

    return [];
  }

  return {
    status,
    data: null,
    error: null,
    gapiLoadingStatus,
    onOpenSheet
  };
}

export default useGoogleSheet;
