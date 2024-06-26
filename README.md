# kryptapay-js-client

## This package allows to abstract https requests and manage sessions in a React Native Expo application. It is not yet supposed to be used for every backend api structure. Feel free to contact [us](https://www.krypta-pay.com) if you want to contribute in making this package generic for any backend.

### Installing

```
npm i kryptapay-js-client
```

### Usage

-   Init client

```
import { createClient } from 'kryptapay-js-client';

const kryptapayClient = createClient(API_URL, KEY, SECRET);
```

-   Signup

To create a user:

```
const { data, error } = await kryptapayClient.auth.signUp(data);
    if (error) throw error;
    return data.user;
```

It will insert a user into database.

-   Signin

To login:

```
const { data, error } = await kryptapayClient.auth.signInWithPassword(data);
    if (error) throw error;
    return data.user;
```

It will start a user session.

-   Get a item

To call a protected endpoint

```
const options = {
        method: 'GET',
    };
    const { data, error } = await kryptapayClient.rpc.invoke(
        '/item/:id',
        options
    );
    if (error) throw error;
    return data.msg;
```

It will get item with the id {:id} using the existing session.

-   Signout

To end the current session:

```
const { data, error } = await kryptapayClient.auth.signOut(data);
    if (error) throw error;
    return data.msg;
```

### Usage API specifications

Auth controller is at the path /auth and each services [services] in his /[service] path
