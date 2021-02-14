import {
  Billing,
  CREATE_CALL_FAILURE,
  CREATE_CALL_STARTED,
  CREATE_CALL_SUCCESS,
  CREATE_ROOM_FAILURE,
  CREATE_ROOM_STARTED,
  CREATE_ROOM_SUCCESS,
  GET_ORGANIZATIONS_FAILURE,
  GET_ORGANIZATIONS_SUCCESS,
  GET_ORGANIZATION_USERS_FAILURE,
  GET_ORGANIZATION_USERS_STARTED,
  GET_ORGANIZATION_USERS_SUCCESS,
  INVITE_USERS_FAILURE,
  INVITE_USERS_STARTED,
  INVITE_USERS_SUCCESS,
  Organization,
  OrganizationActionTypes,
  OrganizationState,
} from "../store/types/organization";
import { orderBy } from "lodash";

const initialState: OrganizationState = {
  organization: {} as Organization,
  teams: [],
  users: [],
  billing: {} as Billing,
  error: false,
  loading: false,
  inviteUsersSuccess: false,
  createRoomSuccess: false,
  createCallSuccess: false,
  lastCreatedRoomSlug: null,
};

export default function organization(
  state = initialState,
  action: OrganizationActionTypes,
): OrganizationState {
  let updatedState = {};
  switch (action.type) {
    case GET_ORGANIZATIONS_SUCCESS: {
      const teams = action.payload.teams.map((team) => {
        team.rooms = orderBy(team.rooms, ["name", "created_at"], ["asc"]);
        return team;
      });

      updatedState = {
        organization: {
          id: action.payload.id,
          name: action.payload.name,
          slug: action.payload.slug,
        },
        billing: action.payload.billing,
        teams: teams,
        loading: false,
      };
      break;
    }
    case GET_ORGANIZATIONS_FAILURE: {
      updatedState = {
        error: true,
      };
      break;
    }
    case GET_ORGANIZATION_USERS_STARTED: {
      updatedState = {
        loading: true,
      };
      break;
    }
    case GET_ORGANIZATION_USERS_SUCCESS: {
      const updatedOrganizationUsers = orderBy(
        action.payload,
        ["first_name", "last_name"],
        ["asc"],
      );
      updatedState = {
        users: updatedOrganizationUsers,
        loading: false,
      };
      break;
    }
    case GET_ORGANIZATION_USERS_FAILURE: {
      updatedState = {
        loading: false,
      };
      break;
    }
    case INVITE_USERS_STARTED: {
      updatedState = {
        inviteUsersSuccess: false,
        loading: true,
      };
      break;
    }
    case INVITE_USERS_SUCCESS: {
      updatedState = {
        inviteUsersSuccess: true,
        loading: false,
      };
      break;
    }
    case INVITE_USERS_FAILURE: {
      updatedState = {
        inviteUsersSuccess: false,
        loading: false,
      };
      break;
    }
    case CREATE_ROOM_STARTED: {
      updatedState = {
        loading: true,
        createRoomSuccess: false,
        lastCreatedRoomSlug: null,
      };
      break;
    }
    case CREATE_ROOM_SUCCESS: {
      const updatedTeams = [...state.teams];
      updatedTeams.forEach((team) => {
        if (team.id == action.payload.team_id) {
          team.rooms.push(action.payload);
        }

        team.rooms = orderBy(team.rooms, ["name", "created_at"], ["asc"]);
      });

      updatedState = {
        teams: updatedTeams,
        loading: false,
        createRoomSuccess: true,
        lastCreatedRoomSlug: action.payload.slug,
      };
      break;
    }
    case CREATE_ROOM_FAILURE: {
      updatedState = {
        loading: false,
        createRoomSuccess: false,
      };
      break;
    }
    case CREATE_CALL_STARTED: {
      updatedState = {
        loading: true,
        createCallSuccess: false,
      };
      break;
    }
    case CREATE_CALL_SUCCESS: {
      const updatedTeams = state.teams;
      updatedTeams.forEach((team) => {
        if (team.id == action.payload.team_id) {
          if (!team.calls) {
            team.calls = [];
          }

          let callFound = false;

          team.calls.forEach((call) => {
            if (call.id == action.payload.id) {
              callFound = true;

              call = action.payload;
            }
          });

          if (!callFound) {
            team.calls.push(action.payload);
          }
        }

        team.calls = orderBy(team.calls, ["name", "created_at"], ["asc"]);
      });

      updatedState = {
        loading: false,
        createCallSuccess: true,
        teams: updatedTeams,
      };
      break;
    }
    case CREATE_CALL_FAILURE: {
      updatedState = {
        loading: false,
        createCallSuccess: false,
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
