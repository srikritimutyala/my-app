import React, {  useEffect, useMemo, useRef, useState } from 'react';
import { db } from './firebase'; // Import Firebase db instance
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';
import './ChatBox.css';
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { authToken, createMeeting } from "./API.js";
import ReactPlayer from "react-player";

function JoinScreen({ getMeetingAndToken }) {
  const [meetingId, setMeetingId] = useState(null);
  const onClick = async () => {
    await getMeetingAndToken(meetingId);
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter Meeting Id"
        style={{ 
          marginTop: '10px', 
          padding: '10px 20px', 
          borderRadius: '20px', 
          fontFamily: 'Arial, sans-serif', 
          fontSize: '14px', 
          background:"#bbdefb", 
          fontFamily: 'Urbanist, sans-serif'
        }} 
        onChange={(e) => {
          setMeetingId(e.target.value);
        }}
      />
      <button  style={{ 
          marginTop: '10px', 
          padding: '10px 20px', 
          borderRadius: '20px', 
          fontFamily: 'Arial, sans-serif', 
          fontSize: '14px', 
          background:"#bbdefb", 
          fontFamily: 'Urbanist, sans-serif'
        }}  onClick={onClick}>Join</button>
      {" or "}
      <button  style={{ 
          marginTop: '10px', 
          padding: '10px 20px', 
          borderRadius: '20px', 
          fontFamily: 'Arial, sans-serif', 
          fontSize: '14px', 
          background:"#bbdefb", 
          fontFamily: 'Urbanist, sans-serif'
        }}  onClick={onClick}>Create Meeting</button>
    </div>
  );
}

function MeetingView(props) {
  const [joined, setJoined] = useState(null);
  //Get the method which will be used to join the meeting.
  //We will also get the participants list to display all participants
  const { join, participants } = useMeeting({
    //callback for when meeting is joined successfully
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    //callback for when meeting is left
    onMeetingLeft: () => {
      props.onMeetingLeave();
    },
  });
  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
    <div className="container">
      <h3>Meeting Id: {props.meetingId}</h3>
      {joined && joined == "JOINED" ? (
        <div>
          <Controls />
          {[...participants.keys()].map((participantId) => (
            <ParticipantView
              participantId={participantId}
              key={participantId}
            />
          ))}
        </div>
      ) : joined && joined == "JOINING" ? (
        <p>Joining the meeting...</p>
      ) : (
        <button onClick={joinMeeting}>Join</button>
      )}
    </div>
  );
}

function Controls() {
  const [webcamOn, setWebcamOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const { leave, toggleMic, toggleWebcam } = useMeeting();

  const handleToggleWebcam = () => {
    toggleWebcam();
    setWebcamOn(prevWebcamOn => !prevWebcamOn);
  };

  const handleToggleMic = () => {
    toggleMic();
    setMicOn(prevMicOn => !prevMicOn);
  };

  return (
    <div>
      <button 
        style={{ 
          marginTop: '10px', 
          padding: '10px 20px', 
          borderRadius: '20px', 
          fontFamily: 'Arial, sans-serif', 
          fontSize: '14px', 
          background:"#bbdefb", 
          fontFamily: 'Urbanist, sans-serif'
        }} 
        onClick={() => leave()}
      >
        Leave Meeting
      </button>
      
      <button 
        style={{ 
          marginTop: '10px', 
          padding: '10px 20px', 
          borderRadius: '30px', 
          fontFamily: 'Arial, sans-serif', 
          fontSize: '20px', 
          background:"#fff",
          marginLeft:"10px",
          fontFamily: 'Urbanist, sans-serif'
        }} 
        onClick={handleToggleMic}
      >
        {micOn ? '🔇' : '🔊'}
      </button>

      <button 
        style={{ 
          marginTop: '10px', 
          padding: '10px 20px', 
          borderRadius: '30px', 
          fontFamily: 'Arial, sans-serif', 
          fontSize: '20px', 
          background:"#fff", 
          marginLeft:"10px",
          fontFamily: 'Urbanist, sans-serif'
        }} 
        onClick={handleToggleWebcam}
      >
        {webcamOn ? '📷' : '📸'}
      </button>
    </div>
  );
}


function ParticipantView(props) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(props.participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div>
      <p>
        
        
      </p>
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      {webcamOn && (
        <ReactPlayer
          //
          playsinline // extremely crucial prop
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          //
          url={videoStream}
          //
          height={"300px"}
          width={"300px"}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      )}
    </div>
  );
}

// const webcamRef = useRef(null);
// const micRef = useRef(null);

// const { webcamStream, micStream, webcamOn, micOn } = useParticipant(
//   props.participantId
// );

// const mediaStream = new MediaStream();
// mediaStream.addTrack(webcamStream.track);

// webcamRef.current.srcObject = mediaStream;
// webcamRef.current
//   .play()
//   .catch((error) => console.error("videoElem.current.play() failed", error));



const ChatBox = ({ currentUser, selectedSubject }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [tutors, setTutors] = useState([]);
  const [tutees, setTutees] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
   const [selectedTutee, setSelectedTutee] = useState(null);
   const [meetingId, setMeetingId] = useState(null);

   //Getting the meeting id by calling the api we just wrote
   const getMeetingAndToken = async (id) => {
     const meetingId =
       id == null ? await createMeeting({ token: authToken }) : id;
     setMeetingId(meetingId);
   };
 
   //This will set Meeting Id to null when meeting is left or ended
   const onMeetingLeave = () => {
     setMeetingId(null);
   };

  // Function to fetch messages
  const fetchMessages = async () => {
    try {
      if (selectedTutor.name=="Srikrit Mutyala"||selectedTutor.name=="Kalpana Mutyala") {
        console.log(selectedTutor.name+"newjkcnewjkvb")
        const q = query(
          collection(db, 'messages'),
          where('destination', '==', "Kalpana Mutyala") || where('destination', '==', "Srikrit Mutyala"),
          orderBy('timestamp', 'desc'),
          limit(10) // Limit to the latest 10 messages
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedMessages = [];
          querySnapshot.forEach((doc) => {
            fetchedMessages.push({ id: doc.id, ...doc.data() });
          });
          setMessages(fetchedMessages.reverse()); // Reverse to show latest at the bottom
          console.log("mshs "+ fetchedMessages)

        });

        return () => unsubscribe();
      }
      
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch tutors based on selected subject
  useEffect(() => {
    const fetchTutorsAndTutees = async () => {
      try {
        const tutorsCollection = collection(db, 'tutors');
        const tuteesCollection = collection(db, 'tutee');
        
        const tutorQuery = query(tutorsCollection, where('subject', '==', selectedSubject));
        const tuteeQuery = query(tuteesCollection, where('subject', '==', selectedSubject));

        const tutorSnapshot = await getDocs(tutorQuery);
        const tuteeSnapshot = await getDocs(tuteeQuery);

        const fetchedTutors = tutorSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const fetchedTutees = tuteeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTutors(fetchedTutors);
        setTutees(fetchedTutees);
      } catch (error) {
        console.error('Error fetching tutors and tutees:', error);
      }
    };

    if (selectedSubject) {
      fetchTutorsAndTutees();
    }
  }, [selectedSubject]);

  // Fetch messages when selectedTutor changes
  useEffect(() => {
    fetchMessages();
  }, [selectedTutor]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    try {
      if (selectedTutor) {
        const messageData = {
          text: newMessage,
          sender: currentUser.name,
          destination: selectedTutor.name,
          timestamp: new Date(),
        };
        await addDoc(collection(db, 'messages'), messageData);
        setNewMessage('');
        fetchMessages(); // Fetch messages again after sending a new one
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle selecting a tutor from the list
  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor);
  };

  return (
    <div style={{ display: 'flex',  justifyContent: 'space-between'}}>
    <div style={{ display: 'flex', flexDirection: 'column', width: '500px', height: '550px',marginLeft: '-600px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold' } }>
        <p>You are {currentUser.name}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between',fontSize:"16px"}}>
        <div style={{ width: '48%' }}>
          <h2>Tutors for {selectedSubject}</h2>
          <ul style={{ listStyleType: 'none', padding: '0' }}>
            {tutors.map((tutor) => (
              <li key={tutor.id} onClick={() => handleTutorSelect(tutor)} style={{ padding: '5px 0', cursor: 'pointer' }}>
                {tutor.name}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ width: '48%' }}>
          <h2>Tutees for {selectedSubject}</h2>
          <ul style={{ listStyleType: 'none', padding: '0' }}>
            {tutees.map((tutee) => (
              <li key={tutee.id} onClick={() => handleTutorSelect(tutee)} style={{ padding: '5px 0', cursor: 'pointer' }}>
                {tutee.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ height: '700px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginTop: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {messages.map((message) => (
            <div key={message.id} style={{ marginBottom: '5px' }}>
              <strong>{message.sender}</strong>: {message.text}
            </div>
          ))}
        </div>
      </div>
      {selectedTutor && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px',height:"200px" }}>
          <textarea
            rows="3"
            placeholder={`Message ${selectedTutor.name}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ resize: 'none', marginBottom: '5px' }}
          />
          <button onClick={handleSendMessage} style={{ alignSelf: 'flex-end', padding: '5px 10px' }}>Send</button>
        </div>
      )}
      </div>
      <div   style={{ marginRight: '-400px'}}
>
      { authToken && meetingId ? (
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: true,
            webcamEnabled: true,
            name: 'C.V. Raman', // Replace with currentUser.name or appropriate name
          }}
          token={authToken}
        >
          <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} />
        </MeetingProvider>
      ) : (
        <JoinScreen getMeetingAndToken={getMeetingAndToken} />
      )}
    </div>
    </div>
    

  );
};

export default ChatBox;
