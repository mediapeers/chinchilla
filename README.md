
# Chinchilla

## About
Chinchilla is a javascript library that consumes contexts inspired by [JSON-LD](http://json-ld.org/) (but better). By parsing these enriched contexts we make the frontend know about all entities / actions that are supported by the backend.

## Setup

### Dependencies
Chinchilla depends on a bunch of other javascript libraries. Please make sure these dependencies are resolved before you use Chinchilla.
This is the list:

 
* [bluebird](https://github.com/petkaantonov/bluebird)
* [lodash](https://github.com/lodash/lodash)
* [superagent](https://github.com/visionmedia/superagent)
* [js-cookie](https://github.com/js-cookie/js-cookie)
* [uri-templates](https://github.com/geraintluff/uri-templates)

You can also use the `release/dependencies.js` file where all of these dependencies are packaged into.

### Load `chinchilla.js`
I'm not going to explain this.

### Configure endpoints
~~~javascript
  # set chinchilla's entry points
  chch.config.setEndpoint('um', '//path/to/um/backend')
~~~

### Angular configuration
Chinchilla uses [bluebird](https://github.com/petkaantonov/bluebird). In order to trigger binding updates inside of an angular application any time bluebird promises have been resolved you need to configure your app like so:

~~~javascript
trackDigests = (app) ->
  app.run(['$rootScope', ($rootScope) ->
    Promise.setScheduler (cb) -> $rootScope.$evalAsync(cb)
  ])

app = angular.module("your-app")
trackDigests(app)

~~~

## Usage

Chinchilla's main purpose is to make dealing with our backends as easy as possible.
Chinchilla automatically (well, it's defined in the contexts) chooses the proper method type when doing requests (GET/POST/PUT/PATCH/DELETE).

### Authentication

Chinchilla by default automatically sends 'Session-Id' in headers for every (action) request to the backends. This is an example of how to implement a login and tell Chinchilla the session id to be used for subsequent requests.

~~~javascript
  session = $chch.new('um', 'session', { email: 'foo', password: 'bar' })
  chch(session).$m('create', {}, { withoutSession: true }).then (result) ->
    chch.config.setSessionId(result.object.id)
~~~

`withoutSession` tells Chinchilla not to send the session id for this particular request.

This is an example for a logout implementation:

~~~javascript
  chch('um', 'session').$m('delete').then ->
    chch.config.clearSessionId()
~~~

### Example 1: Fetch data

~~~javascript
# assuming 'bestbackend' serves you with an interface to 'users',
# this is a collection action call '$c' and will do a GET request to query the user context, then users:
chch('bestbackend', 'user').$c('query').then (result) ->
  console.log result.objects # the users from GET http://this.is.the.backend.url/users

# once resolved, you can grab the users from (list of users)
op.$arr

# to fetch a single user, do a member action call instead:
chch('bestbackend', 'user').$m('get', id: 2).then (result) ->
  console.log result.object # the user from GET http://this.is.the.backend.url/users/2
~~~

### Example 2: Other requests

like for example deleting an object works the same way:

~~~javascript
chch('bestbackend', 'organization').$m('delete', id: 1)
# -> DELETE http://this.is.the.backend.url/organizations/1
~~~

### Example 3: Use chinchilla for existing objects

Assuming you have an object or an array of objects, where all of them have a proper '@context' attribute you can use chinchilla simply by passing the objects to chch

~~~javascript
user = {
	'@context': 'http://this.is.the.backend.url/context/user',
	'@id': 'http://this.is.the.backend.url/users/1',
	name: 'john doe'
}

chch(user).$m('delete')
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

chch(users).$c('delete')
# -> DELETE http://this.is.the.backend.url/users/1,2
~~~

You can easily fetch association data for a given set of object(s):

~~~javascript
organization = { id: 1, '@context': ... } # previously fetched user
chch(organization).association('users').ready.then (result) ->
  console.log result.objects # users from GET http://this.is.the.backend.url/organizations/1/users
~~~

### Example 4: Initialize new object with proper `@context`:
It's as easy as

~~~javascript
user = chch.new('um', 'user', first_name: 'John', last_name: 'Doe')
# -> {
#   @context: 'http://this.is.the.backend.url/context/user',
#   first_name: 'John',
#   last_name: 'Doe'
# }
~~~

### Contexts

To deal with contexts on your own you can ask for them like this:

~~~javascript
chch.context('um', 'user').then (context) ->
  console.log context # the user model context
~~~

### Lazy loading

Chinchilla does lazy loading automatically to make your life even more relaxed. If you (or) your code tries to access an associated nested object that is not loaded yet, Chinchilla will jump in and request it for you.

~~~javascript
chch('um', 'user').$m('get', id: 1).then (result) ->
  user = result.object
  
  user.organization # triggers loading the association, returns null
  user.organization # returns the organization object when the organization has been fetched
~~~

You can also use a promise:

~~~javascript
chch('um', 'user').$m('get', id: 1).then (result) ->
  user = result.object
  
  user.organizationPromise.then ->
  	user.organization # returns the organization object
~~~