import React, { useEffect, useState } from 'react';
import { db, signInWithGoogle } from './firebase';
import { collection, getDocs, setDoc, query, where, addDoc, doc } from 'firebase/firestore';
import './SubjectList.css';
import ChatBox from './ChatBox'; // Import ChatBox component
import './ChatBox.css';


const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showChatBox, setShowChatBox] = useState(false); // State to toggle chat box
  const [showTutorButton, setShowTutorButton] = useState(true); // State to toggle Tutor button
  const [showTuteeButton, setShowTuteeButton] = useState(true); // State to toggle Tutee button
  const [currentUser, setCurrentUser] = useState(null); // State to hold current user data

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectCollection = collection(db, 'subjects');
        const subjectSnapshot = await getDocs(subjectCollection);
        const subjectList = subjectSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubjects(subjectList);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject.name); // Store the name of the selected subject
    setShowChatBox(false); // Reset chat box visibility
    setShowTutorButton(true); // Show Tutor button
    setShowTuteeButton(true); // Show Tutee button
  };

  const handleTutorClick = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;

      // Check if tutor with the same email already exists
      const tutorQuery = query(collection(db, 'tutors'), where('email', '==', user.email));
      const tutorSnapshot = await getDocs(tutorQuery);

      if (tutorSnapshot.empty) {
        // If tutor with this email doesn't exist, add a new document
        const tutorData = {
          name: user.displayName,
          email: user.email
        };
        await addDoc(collection(db, 'tutors'), tutorData);
        alert('Tutor signed in and data saved successfully!');
      } else {
        // If tutor with this email exists, update the existing document (using setDoc with merge)
        const tutorDoc = tutorSnapshot.docs[0]; // Assuming there's only one document for each email
        const tutorRef = doc(db, 'tutors', tutorDoc.id);
        await setDoc(tutorRef, { name: user.displayName }, { merge: true });
        alert('Tutor data updated successfully!');
      }

      // Set current user data for ChatBox
      setCurrentUser({
        name: user.displayName,
        email: user.email
      });

      setShowChatBox(true); // Show chat box after successful sign-in
      setShowTutorButton(false); // Hide Tutor button
      setShowTuteeButton(false); // Hide Tutee button
    //   setSelectedSubject(null); // Reset selected subject to hide subject details

    } catch (error) {
      console.error("Error signing in with Google: ", error);
      alert('Failed to sign in with Google. Check the console for more details.');
    }
  };

  const handleTuteeClick = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;

      // Check if tutee with the same email already exists
      const tuteeQuery = query(collection(db, 'tutee'), where('email', '==', user.email));
      const tuteeSnapshot = await getDocs(tuteeQuery);

      if (tuteeSnapshot.empty) {
        // If tutee with this email doesn't exist, add a new document
        const tuteeData = {
          name: user.displayName,
          email: user.email
        };
        await addDoc(collection(db, 'tutee'), tuteeData);
        alert('Tutee signed in and data saved successfully!');
      } else {
        // If tutee with this email exists, update the existing document (using setDoc with merge)
        const tuteeDoc = tuteeSnapshot.docs[0]; // Assuming there's only one document for each email
        const tuteeRef = doc(db, 'tutee', tuteeDoc.id);
        await setDoc(tuteeRef, { name: user.displayName }, { merge: true });
        alert('Tutee data updated successfully!');
      }

      // Set current user data for ChatBox
      setCurrentUser({
        name: user.displayName,
        email: user.email
      });

      setShowChatBox(true); // Show chat box after successful sign-in
      setShowTutorButton(false); // Hide Tutor button
      setShowTuteeButton(false); // Hide Tutee button
    //   setSelectedSubject(null); // Reset selected subject to hide subject details

    } catch (error) {
      console.error("Error signing in with Google: ", error);
      alert('Failed to sign in with Google. Check the console for more details.');
    }
  };

  return (
    <div>
      {showChatBox && <ChatBox currentUser={currentUser} selectedSubject={selectedSubject} />} {/* Pass currentUser and selectedSubject to ChatBox */}

      {!showChatBox && (
        <div>
          <h1 style={{fontFamily: 'Lilita One, sans-serif'}} >Subjects</h1>
          <ul className="subject-list">
            {subjects.map(subject => (
              <li style={{fontFamily: 'Lilita One, sans-serif'}}  key={subject.id} onClick={() => handleSubjectClick(subject)}>
                {subject.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedSubject && !showChatBox && (
        <div>
          <h2>{selectedSubject}</h2>
          <div className="button-group">
            {showTutorButton && <button style={{fontFamily: 'Lilita One, sans-serif'}} onClick={handleTutorClick}>Tutor</button>}
            {showTuteeButton && <button style={{fontFamily: 'Lilita One, sans-serif'}}  onClick={handleTuteeClick}>Tutee</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectList;
