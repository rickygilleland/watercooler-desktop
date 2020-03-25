import { Action } from 'redux';
import { GET_ROOMS_SUCCESS, GET_ROOMS_FAILURE } from '../actions/room';

const initialState = {
    organization: null,
    teams: [],
}

export default function room(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_ROOMS_SUCCESS:
            updatedState = {
                organization: {
                    id: action.response.id,
                    name: action.response.name,
                    slug: action.response.slug
                },
                teams: action.response.teams
            }
            break;
        case GET_ROOMS_FAILURE:
            break;
        default:
            //do nothing
            break;
    }
    const newState = Object.assign({}, state, updatedState);
    return newState;
};