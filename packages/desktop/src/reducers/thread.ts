import {
  GET_THREAD_FAILURE,
  GET_THREAD_STARTED,
  GET_THREAD_SUCCESS,
  GET_USER_THREADS_FAILURE,
  GET_USER_THREADS_STARTED,
  GET_USER_THREADS_SUCCESS,
  ThreadActionTypes,
  ThreadState,
  ThreadType,
} from "../store/types/thread";

const initialState: ThreadState = {
  privateThreads: {},
  publicThreads: {},
  sharedThreads: {},
  roomThreads: {},
  loading: false,
  error: false,
};

export default function thread(
  state = initialState,
  action: ThreadActionTypes,
): ThreadState {
  let updatedState = {};
  switch (action.type) {
    case GET_THREAD_STARTED: {
      updatedState = {
        loading: true,
        error: false,
      };
      break;
    }
    case GET_THREAD_SUCCESS: {
      let updatedThreads;
      let updatedState = {
        ...state,
        loading: false,
        error: false,
      };

      if (action.payload.type === ThreadType.Private) {
        updatedThreads = { ...state.privateThreads };
        updatedThreads[action.payload.id] = action.payload;

        updatedState = {
          ...updatedState,
          privateThreads: updatedThreads,
        };
      }

      if (action.payload.type === ThreadType.Public) {
        updatedThreads = { ...state.publicThreads };

        updatedThreads[action.payload.id] = action.payload;

        updatedState = {
          ...updatedState,
          privateThreads: updatedThreads,
        };
      }

      if (action.payload.type === ThreadType.Shared) {
        updatedThreads = { ...state.sharedThreads };

        updatedThreads[action.payload.id] = action.payload;

        updatedState = {
          ...updatedState,
          privateThreads: updatedThreads,
        };
      }

      if (action.payload.type === ThreadType.Room) {
        updatedThreads = { ...state.roomThreads };
        updatedThreads[action.payload.id] = action.payload;

        updatedState = {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ...updatedState,
          privateThreads: updatedThreads,
        };
      }

      break;
    }
    case GET_THREAD_FAILURE: {
      updatedState = {
        loading: false,
        error: true,
      };
      break;
    }
    case GET_USER_THREADS_STARTED: {
      updatedState = {
        loading: true,
        error: false,
      };
      break;
    }
    case GET_USER_THREADS_SUCCESS: {
      const updatedPrivateThreads = { ...state.privateThreads };
      const updatedPublicThreads = { ...state.publicThreads };
      const updatedRoomThreads = { ...state.roomThreads };

      action.payload.private_threads.forEach((thread) => {
        updatedPrivateThreads[thread.id] = thread;
      });

      action.payload.room_threads.forEach((thread) => {
        updatedRoomThreads[thread.id] = thread;
      });

      action.payload.public_threads.forEach((thread) => {
        updatedPublicThreads[thread.id] = thread;
      });

      updatedState = {
        privateThreads: updatedPrivateThreads,
        publicThreads: updatedPublicThreads,
        roomThreads: updatedRoomThreads,
        loading: false,
        error: false,
      };
      break;
    }
    case GET_USER_THREADS_FAILURE: {
      updatedState = {
        loading: false,
        error: true,
      };
      break;
    }
    default: {
      //do nothing
      return state;
    }
  }
  const newState = Object.assign({}, state, { ...state, ...updatedState });
  return newState;
}
