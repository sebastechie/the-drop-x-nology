import React, { Component } from "react";
import { Router, globalHistory } from "@reach/router";
import LandingPage from "../containers/LandingPage";
import LoginPage from "../containers/LoginPage/LoginPage";
import Fan from "../containers/Main/Fan";
import Artist from "../containers/Main/Artist";
import NotFound from "../components/Navbar/NotFound";

import firebase, { providers } from "../firebase";
import PrivateRoutes from "./PrivateRoutes.jsx";

export default class Routes extends Component {
    state = {
        user: null,
        additionalUserInfo: null,
        loginFormData: {
            email: "",
            password: ""
        }
    };

    componentDidMount() {
        this.authListener();
    }

    authListener() {
        firebase.auth().onAuthStateChanged((user) => {
            console.log(user);
            if (user) {
                this.setState({ user });
                //retrives the uid
                localStorage.setItem('user', user.uid);
            } else {
                this.setState({ user: null });
                localStorage.removeItem('user');
            }
        })
    }

    signIn = () => {
        console.log("signing in")
        firebase
            .auth()
            .signInWithPopup(providers.google)
            .then(result => {
                this.setState({
                    user: result.user,
                    additionalUserInfo: result.additionalUserInfo
                });
                globalHistory.navigate("/app/initial-login");
            })
            .catch(error => {
                console.log(error);
            });
    };

    signInWithEmailAndPassword = (event) => {
        // DONT RELOAD THE PAGE
        event.preventDefault()
        firebase
            .auth()
            .signInWithEmailAndPassword(this.state.loginFormData.email, this.state.loginFormData.password)
            .then(result => {
                this.setState({
                    user: result.user,
                    additionalUserInfo: result.additionalUserInfo
                });
                globalHistory.navigate("/private/initial-login"); 
            })
            .catch(error => {
                console.log(error);
            })
    }

    signOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                this.setState({ user: null });
                globalHistory.navigate("/");
            });
    };

    handleLoginDetails = (event) => {
        this.setState({
            loginFormData: {
                ...this.state.loginFormData,
                [event.target.name]: event.target.value
            }
        })
    }

    signUp = (event) => {
        event.preventDefault();
        firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.loginFormData.email, this.state.loginFormData.password)
            .then((result) => {
                this.setState({
                    user: result.user,
                    additionalUserInfo: result.additionalUserInfo
                });
                // Add something to session so that user is logged in
                //localStorage/sessionStorage
                globalHistory.navigate("/private/initial-login");
            })
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        return (
            <Router>
                <LoginPage path="/" signIn={this.signIn} />
                <PrivateRoutes path="app" user={this.state.user}>
                    <LandingPage
                        user={this.state.user}
                        additionalUserInfo={this.state.additionalUserInfo}
                        path="initial-login"
                    />
                    <Fan path="fan/*" />
                    <Artist user={this.state.user} path="artist/*" />
                </PrivateRoutes>
                <NotFound default />
            </Router>
        );
    }
}
