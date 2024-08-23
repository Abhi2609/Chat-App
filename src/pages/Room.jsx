import React, { useState, useEffect } from 'react'
import client, { databases, DATABASE_ID, COLLECTION_ID_MESSAGES } from '../appwriteConfig'
import { ID, Query, Role, Permission } from 'appwrite';
import { Trash2 } from 'react-feather';
import Header from '../components/Header';
import { useAuth } from '../utils/AuthContext';

const Room = () => {

    const [messages, setMessages] = useState([]);
    const [messageBody, setMessageBody] = useState('');
    const {user} = useAuth();

    useEffect(() => {
        getMessages()

        const unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`, response => {
            
            if(response.events.includes("databases.*.collections.*.documents.*.create")){
                console.log("A message was created");
                setMessages(prevState => [response.payload, ...prevState])
            }

            if(response.events.includes("databases.*.collections.*.documents.*.delete")){
                setMessages(prevState => prevState.filter(message => response.payload.$id !== message.$id))
                console.log("A message was deleted");
            }
        })

        return () => {
            unsubscribe()
        }
    }, [])

    const getMessages = async () => {
        const response = await databases.listDocuments(
            DATABASE_ID, 
            COLLECTION_ID_MESSAGES,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(10)
            ]
        )
        console.log('Response: ', response)
        setMessages(response.documents)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const permissions = [
            Permission.write(Role.user(user.$id))
        ]

        const payload = {
            user_id: user.$id,
            username: user.name,
            body: messageBody
        }

        const response = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID_MESSAGES,
            ID.unique(),
            payload,
            permissions
        )
        
        setMessageBody('')
    }

    const deleteMessage = async (message_id) => {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, message_id) 
    }

    return (
        <main className='container'>
            
            <Header />
            <div className='room--container'>
                
                <form id='message--form' onSubmit={handleSubmit}>         
                    <div>
                        <textarea 
                            required
                            maxLength="1000"
                            placeholder='Type Message..'
                            onChange={(e) => {setMessageBody(e.target.value)}}   
                            value={messageBody}
                        ></textarea>
                    </div>
                    <div className='send-btn--wrapper'>
                        <input className='btn btn--secondary' type="submit" value="Send" />
                    </div>
                </form>
                
                <div>
                    {messages.map(message => (
                        <div key={message.$id} className='message--wrapper'>
                            <div className='message--header'>
                                
                                <p>
                                    {message?.username ? (
                                        <span>{message?.username}</span>
                                    ) : (
                                        'Anonymous User'
                                    )}
    
                                    <small className='message-timestamp'>{new Date(message.$createdAt).toLocaleString()}</small>
                                </p>

                                {message.$permissions.includes(`delete(\"user:${user.$id}\")`) && (
                                    <Trash2 
                                        className='delete--btn'    
                                        onClick={() => {deleteMessage(message.$id)}} 
                                    />
                                )}
                            </div>

                            <div className={`message--body +  ${message.user_id === user.$id ? 'message--body--owner' : 'message--body--others'}`}>
                                <span>{message.body}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}

export default Room
