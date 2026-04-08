import { configureStore } from "@reduxjs/toolkit";
import { userUiReducer } from "@/features/users/presentation/store/user-slice";
import { projectUiReducer } from "@/features/projects/presentation/store/project-slice";

export const store = configureStore({
  reducer: {
    userUi: userUiReducer,
    projectUi: projectUiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
