import React, { useEffect, useState } from 'react';
import { getUserMessages } from '../utils/storage_utils';

export const UserMessagesList: React.FC = () => {
  const [userMessages, setUserMessages] = useState<string[]>([]);

  useEffect(() => {
    setUserMessages(getUserMessages());
  }, []);

  return (
    <ul>
      {userMessages.map((message, index) => (
        <li key={index}>{message}</li>
      ))}
    </ul>
  );
};

export const useUserMessages = () => {
  const [userMessages, setUserMessages] = useState<string[]>([]);

  useEffect(() => {
    setUserMessages(getUserMessages());
  }, []);

  return userMessages;
};
