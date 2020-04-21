# node-blog-rest-api
REST API for a blogging app built with Node.js, Express and Sequelize.

## General Info
REST API project which receives requests from a frontend app. The REST API for this app is described below.

1. [ Signup user. ](#signup)
2. [ Log user in. ](#login)
3. [ Get all posts. ](#getposts)
4. [ Create a new post. ](#postpost)
5. [ Get single post. ](#getapost)
6. [ Update a post. ](#updatepost)
7. [ Delete a post. ](#deletepost)


<a name="signup"></a>
**Signup User**
----
  Creates new user in database and returns new userId.

* **URL**

  /auth/signup

* **Method:**

  `PUT`

*  **Request Body**
    ```
    [
      {
          "email": "test@test.com",
          "password": "password",
          "name": "Karen Smith"
      }
    ]
    ```
*  **URL Params**

    None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 201 <br />
    **Content:** `{ message : "User created.", userId : "1" }`
 
* **Error Response:**

  * **Code:** 422 UNPROCESSABLE ENTITY <br />
    **Content:** `{ message : "Signup validation failed. Provide a valid email", data: "test @test.com" }`

  OR

  * **Code:** 500 SERVER ERROR <br />

* **Sample Request:**

  ```
    fetch('http://localhost:8080/auth/signup', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ // req body converting to JSON
        email: signupForm.email.value,
        password: signupForm.password.value,
        name: signupForm.name.value
      })
    })
  ```
  
<a name="login"></a>
**Login User**
----
  Logs a user in if they have an account. Returns JSON Web Token and userId. 

* **URL**

  /auth/login

* **Method:**

  `POST`

*  **Request Body**

    [
      {
          "email": "test@test.com",
          "password": "Karen"
      }
    ]

*  **URL Params**

    None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ token : "jsonwebtokenhere", userId : "1" }`
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ message : "User with this email not found.", data: "test @test.com" }`

  OR
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ message : "Incorrect password.", data: "test @test.com" }`
 
  OR

  * **Code:** 500 SERVER ERROR <br />

* **Sample Request:**

  ```
    fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: authData.email,
        password: authData.password,
      })
    })
  ```

<a name="getposts"></a>
**Get Posts**
 ----
  Retrieves posts from database. 

* **URL**

  /posts

* **Method:**

  `GET`

*  **Headers**

    headers: {
        Authorization:  'Bearer ' + jsonWebToken
    }

*  **URL Params**

    page=[integer]
      * Current page number - since pagination is implemented

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ 
           message: "Fetched posts successfully",
           posts: [
              {title: 'First post', content: 'This is the first post.'}
           ],
           totalItems: "1"
      }`
 
* **Error Response:**

  * **Code:** 500 SERVER ERROR <br />

* **Sample Request:**

  ```
  fetch(`http://localhost:8080/feed/posts?page=1`, {
      headers: {
        Authorization:  'Bearer ' + this.props.token
      }
  })
  ```
 
<a name="postpost"></a>
**Post post**
 ----
  Allows user to create a new post that is saved to the database and retrieved though the Get Posts endpoint. 
  A post consists of a title, an image and the post content.
  
* **URL**

  /post

* **Method:**

  `POST`

*  **Request Body**

    Javascript formData object with key-value pairs. Keys are:
      * 'title'
      * 'content'
      * 'image'

*  **URL Params**

    None

* **Data Params**

    None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ 
          message : "Post created successfully!",
          post : {
            title: 'First post',
            content: 'This is my post.',
            imageUrl: 'imageuploadurl.jpg
          } 
      }`
 
* **Error Response:**

  * **Code:** 422 UNPROCESSABLE ENTITY <br />
    **Content:** `{ message : "No image provided.", data: "" }`

  OR

  * **Code:** 500 SERVER ERROR <br />

* **Sample Request:**

  ```
    createNewPost = postData => {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('image', postData.image);
    let url = 'http://localhost:8080/feed/post';
    let method = 'POST'

    fetch(url, {
      method: method,
      body: formData,
      headers: {
        Authorization:  'Bearer ' + this.props.token
      }
    })
  ```

<a name="getapost"></a>
**Get Single Post**
 ----
  Retrieves a single post from database from the postId. 

* **URL**

  /post/:postId

* **Method:**

  `GET`

*  **Headers**

    headers: {
        Authorization:  'Bearer ' + jsonWebToken
    }

*  **URL Params**

    postId=[integer]
      * id of post that is to be updated.

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ 
           message: "Post updated successfully",
           post: [
              {title: 'First time posting here', post: 'This is a post.'}
           ]
      }`
 
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** `{ message : "Could not find post." }`

* **Sample Request:**

  ```
  fetch('http://localhost:8080/feed/post/' + 3, {
      headers: {
        Authorization:  'Bearer ' + this.props.token
      }
  })
  ```

<a name="updatepost"></a>
**Update a Post**
 ----
  Allows user to update a post that THEY created. 

* **URL**

  /post/:postId

* **Method:**

  `PUT`

*  **Headers**

    headers: {
        Authorization:  'Bearer ' + jsonWebToken
    }

*  **URL Params**

    postId=[integer]
      * id of post that is to be returned.

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ 
           message: "Post updated successfully",
           post : {
            title: 'First post',
            content: 'This is my post after being updated.',
            imageUrl: 'imageuploadurl.jpg
          } 
      }`
 
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** `{ message : "Could not find post." }`
  
  OR

  * **Code:** 403 FORBIDDEN <br />
    **Content:** `{ message : "You can only edit posts that you created." }`
  
  OR
  
  * **Code:** 500 SERVER ERROR <br />


<a name="deletepost"></a>
**Delete a Post**
 ----
  Allows user to delete a post that THEY created.

* **URL**

  /post/:postId

* **Method:**

  `DELETE`

*  **Headers**

    headers: {
        Authorization:  'Bearer ' + jsonWebToken
    }

*  **URL Params**

    postId=[integer]
      * id of post that is to be updated.

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ 
           message: "Post deleted."
      }`
 
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** `{ message : "Could not find post." }`

* **Sample Request:**

  ```
  fetch('http://localhost:8080/feed/post/' + 7, {
      headers: {
        Authorization:  'Bearer ' + this.props.token
      }
  })
  ```
  
