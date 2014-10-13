
# Chinchilla / Chinchillidae


## Requirements

* JSON-LD support
* Lazy-JSON support
* AngularJS support
* Sexy, functional style
* Clean, thin objects
* Support for single/multi actions

## Thin extended objects

### Object
~~~javascript
obj = {
   __type__: 'user',                       // object type, ancillary field
   __id__: 'http://example.com.v1/user/1', // object endpoint, @id
   __lazy__: {...}                         // linked/lazy data props
   id: 1,                                  // object native field  #1
   name: 'Janis'                           // object native field #2
   address:  getter/setter                 // lazy association
}
~~~

### Collection (Array)
~~~javascript
arr = [obj, obj, obj, ...]
arr = {
	__cid__: 2321325,                       //collection identifier, used for bulk loader
	__id__: 'http://example.com.v1/users',  // collection endpoint, optional,
	0: obj1,
	1: obj2,
	2: obj3,
	...
}
~~~

## Interface

#### One top function
~~~javascript
$ch(definition).doSomething()	
~~~

#### Defunition API

~~~javascript
user = $ch('user')
user = $ch({__type__: 'user'})
user = $ch(obj)
user = $ch('http://example.com.v1/user/1')

user = $ch([obj, obj, ...])
user = $ch(['http://example.com.v1/user/1', 'http://example.com.v1/user/2', ...])
~~~


#### Interaction API

##### Built in prop-actions:
~~~javascript
user = $ch('user').$new.$obj        // cooks new (blank) object, based on context
user = $ch('user').$dup.$obj        // creates a EXACT copy of object
context = $ch('user').$context.$obj // gets the context of user
~~~

##### API actions, comes from backend:
~~~javascript
user = $ch('user').get({id: 1}).$obj
user = $ch(obj).create().$obj
user = $ch(obj).update().$obj	
users = $ch('user').query().$obj	
~~~

#### Return values
~~~javascript
$ch(obj).doSomething()      // returns _proxy_ object 
$ch(obj).doSomething().$obj // returns empty object, which will be resolved to full object on success
$ch(obj).doSomething().$arr // returns empty array, which will be filled with objects on success
~~~

*_proxy_* object:
~~~javascript
proxy = {
  then: function(success, error) {...},
  $obj: {},
  $arr: []
}
~~~

### Mutators (Interceptors)

Mutators has index, index defines execution order from lo to hi number. addInDataMutator method by default adds mutators to the end.

~~~javascript
$ch().listMutators() // returns list of mutators, ex.:
[
	[10, 'in', 'description', function(){...} ],
	[20, 'out', 'description', function(){...} ],
	[1, 'in', 'description', function(){...} ],
	[10, 'out', 'description', function(){...} ],
] 
~~~

#### "in" mutators
* Error mutator/handler, index: 1
* Mutate HTTP response body to flat object, index: 10
* Mutate flat object to lazy object, index:  20
* Mutate HTTP response body to tree object,  index:  10
* User defined mutator, variable index

~~~javascript
$ch().addInMutator( function(data, params) { return [data, params] }, { index: 100, description: 'foo' } ); // add mutator for every object
$ch('user').addInMutator(function(data, params) { return [data, params] }); // add mutator exactly for user
~~~
_second argument is optional_

#### "out" mutators
* Authentication mutator, index: 1
* Mutate flat object to JSON representation, index: 10
* Mutate JSON	 to rails format (remap associations if present to *_attributes), index: 20
* User defined mutator, variable index

~~~javascript
$ch().addOutMutator(function(data) { return fn(data); }, { index: 100, description: 'foo' }); // add mutator for every object
$ch('user').addOutMutator(function(data) { return fn(data);  } ); // add mutator exactly for user
~~~
_second argument is optional_

### Errors handling

By default, all errors are catched by error mutator.
Final [$arr, $obj] does note resolve then. 
Final promise resolves to error.

DISCUSSABLE: error substitution with object (by additional interceptor)
  
### Laziness

By default, all associations are lazy. 
Laziness mutator fills object with lazy getters/setters and associates those with proper bulk loaders.

Lazines example:
~~~javascript
users = $('user').query().$arr
// when users are resolved
user1 = users[0]
user2 = users[1]
// ask for asscociation
user1.address // resolves to nil
// after a while
user1.address // resolves to address object {__type__: ...}
user2.address // resolves to address object {__type__: ...}, thanks to bulk resolver
~~~

Laziness event handling:
~~~javascript
user1.address // attribute
$ch(user1).$on('address').then ... // {success, error} promise, resolves on association resolve
~~~


### Single / multi actions

There is no difference between multi and single actions. If there are API calls with same name, it uses proper method according to input params. ex:

~~~javascript
$(obj).delete()             // calls member action
$([obj, obj, obj]).delete() // calls multi action
~~~

### Calculatable object attributes (NICE TO HAVE)

Object may be extended with calculatable attributes using mixins:

~~~javascript
// define mixin
mix1 = {
  get__fullName: function() {
  	return this.first_name + ' ' + this.last_name;
  }	
  
  set__fullName: function(name) {
    // parses, assigns tokens to real attributes
  }	
}

// attach to any user
$ch('user').$mix(mix1)

// attach to matching product
$ch(/^product\//).$mix(mix)

// then, it is possible to call:
user = $ch('user').get({id: 1}).$obj
user.fullName # returns John Smith  // calculatable getter
user.fullName = 'John Doe'          // calculatable setter
~~~




