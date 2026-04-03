import { configureStore } from "@reduxjs/toolkit";
import { userUiReducer } from "@/features/users/presentation/store/user-slice";

export const store = configureStore({
  reducer: {
    userUi: userUiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
