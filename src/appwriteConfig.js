import { Client, Databases, Account } from 'appwrite';

export const PROJECT_ID = "66c68781003b65a3cf98";
export const DATABASE_ID = "66c693ea0024086f09c1";
export const COLLECTION_ID_MESSAGES = "66c693fc0020a2d7626f";

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('66c68781003b65a3cf98');

export const databases = new Databases(client);
export const account = new Account(client);

export default  client;