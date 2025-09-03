import {useContext,createContext} from "react";
const LoadingContext = createContext();
export const useLoading = () => useContext(LoadingContext);
