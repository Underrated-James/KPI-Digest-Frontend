import { configureStore } from "@reduxjs/toolkit";
import { userUiReducer } from "@/features/users/presentation/store/user-slice";
import { projectUiReducer } from "@/features/projects/presentation/store/project-slice";
import { sprintUiReducer } from "@/features/sprints/presentation/store/sprint-slice";

export const store = configureStore({
  reducer: {
    userUi: userUiReducer,
    projectUi: projectUiReducer,
    sprintUi: sprintUiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
