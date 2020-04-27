import { Action } from 'redux';
import { GET_ORGANIZATIONS_SUCCESS, GET_ORGANIZATIONS_FAILURE } from '../actions/organization';

const initialState = {
    organization: null,
    teams: [],
    error: false,
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
            return state;
        default:
            //do nothing
            return state;
    }
    const newState = Object.assign({}, state, updatedState);
    return newState;
};