
//const gapi = window.gapi
import firebase from 'firebase'
import {config, fire} from "../src/config/fire"

const AUTH_SCOPES = [
    'email',
    'profile',
    'https://www.googleapis.com/auth/analytics.readonly',
  ]

  /***************************************************************************
   * Initialize Firebase
   */
  // OVERWRITE ME
  /*
  {
    apiKey: "...",
    authDomain: "my-app.firebaseapp.com",
    databaseURL: "https://my-app.firebaseio.com",
    projectId: "my-app-5e480",
    storageBucket: "my-app-5e480.appspot.com",
    messagingSenderId: "..."
  }
  */
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAeREgt3YM_FPtwhYnMWF_AijkdYwyykR0",
    authDomain: "mosh-37501.firebaseapp.com",
    databaseURL: "https://mosh-37501.firebaseio.com",
    projectId: "mosh-37501",
    storageBucket: "mosh-37501.appspot.com",
    messagingSenderId: "806342003387",
    appId: "1:806342003387:web:f508ba713ee85e2683f79e",
    measurementId: "G-QVRJRKC8QL"
  }
  const fb = firebase.initializeApp(FIREBASE_CONFIG)

  // OVERWRITE ME
  // ....apps.googleusercontent.com
  const CLIENT_ID = '542831090816-nvuicfih0d0ulh87cjinkfrmg1tlfciq.apps.googleusercontent.com'

  function handleIsSignedIn(isSignedIn) {
    if (isSignedIn) {

      const auth2 = gapi.auth2.getAuthInstance()
      const currentUser = auth2.currentUser.get()
      const profile = currentUser.getBasicProfile()

      const authResponse = currentUser.getAuthResponse(true)
      const credential = firebase.auth.GoogleAuthProvider.credential(
        authResponse.id_token,
        authResponse.access_token
      )
      fire.auth().signInWithCredential(credential)
        .then(({ user }) => {
          console.log("User signed in")
        })

      // Try to make a request to Google Analytics!
      gapi.client.analytics.management.accounts.list()
        .then((response) => {
          console.log('Google Analytics request successful!')
          if (response.result.items && response.result.items.length) {
            const accountNames = response.result.items.map(account => account.name)
            alert('Google Analytics account names: ' + accountNames.join(' '))
          }
        })
    } else {
      console.log('gapi: user is not signed in')
    }
  }

  new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      resolve()
    })
  })
  .then(() => {})
  .then(() => {
    return gapi.client.init({
      apiKey: FIREBASE_CONFIG.apiKey,
      clientId: CLIENT_ID,
      scope: AUTH_SCOPES.join(' '),
    })
  })
  .then(() => { console.log('gapi: client initialized') })
  .then(() => { return gapi.client.load('analytics', 'v3') })
  .then(() => {})
  .then(() => {
    const auth2 = gapi.auth2.getAuthInstance()
    auth2.isSignedIn.listen(handleIsSignedIn)
    handleIsSignedIn(auth2.isSignedIn.get())
    document.querySelector('#sign_in')
      .addEventListener('click', function handleSignIn() {
        const auth2 = gapi.auth2.getAuthInstance()
        if (auth2.isSignedIn.get()) {
          alert('already signed in')
          return
        }

        auth2.signIn()
          .catch(error => { alert(`sign in error: ${error}`) })
      })
    document.querySelector('#sign_out')
      .addEventListener('click', function handleSignOut() {
        console.log('signing out...')
        const auth2 = gapi.auth2.getAuthInstance()
        if (!auth2.isSignedIn.get()) {
          alert('Not signed in!')
          return
        }

        auth2.signOut()
          .then(() => { console.log('gapi: sign out complete') })
          .then(() => { return fb.auth().signOut() })
          .then(() => { console.log('firebase: sign out complete') })
      })
  })