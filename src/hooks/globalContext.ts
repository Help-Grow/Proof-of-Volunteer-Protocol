import { GlobalState } from "@/types/global";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

export const GlobalStateContext = createContext<GlobalState>({});
export const SetGlobalStateContext = createContext<
  Dispatch<SetStateAction<GlobalState>>
>(() => {});

export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};

export const useSetGlobalState = () => {
  return useContext(SetGlobalStateContext);
};
