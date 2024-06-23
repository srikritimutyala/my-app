// App.js

import React, { useState } from 'react';
import './App.css';
import SubjectList from './SubjectList';
import ChatBox from './ChatBox';
import { auth, signInWithGoogle } from './firebase';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      setCurrentUser(user);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      alert('Failed to sign in with Google');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
       
          <div>
            <div className="main-content">
              <SubjectList />
              {/* <ChatBox currentUser={currentUser} /> */}
            </div>
          </div>
        
      </header>
    </div>
  );
}

export default App;
