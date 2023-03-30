// Main CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";

// React and other packages
import React, { useState, useEffect, useRef } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";

// React-bootstrap components
import { Container } from "react-bootstrap";

// Core network services (try not to add to this list unless necessary!)
import UserService from "./services/userService";
import UserDataService from "./services/userDataService";
import NotificationService from "./services/notificationService";

// Our components
import NavigationBar from "./components/navbar.component";
import Footer from "./components/footer.component";
import StatusMessage from "./components/statusMessage";

// Our views (pages)
import UserRegister from "./views/UserRegister";
import Login from "./views/Login";
import UserSitePrefs from "./views/UserPrefs";
import UserProfile from "./views/UserProfile";
import Dashboard from "./views/Dashboard";
import UserAccountSettings from "./views/UserAccountSettings";
import Recipes from './views/Recipes';
import Exercises from './views/Exercises';
import FrontPage from './views/FrontPage';
import Community from './views/Community';
import CustomWorkout from './views/CustomWorkout';
import PostPage from "./views/PostPage";
import Library from "./views/Library";
import Contacts from "./views/Contacts";
import Messages from "./views/Messages";

// Contexts (global data)
import { UserContext } from "./contexts/User"; // Stores user-prefs and profile data

import NetService from "./services/netService"; // (*** don't think this should be needed ***)
import CommunityService from "./services/communityService";

// ==============================================================================

export default function App() {
	const [userDataState, userDataDispatch] = React.useContext(UserContext);

	const [token, setToken] = useState(window.localStorage.getItem('token'));
	const [initComplete, changeInitComplete] = useState(false);
	const timerRef = useRef(null);

	const commonData = {
		net: { tokenProvider: () => token, logoutHandler: logout, errHandler: setErrorFromNetResponse }
	};

	const userService = new UserService(commonData.net);
	const navigate = useNavigate();

	function login(token) {
		window.localStorage.setItem('token', token);
		setToken(token);
	}

	// === Retrieve user data ===
	function getUserData() {
		const userDataService = new UserDataService(commonData.net);
		userDataService.retrieve()
			.then(({data: { userPrefs, userProfile, contacts, messageMetas }}) => {
				console.log("RETRIEVING USER DATA FROM ENDPOINT");
				userDataDispatch({ type: "setPrefs", data: userPrefs || {} });
				userDataDispatch({ type: "setProfile", data: userProfile || {} });
				userDataDispatch({ type: "setContacts", data: contacts});
				userDataDispatch({ type: "setMessageMetas", data: messageMetas});
				if (!(userPrefs?.onboardingStageComplete)) navigate('/prefs'); // Start or resume setting up site prefs
				else if (!(userProfile?.onboardingStageComplete)) navigate('/profile/main'); // Start or resume setting up user profile

				changeInitComplete(true);
			});
	}

	// Get user prefs and profile info straight after login
	useEffect(() => {
		if (token) getUserData(); // Development note: This gets called twice in strict mode (which is expected behavior)
	}, [token]);

	// === Retrieve notifications ===
	function getNotifications() {
		console.log("RETRIEVING NOTIFICATIONS");
		const notificationService = new NotificationService(commonData.net);

		notificationService.retrieve().then(({ data }) => {
			userDataDispatch({ type: "setNotifications", data });
		});
	}

	// Start polling for notifications
	useEffect(() => {
		if (timerRef.current) {
			console.log("STOPPING POLLING TIMER FOR NOTIFICATIONS");
			clearInterval(timerRef.current);
			timerRef.current = 0;
		}
		if (initComplete) {
			getNotifications();
			console.log("STARTING POLLING TIMER FOR NOTIFICATIONS");
			timerRef.current = setInterval(getNotifications, 10000);
		}

	}, [initComplete]);

	// ==============================================================================

	function logout() {
		userService.logout();
		window.localStorage.removeItem('token');
		setToken(null);
		changeInitComplete(null);
		navigate('/login');
	}

	// Error handling
	const [msgData, setMsgData] = useState({ msg: null, type: null });
	function setError(msg) {
		setMsgData({ type: "err", msg });
	}
	function setErrorFromNetResponse(statusCode, statusPhrase, errorMessage) {
		if (statusCode !== null) {
			const msg = statusCode + ': ' + statusPhrase + (errorMessage ? (" (" + errorMessage + ")") : "");
			setError(msg);
		}
		else setError(null);
	}

	const [recipes, changeRecipes] = useState([]);
	const [currentRecipe, changeCurrentRecipe] = useState({
		title: "Basic Chicken",
		ingredients: [
			"1/2 cup butter",
		],
		instructions: {},
		image: "https://spoonacular.com/recipeImages/602638-556x370.jpg",
		ingredientsImages: [
			"https://spoonacular.com/cdn/ingredients_100x100/butter-sliced.jpg",
			"2 cups"
		]
	});

	const [savedRecipes, changeSavedRecipes] = useState([]);

	const netService = new NetService(commonData.net);

	const [exercises, changeExercises] = useState([]);

	const [isRedHeart, changeIsRedHeart] = useState(false);

	const [currentPost, changeCurrentPost] = useState({
		title: "Basic Post",
		description: "This is a basic post",
		imageUrl: "https://spoonacular.com/recipeImages/602638-556x370.jpg",
		date: "2021-04-01",
		comments: [],
		likes: 0,
	});

	const [comments, changeComments] = useState([]);

	const [likeCounter, changeLikeCounter] = useState(0)
	const [lolCounter, changeLolCounter] = useState(0)
	const [commentCounter, changeCommentCounter] = useState(0)


	// Template
	return (
		<>
			<StatusMessage msgData={msgData} setMsgData={setMsgData} />

			{(initComplete) && <NavigationBar logout={logout} userIdentifier={userDataState.profile.userName} />}

			<Container className="my-container">
				<main className="main-container">

					<Routes>
						<Route path="/register" element={
							<UserRegister viewCommon={commonData} />
						} />

						<Route path="/login" element={
							<Login viewCommon={commonData} login={login} />
						} />

						<Route path="/community" element={
							<Community
								viewCommon={commonData}
								changeCurrentPost={changeCurrentPost}
							/>
						} />
						<Route path="/myworkout" element={
							<CustomWorkout viewCommon={commonData} />
						} />
						<Route path="/library" element={
							<Library
								viewCommon={commonData}
								savedRecipes={savedRecipes}
								changeSavedRecipes={changeSavedRecipes}
								currentRecipe={currentRecipe}
							/>
						} />
						<Route path="/postview" element={
							<PostPage
								viewCommon={commonData}
								currentPost={currentPost}
								comments={comments}
								changeComments={changeComments}
								likeCounter={likeCounter}
								changeLikeCounter={changeLikeCounter}
								lolCounter={lolCounter}
								changeLolCounter={changeLolCounter}
								commentCounter={commentCounter}
								changeCommentCounter={changeCommentCounter}
							/>
						} />

						{(initComplete) &&
							<Route path="/prefs" element={
								<UserSitePrefs viewCommon={commonData}
									nextPage={!userDataState.prefs.onboardingStageComplete && "/profile/main"} />
							} />}

						{(initComplete) &&
							<Route path="/profile/:section" element={
								<UserProfile viewCommon={commonData}
									nextPage={!userDataState.profile.onboardingStageComplete && "/"} />
							} />}

						{(token) &&
							<Route path="/account" element={
								<UserAccountSettings viewCommon={commonData}
									logout={logout} />
							} />}

						{(initComplete) &&
							<Route path="/contacts" element={
								<Contacts viewCommon={commonData} />
							} />}

						{(initComplete) &&
							<Route path="/messages" element={
								<Messages viewCommon={commonData} />
							} />}

						{(initComplete) &&
							<Route path="/messages/:id" element={
								<Messages viewCommon={commonData} />
							} />}

						<Route path="/" element={
							<>
								{(initComplete) ?
									<Dashboard
										viewCommon={commonData}
									/> :
									(!token) && <FrontPage
									/>}
							</>
						} />

						{(initComplete) &&
							<Route path="/recipe" element={
								<Recipes viewCommon={commonData}
									netService={netService}
									recipes={recipes}
									changeRecipes={(recipes) => changeRecipes(recipes)}
									currentRecipe={currentRecipe}
									changeCurrentRecipe={(recipe) => changeCurrentRecipe(recipe)}
									isRedHeart={isRedHeart}
									changeIsRedHeart={(isRedHeart) => changeIsRedHeart(isRedHeart)}
									savedRecipes={savedRecipes}
									changeSavedRecipes={(savedRecipes) => changeSavedRecipes(savedRecipes)}
								/>
							} />}


						{(initComplete) &&
							<Route path="/exc" element={
								<Exercises viewCommon={commonData}
									exercises={exercises}
									changeExercises={(exercises) => changeExercises(exercises)}

								/>
							} />}

						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</main>
			</Container>
			<Footer />
		</>
	);
}