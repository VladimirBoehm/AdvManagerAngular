import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';

export interface AppState {
}

export const reducers: ActionReducerMap<AppState> = {
};

export function logger(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action) => {
    console.log('state before: ', state);
    console.log('action', action);

    return reducer(state, action);
  };
}

// Executed before other Reducers
export const metaReducers: MetaReducer<AppState>[] = environment.isProd
  ? []
  : [logger];
