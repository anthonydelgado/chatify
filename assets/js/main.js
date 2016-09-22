/**
 * Created by anthony delgado on 9/19/16.
 */

    // Initialize Firebase
var config = {
        apiKey: "AIzaSyAplwiRRuCf85VD8Z3ie5CnowfBmJTJWJU",
        authDomain: "chatify-9724a.firebaseapp.com",
        databaseURL: "https://chatify-9724a.firebaseio.com",
        storageBucket: "",
        messagingSenderId: "206585008932"
    };
firebase.initializeApp(config);


//initial variables
var database = firebase.database();


var buddyList = firebase.database().ref('presence/');


// var commentsRef = firebase.database().ref('post-comments/' + postId);
// var commentsRef = firebase.database().ref('post-comments/' + postId);

    /**
     * Handles the sign in button press.
     */
    function toggleSignIn() {
    if (firebase.auth().currentUser) {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
} else {
    var email = document.getElementById('login_email').value;
    var password = document.getElementById('login_password').value;
    if (email.length < 4) {
    alert('Please enter an email address.');
    return;
}
    if (password.length < 4) {
    alert('Please enter a password.');
    return;
}
    // Sign in with email and pass.
    // [START authwithemail]
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode === 'auth/wrong-password') {
    alert('Wrong password.');
} else {
    alert(errorMessage);
}
    console.log(error);
});
    // [END authwithemail]
}

}


/**
 * Handles the sign out button press.
 */

function handleSignOut() {

    var user = firebase.auth().currentUser;

    database.ref('presence/' + user.uid).remove();

    firebase.auth().signOut();

}

    /**
     * Handles the sign up button press.
     */
    function handleSignUp() {
        var email = document.getElementById('signup_email').value;
        var password = document.getElementById('signup_password').value;
    if (email.length < 4) {
    alert('Please enter an email address.');
    return;
}
    if (password.length < 4) {
    alert('Please enter a password.');
    return;
}
    // Sign in with email and pass.
    // [START createwithemail]
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/weak-password') {
    alert('The password is too weak.');
} else {
    alert(errorMessage);
}
    console.log(error);
    // [END_EXCLUDE]
});
    // [END createwithemail]
}

    /**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     */
    function initApp() {
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user) {

        if (user) {
            // If User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
            console.log(user);
            console.log('You are signed in as ' + email);


            database.ref('users/' + user.uid).set({
                username: displayName,
                email: email,
                emailVerified: emailVerified,
                avatar: photoURL,
                isAnonymous: isAnonymous,
                id: uid,
                lastActive: firebase.database.ServerValue.TIMESTAMP
            });

            $('#nav-email').text(email);
            // get the email
            $('#nav-avatar').attr('src', 'http://www.gravatar.com/avatar/' + md5(email));


            if (!emailVerified) {
                // console.log('email not Verified');
            }
            // [END_EXCLUDE]

            var disconnectRef = database.ref('presence/' + user.uid);
            disconnectRef.onDisconnect().remove();

            var disconnectgamerequest = database.ref('gamerequest/' + user.uid);
            disconnectgamerequest.onDisconnect().remove();


            firebase.database().ref('.info/connected').on('value', function(connectedSnap) {
                if (connectedSnap.val() === true) {
                    /* we're connected! */

                    database.ref('presence/' + user.uid).set({
                        username: user.displayName,
                        email: user.email,
                        avatar: photoURL,
                        isAnonymous: isAnonymous,
                        id: uid,
                        lastActive: firebase.database.ServerValue.TIMESTAMP
                    });

                } else {
                    /* we're disconnected! */
                    database.ref('presence/' + user.uid).remove();
                }
            });

            $('.app-loggedin').fadeIn();
            $('.app-loggedout').fadeOut();





            database.ref().on("child_changed", function(childSnapshot, prevChildKey) {


                //test output
                console.log('data changed child_changed');
                // console.log(childSnapshot.val());
                $('#onlinelist').empty();

                $.each(childSnapshot.val(), function( index, value ) {
                    // console.log( index );

                    var starCountRef = firebase.database().ref('presence/' + index + '');
                    starCountRef.on('value', function(snapshot) {
                        console.log(snapshot.val().email);
                        var item = '<li class="collection-item play" data-to="' + snapshot.val().id + '" data-from="' + user.uid + '"><div>' + snapshot.val().email + '<a href="#!" class="secondary-content"><i class="material-icons">send</i></a></div></li>';
                        $('#onlinelist').append(item);
                    });


                });

            }, function(errorObject){
                console.log("ERROR! "+ errorObject.code)

            });


        } else {
            // User is signed out.
            console.log('You are signed out');
            $('.app-loggedout').fadeIn();
            $('.app-loggedin').fadeOut();
        }

    });
    // [END authstatelistener]

        document.getElementById('chatify-sign-in').addEventListener('click', toggleSignIn, false);
        document.getElementById('chatify-sign-up').addEventListener('click', handleSignUp, false);
        document.getElementById('chatify-logout').addEventListener('click', handleSignOut, false);

        $(document).on("click",".play",function() {
            var to = $(this).data('to');
            var from = $(this).data('from');

            database.ref('gamerequest/' + to).set({
                to: to,
                from: from,
                lastActive: firebase.database.ServerValue.TIMESTAMP
            });

        });







}



    window.onload = function() {
    initApp();
    };

// Initialize collapse button
$(".shownav").sideNav();
// Initialize collapsible (uncomment the line below if you use the dropdown variation)
//$('.collapsible').collapsible();
