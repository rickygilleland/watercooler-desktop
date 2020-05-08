import { Action } from 'redux';
import { orderBy } from 'lodash';
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
import { faAudioDescription } from '@fortawesome/free-solid-svg-icons';

const initialState = {
    organization: null,
    teams: [],
    users: [],
    error: false,
    loading: false,
    inviteUsersSuccess: false,
    createRoomSuccess: false,
    lastCreatedRoomSlug: null,
}

export default function organization(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_ORGANIZATIONS_SUCCESS:
            var updatedTeams = action.payload.data.teams;

            updatedTeams.forEach(team => {
                team.rooms = orderBy(team.rooms, ['name', 'created_at'], ['asc']);
            })

            updatedState = {
                organization: {
                    id: action.payload.data.id,
                    name: action.payload.data.name,
                    slug: action.payload.data.slug
                },
                teams: updatedTeams
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
            var updatedOrganizationUsers = orderBy(action.payload.data, ['first_name', 'last_name'], ['asc']);
            updatedState = {
                users: updatedOrganizationUsers,
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
                createRoomSuccess: false,
                lastCreatedRoomSlug: null
            }
            break;
        case CREATE_ROOM_SUCCESS:
            var updatedTeams = state.teams;
            updatedTeams.forEach(team => {
                if (team.id == action.payload.data.team_id) {
                    team.rooms.push(action.payload.data);
                }

                team.rooms = orderBy(team.rooms, ['name', 'created_at'], ['asc']);
            });
            
            updatedState = {
                teams: updatedTeams,
                loading:false,
                createRoomSuccess: true,
                lastCreatedRoomSlug: action.payload.data.slug
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