import React, { useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { getUsername, setUsername } from "./persistence/localRepository";

const Username = () => {
    const username = getUsername();
    const name = useRef(null);
    const navigate = useNavigate();

    const goToLobby = (e) => {
        e.preventDefault();
        navigate('/lobby');
    }

    const saveUsername = (e) => {
        setUsername(name.current.value);
        goToLobby(e);
    }

    if (username) {
        return (
            <div className="message">
                <p>Welcome back {username}</p>
                <form onSubmit={goToLobby}>
                    <button type="submit">PLAY NOW!</button>
                </form>
            </div>
        );
    }

    return (
        <form className="message" onSubmit={saveUsername}>
            <h2>Enter your username</h2>
            <input
                type="text"
                ref={name}
                required
                placeholder="username"
            />
            <button type="submit">CONFIRM</button>
        </form>
    );

};

export default Username;