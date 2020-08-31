import React from 'react';
import routes from '../constants/routes.json';
import { Link } from 'react-router-dom';
import SendMessage from './SendMessage';
import { Container, Image, Button, Card, CardColumns, Navbar, Row, Col, OverlayTrigger, Overlay, Popover, Tooltip, Form } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import RecordRTC from 'recordrtc';
import { StereoAudioRecorder } from 'recordrtc';
import Autosuggest from 'react-autosuggest';
import videojs from 'video.js'
import posthog from 'posthog-js';

class NewMessage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            suggestions: [],
            suggestionValue: null,
            suggestionDisplayValue: '',
        };

        this.getSuggestions = this.getSuggestions.bind(this);
        this.handleSuggestionChange = this.handleSuggestionChange.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);

    }

    componentDidMount() {
        const { organizationUsers } = this.props;

        let users = [];

        organizationUsers.forEach(user => {
            users.push({
                id: user.id,
                name: user.first_name + ' ' + user.last_name,
                avatar_url: user.avatar_url,
            });
        })

        this.setState({ users });
    }

    componentDidUpdate() {
    }

    componentWillUnmount() {
    }

    getSuggestions(value) {
        const { users } = this.state;

        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        return inputLength === 0 ? [] : users.filter(user =>
            user.name.toLowerCase().slice(0, inputLength) === inputValue
        );
    }

    handleSuggestionChange(event, { newValue }) {
        if (typeof newValue.id !== "undefined") {
            return this.setState({ suggestionValue: newValue.id, suggestionDisplayValue: newValue.name });
        }

        this.setState({ suggestionDisplayValue: newValue });
    }

    onSuggestionsFetchRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value)
        });
    }

    onSuggestionsClearRequested() {
        this.setState({ suggestions: [] });
    }

    render() {
        const { settings, user } = this.props;
        const { suggestions, suggestionDisplayValue } = this.state;

        return (
            <div className="d-flex flex-column" style={{height: process.env.REACT_APP_PLATFORM === "web" ? 'calc(100vh - 30px)' : 'calc(100vh - 22px)'}}>
                <Autosuggest
                    suggestions={suggestions}
                    getSuggestionValue={(suggestion) => {
                        return suggestion;
                    }}
                    renderSuggestion={(suggestion) => {
                        return (
                            <div className="align-items-center d-flex">
                                <p className="text-left align-self-center mb-0" style={{fontWeight:600,fontSize:"1rem",width:"100%",color:"black"}}>
                                    <Image src={suggestion.avatar_url} fluid rounded style={{maxHeight:30}} className="pr-2" />
                                    {suggestion.name}
                                </p>
                            </div>
                        )
                    }}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    inputProps={{
                        placeholder: "Type the name of a teammate",
                        value: suggestionDisplayValue,
                        onChange: this.handleSuggestionChange
                    }}
                    theme={{
                        input: 'form-control form-control-lg',
                        suggestionsList: 'list-group',
                        suggestion: 'list-group-item',
                    }}
                />
                <SendMessage settings={settings} user={user} />
            </div>
        )
    }

}

export default NewMessage;