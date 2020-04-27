import { Action } from 'redux';
import { 
    GET_ORGANIZATIONS_SUCCESS, 
    GET_ORGANIZATIONS_FAILURE, 
    GET_ORGANIZATION_USERS_STARTED,
    GET_ORGANIZATION_USERS_SUCCESS,
    GET_ORGANIZATION_USERS_FAILURE 
} from '../actions/organization';

const initialState = {
    organization: null,
    teams: [],
    users: [],
    error: false,
    loading: false
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
        default:
            //do nothing
            return state;
    }
    const newState = Object.assign({}, state, updatedState);
    return newState;
};