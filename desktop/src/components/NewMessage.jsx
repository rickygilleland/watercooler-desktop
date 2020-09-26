import React from 'react';
import SendMessage from './SendMessage';
import { Image, Row, Col, Button } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { 
    faWindowClose
} from '@fortawesome/free-solid-svg-icons';
import Autosuggest from 'react-autosuggest';
import posthog, { push } from 'posthog-js';

class NewMessage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            suggestions: [],
            suggestionValue: [],
            suggestionDisplayValue: '',
            messageCreated: false,
        };

        this.getSuggestions = this.getSuggestions.bind(this);
        this.handleSuggestionChange = this.handleSuggestionChange.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);

    }

    componentDidMount() {
        const { organizationUsers, location } = this.props;

        let users = [];

        organizationUsers.forEach(user => {
            users[user.id] = {
                id: user.id,
                name: user.first_name + ' ' + user.last_name,
                avatar_url: user.avatar_url,
            }
        })

        this.setState({ users });

        if (typeof location.state != "undefined" && typeof location.state.recipient != "undefined") {
            this.setState({ 
                suggestionValue: [location.state.recipient.id], 
                suggestionDisplayValue: location.state.recipient.first_name + ' ' + location.state.recipient.last_name 
            });
        }
    }

    componentDidUpdate(prevProps) {
        const { push, messageLoading, lastCreatedMessage, messageError } = this.props;
        const { messageCreated } = this.state;

        if (messageCreated && !messageLoading && prevProps.message == null && messageError === false && lastCreatedMessage != null) {
            if (lastCreatedMessage.thread.type == "public") {
                return push("/thread/public");
            }
            return push(`/thread/${lastCreatedMessage.thread.type}/${lastCreatedMessage.thread.slug}`);
        }
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
            let updatedSuggestions =  [...this.state.suggestionValue];
            updatedSuggestions.push(newValue.id);

            return this.setState({ suggestionValue: updatedSuggestions, suggestionDisplayValue: '' });
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
        const { settings, user, createMessage, organization, messageCreating } = this.props;
        const { suggestions, suggestionValue, suggestionDisplayValue, users } = this.state;

        return (
            <div className="d-flex flex-column" style={{height: process.env.REACT_APP_PLATFORM === "web" ? 'calc(100vh - 30px)' : 'calc(100vh - 22px)'}}>
                <Autosuggest
                    suggestions={suggestions}
                    getSuggestionValue={(suggestion) => {
                        return suggestion;
                    }}
                    renderSuggestion={(suggestion) => {
                        return (
                            <div className="align-items-center d-flex" style={{cursor:"pointer"}}>
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
                        input: 'form-control',
                        suggestionsList: 'list-group',
                        suggestion: 'list-group-item',
                    }}
                />
                <div className="mt-4">
                    {suggestionValue.length == 0 && (
                        <p style={{fontWeight:700,fontSize:"1rem"}} className="pl-3">
                            No teammates selected yet.
                        </p>
                    )}
                    {suggestionValue.map(selectedUser => {
                        return(
                            <Row className="border-bottom pb-3 pt-3 ml-2" key={selectedUser}>
                                <div style={{width:75}}>
                                    <Image src={users[selectedUser].avatar_url} fluid style={{height:50,borderRadius:15}} className="shadow" />
                                </div>
                                <div className="align-self-center">
                                    <p style={{fontWeight:700,fontSize:"1.2rem"}}>{users[selectedUser].name}</p>
                                </div>
                                <div className="ml-auto mr-5">
                                    <Button
                                        variant="danger"
                                        style={{color:"#fff",fontSize:"1rem",minWidth:"2.5rem",minHeight:"2.5rem"}} 
                                        onClick={() => {
                                            let updatedSuggestions = suggestionValue.filter(filtered => {
                                                return filtered != selectedUser;
                                            })

                                            this.setState({ suggestionValue: updatedSuggestions })
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faWindowClose} />
                                    </Button>
                                </div>
                            </Row>
                        )
                    })}
                </div>
                <div className="mt-auto">
                    <SendMessage 
                        settings={settings} 
                        user={user} 
                        isLibrary={false}
                        isNewThread={true}
                        recipients={suggestionValue} 
                        createMessage={createMessage} 
                        organization={organization} 
                        messageCreating={messageCreating}
                        messageCreatedStateChange={() => this.setState({ messageCreated: true })}
                    />
                </div>
            </div>
        )
    }

}

export default NewMessage;