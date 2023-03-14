import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import NavigationBar from "./components/navbar.component";
import UserRegister from './views/UserRegister';
import { Container } from 'react-bootstrap';
import Login from './views/Login';
import APIClientServer from './API/APIClientServer';
import { useState } from 'react';

function App() {
	const [token, setToken] = useState(window.localStorage.getItem('token'));
	const client = new APIClientServer(() => token, logout, setError);

	function login(token) {
		window.localStorage.setItem('token', token);
		setToken(token);
	}

	function logout() {
		window.localStorage.removeItem('token');
		setToken(null);
	}

	const [msgData, setMsgData] = useState({ msg: null, type: null });

	// Error handling
	function setError(msg) {
		setMsgData({ type: "err", msg });
	}

	return (
		<>
			<Container className="my-container">
				<main>
          <NavigationBar />
					<Routes>
						<Route path="/register" element={
							<UserRegister />
						} />
						<Route path="/" element={
							<>
								{(token) ?
									<h1>You are already logged in</h1> :
									<Login
										client={client}
										login={login}
									/>}
							</>
						} />
					</Routes>
				</main>
			</Container>
		</>
	);
}

export default App;
