import { arrayRemove, arrayUnion, collection, getDocs, increment } from 'firebase/firestore';
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; 
import { uuidv4 } from '@firebase/util';
import FirebaseCore from './FirebaseCore';

let db = FirebaseCore.db;

async function create(name: string) {
    const communityID = uuidv4();
    const result = await setDoc(doc(db, "communities", communityID), {id: communityID, name: name, numOfMembers: 0, posts: []});
}
  
async function getAll() {
    const communitiesCol = collection(db, 'communities');
    const communitiesSnapshot = await getDocs(communitiesCol);
    const communitiesList = communitiesSnapshot.docs.map(doc => doc.data());
    return communitiesList;
}
  
async function get(communityID: string) {
    const docRef = doc(db, "communities", communityID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
}

async function join(communityID: string, userID: string) {
    const userDocRef = doc(db, "users", userID);
    const communityDocRef = doc(db, "communities", communityID);
    const result = await updateDoc(userDocRef, {
        communitiesJoined: arrayUnion(communityID)
    })
    const result2 = await updateDoc(communityDocRef, {
        numOfMembers: increment(1)
    }) 
}

async function leave(communityID: string, userID: string) {
    const userDocRef = doc(db, "users", userID);
    const communityDocRef = doc(db, "communities", communityID);
    const result = await updateDoc(userDocRef, {
        communitiesJoined: arrayRemove(communityID)
    })
    const result2 = await updateDoc(communityDocRef, {
        numOfMembers: increment(-1)
    }) 
}

const community = {
    get: get,
    getAll: getAll,
    create: create,
    join: join,
    leave: leave
}
  
export default community;