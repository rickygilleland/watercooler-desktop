import { Action } from 'redux';
import { 
    GET_ORGANIZATIONS_SUCCESS, 
    GET_ORGANIZATIONS_FAILURE, 
    GET_ORGANIZATION_USERS_STARTED,
    GET_ORGANIZATION_USERS_SUCCESS,
    GET_ORGANIZATION_USERS_FAILURE,
    INVITE_USERS_STARTED,
    INVITE_USERS_SUCCESS,
    INVITE_USERS_FAILURE,
    CREATE_ROOM_STARTED,
    CREATE_ROOM_SUCCESS,
    CREATE_ROOM_FAILURE,
} from '../actions/organization';

const initialState = {
    organization: null,
    teams: [],
    users: [],
    error: false,
    loading: false,
    inviteUsersSuccess: false,
    createRoomSuccess: false
}

export default function organization(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_ORGANIZATIONS_SUCCESS:
            updatedState = {
                organization: {
                    id: action.payload.data.id,
                    name: action.payload.data.name,
                    slug: action.payload.data.slug
                },
                teams: action.payload.data.teams
            }
            break;
        case GET_ORGANIZATIONS_FAILURE:
            updatedState = {
                error: true
            }
            break;
        case GET_ORGANIZATION_USERS_STARTED:
            updatedState = {
                loading: true
            }
            break;
        case GET_ORGANIZATION_USERS_SUCCESS:
            updatedState = {
                users: action.payload.data,
                loading: false
            }
            break;
        case GET_ORGANIZATION_USERS_FAILURE:
            return state;
            break;
        case INVITE_USERS_STARTED:
            updatedState = {
                inviteUsersSuccess: false,
                loading: true
            }
            break;
        case INVITE_USERS_SUCCESS:
            updatedState = {
                inviteUsersSuccess: true,
                loading: false
            }
            break;
        case INVITE_USERS_FAILURE: 
            updatedState = {
                inviteUsersSuccess: false,
                loading: false
            }
            break;
        case CREATE_ROOM_STARTED:
            updatedState = {
                loading: true,
                createRoomSuccess: false
            }
            break;
        case CREATE_ROOM_SUCCESS:
            var updatedTeams = state.teams;
            updatedTeams.forEach(team => {
                if (team.id == action.payload.data.team_id) {
                    team.rooms.push(action.payload.data);
                }
            });
            
            updatedState = {
                teams: updatedTeams,
                loading:false,
                createRoomSuccess: true
            }
            break;
        case CREATE_ROOM_FAILURE:
            updatedState = {
                loading: false,
                createRoomSuccess: false
            }
            break;
        default:
            //do nothing
            return state;
    }
    const newState = Object.assign({}, state, updatedState);
    return newState;
};