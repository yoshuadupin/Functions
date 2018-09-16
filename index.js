const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const ref = admin.database().ref();
exports.onCreateUser = functions.auth.user().onCreate(user => {
  const uid = user.uid;
  const email = user.email;
  const photoUrl = user.photoURL;
  const newUserRef = ref.child(`/users/${uid}`);
  return newUserRef.set({
    uid: uid,
    photoUrl: photoUrl,
    email: email
  });
});

exports.countFavs = functions.database
  .ref("/posts/{postId}/favs/{favuid}")
  .onWrite(change => {
    
    const collectionRef = change.after.ref.parent;
    const countRef = collectionRef.parent.child("contFav");

    let increment;
    if (change.after.exists() && !change.before.exists()) {
      increment = 1;
    } else if (!change.after.exists() && change.before.exists()) {
      increment = -1;
    } else {
      return null;
    }

    // Return the promise from countRef.transaction() so our function
    // waits for this async event to complete before it exits.
    return countRef
      .transaction(current => {
        return (current || 0) + increment;
      })
      .then(() => {
        return console.log("Counter updated.");
      });
  });



  exports.recountFavs = functions.database.ref('/posts/{postid}/contFav').onDelete((snap) => {
    const counterRef = snap.ref;
    const collectionRef = counterRef.parent.child('favs');
  
    // Return the promise from counterRef.set() so our function
    // waits for this async event to complete before it exits.
    return collectionRef.once('value')
        .then((messagesData) => counterRef.set(messagesData.numChildren()));
        
  });

  exports.countComments = functions.database
  .ref("/posts/{postId}/comments/{commentid}")
  .onWrite(change => {
    const collectionRef = change.after.ref.parent;
    const countRef = collectionRef.parent.child("countComment");

    let increment;
    if (change.after.exists() && !change.before.exists()) {
      increment = 1;
    } 

    // Return the promise from countRef.transaction() so our function
    // waits for this async event to complete before it exits.
    return countRef
      .transaction(current => {
        return (current || 0) + increment;
      })
      .then(() => {
        return console.log("Counter updated.");
      });
  });

  exports.recountComments = functions.database.ref('/posts/{postid}/countComment').onDelete((snap) => {
    
    const counterRef = snap.ref;
    const collectionRef = counterRef.parent.child('comments');
  
    // Return the promise from counterRef.set() so our function
    // waits for this async event to complete before it exits.
    return collectionRef.once('value')
        .then((messagesData) => counterRef.set(messagesData.numChildren()));
        
  });