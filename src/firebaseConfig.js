export const appId = process.env.REACT_APP_APP_ID || 'default-app-id';
export const rawEnv = process.env.REACT_APP_FIREBASE_CONFIG || null;

export const firebaseConfig = (() => {
  try {
    return process.env.REACT_APP_FIREBASE_CONFIG ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) : {};
  } catch (e) {
    console.error("ERROR al parsear REACT_APP_FIREBASE_CONFIG:", e);
    return {};
  }
})();

export const initialAuthToken = process.env.REACT_APP_INITIAL_AUTH_TOKEN || null;

// DEBUG: mostrar qué se está leyendo (se verá en la consola del navegador)
if (typeof window !== 'undefined') {
  console.groupCollapsed("DEBUG: firebaseConfig");
  console.log("REACT_APP_APP_ID:", process.env.REACT_APP_APP_ID);
  console.log("raw REACT_APP_FIREBASE_CONFIG string:", rawEnv);
  console.log("parsed firebaseConfig object:", firebaseConfig);
  console.log("initialAuthToken:", initialAuthToken ? "[SET]" : "[EMPTY]");
  console.groupEnd();
}