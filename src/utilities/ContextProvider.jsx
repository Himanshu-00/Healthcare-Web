import { createContext, useState, useEffect } from 'react';
import { auth, db } from '../../src/firebaseConfig'; // Your Firebase setup
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [username, setUsername] = useState('...');
    const [fullname, setFullname] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const uid = user.uid;
                const userDocRef = doc(db, "users", uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const name = userDoc.data().username || 'User';
                    const fullname = userDoc.data().username || 'User';
                    setUsername(name.split(" ")[0]);
                    setFullname(fullname);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ username, fullname }}>
            {children}
        </UserContext.Provider>
    );
};
