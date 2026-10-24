import { configureStore } from '@reduxjs/toolkit';
import workouts from './workoutsSlice';

export const store = configureStore({
  reducer: { workouts },
});
