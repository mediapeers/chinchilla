
# Chinchilla

## About
Chinchilla is an angular module that consumes contexts inspired by [JSON-LD](http://json-ld.org/) (but better). By parsing these enriched contexts we make the frontend know about all entities / actions that are supported by the backend.

## Setup

### Load `chinchilla.js`
I'm not going to explain this.

### Configure endpoints
~~~javascript
angular.module("yourproject").config ($chProvider) ->
  # set chinchilla's entry points
  $chProvider.setEndpoint('bestbackend', "http://this.is.the.backend.url")
  $chProvider.setEndpoint('bar', "http://bar.backend")
~~~

## Usage

Chinchilla's interface exposes so called 'operations' you can work with. All operations have an asynchronous nature. But you can chain them and chinchilla takes care of not to execute an operation before the parent one has been resolved.

Chinchilla automatically (well, it's defined in the contexts) chooses the proper method type when doing requests (GET/POST/PUT/PATCH/DELETE).

### Example 1: Fetch data

~~~javascript
# assuming the 'entry_point' of 'bestbackend' serves you with an interface to 'users', 
# this is a collection action call '$c' and will do a GET request to query users:
op = $ch('bestbackend').$('users').$c('query')
# -> GET http://this.is.the.backend.url/users

# once resolved, you can grab the users from (list of users)
op.$arr

# to fetch a single user, do a member action call instead:
op = $ch('bestbackend').$('users').$m('get', id: 2)
# -> GET http://this.is.the.backend.url/users/2

# once resolved, you can grab the user from..
op.$obj
~~~

The same works to fetch association data. The following call executes 5 sequential requests to your backend, and returns you all users of the organization with id 1.

- Fetches context of 'entry_point'
- Fetches context of 'organization'
- Fetches organization with id 1
- Fetches context of 'user'
- Fetches list of users

~~~javascript
$ch('bestbackend').$('organization').$m('get', id: 1).$('users').$c('query')
# -> GET http://this.is.the.backend.url/organizations/1/users
~~~

### Example 2: Other requests

like for example deleting an object works the same way:

~~~javascript
$ch('bestbackend').$('organization').$m('delete', id: 1)
# -> DELETE http://this.is.the.backend.url/organizations/1
~~~

### Example 3: Use chinchilla for existing objects

Assuming you have an object or an array of objects, where all of them have a proper '@context' attribute you can use chinchilla simply by passing the objects to $ch

~~~javascript
user = { 
	'@context': 'http://this.is.the.backend.url/context/user',
	'@id': 'http://this.is.the.backend.url/users/1',
	name: 'john doe' 
}

$ch(user).$m('delete')
# -> DELETE http://this.is.the.backend.url/users/1

users = [
	{ 
		'@context': 'http://this.is.the.backend.url/context/user',
		'@id': 'http://this.is.the.backend.url/users/1',
		name: 'bonny' 
	},
	{ 
		'@context': 'http://this.is.the.backend.url/context/user',
		'@id': 'http://this.is.the.backend.url/users/2',
		name: 'clyde' 
	},
]

$ch(users).$c('delete')
# -> DELETE http://this.is.the.backend.url/users/1,2
~~~

### Promises

Each chinchilla operation provides you with a promise.

~~~javascript
$('bestbackend').$('users').$m('get', id: 2).$promise.then (op) ->
	console.log 'look at our first user:'
	console.log op.$obj
~~~

### Lazy loading

Chinchilla does lazy loading automatically to make your life even more relaxed. If you (or) your code tries to access an associated nested object that is not loaded yet, it will fetch it.

~~~javascript
$('bestbackend').$('users').$m('get', id: 2).$promise.then (op) ->
	op.$obj.organization
	# -> GET http://this.is.the.backend.url/organization/1
	# returns {} empty object first, but the object will be updated with organization data when
	# the request is done.
	
# the manual equivalent way to do this would be:
$('bestbackend').$('users').$m('get', id: 2).$('organization').$m('get')
~~~

Again, as everything is asynchronous, there are promises available you can use to wait for the organization (in this case) to be loaded:

~~~javascript
$('bestbackend').$('users').$m('get', id: 2).$promise.then (op) ->
	op.$obj.organizationPromise.then (organization) ->
		console.log 'this is user 1's organization'
		console.log organization
~~~
