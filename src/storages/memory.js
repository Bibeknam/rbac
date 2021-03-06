import Storage from './index';
import Permission from '../permission';
import Role from '../role';

export default class Memory extends Storage {
	constructor () {
		this._items = {};
		super();
	}

	add (item, cb) {
		var name = item.name;
		if(this._items[name]) {
			return cb(null, this._items[name].item);
		}

		this._items[name] = {
			instance: item,
			grants: []
		};

		cb(null, item);
		return this;
	}

	remove (item, cb) {
		var name = item.name;
		if(!this._items[name]) {
			return cb(new Error('Item is not presented in storage'));
		}

		//revoke from all instances
		for(var index in this._items) {
			if (!this._items.hasOwnProperty(index)) {
				continue;
			}

			var grants = this._items[index].grants;

			for(var i=0; i<grants.length; i++) {
				if(grants[i] === name) {
					grants.splice(i, 1);
					break;
				}
			}
		}
		
		//delete from items
		delete this._items[name];
		
		cb(null, true);
		return this;
	}

	grant (role, child, cb) {
		var name = role.name;
		var childName = child.name;

		if(!this._items[name] || !this._items[childName]) {
			return cb(new Error('Role is not exist'));
		}

		if(!role instanceof Role) {
			return cb(new Error('Role is not instance of Role'));	
		}	

		if(name === childName) {
			return cb(new Error('You can grant yourself'));	
		}

		var grants = this._items[name].grants;
		for(var i=0; i<grants.length; i++) {
			var grant = grants[i];
			if(grant === childName) {
				return cb(null, true);
			}
		}

		grants.push(childName);
		cb(null, true);
		return this;
	}

	revoke (role, child, cb) {
		var name = role.name;
		var childName = child.name;

		if(!this._items[name] || !this._items[childName]) {
			return cb(new Error('Role is not exist'));
		}

		var grants = this._items[name].grants;
		for(var i=0; i<grants.length; i++) {
			var grant = grants[i];
			if(grant === childName) {
				grants.splice(i, 1);
				return cb(null, true);
			}
		}

		cb(new Error('Item is not associated to this item'));
		return this;
	}

	get (name, cb) {
		if(!name || !this._items[name]) {
			return cb(null, null);
		}

		cb(null, this._items[name].instance);
		return this;
	}

	getRoles (cb) {
		var items = [];

		for(var name in this._items) {
			if (!this._items.hasOwnProperty(name)) {
				continue;
			}
			
			var item = this._items[name].instance;

			if(item instanceof Role) {
				items.push(item);
			}
		}

		cb(null, items);
		return this;
	}

	getPermissions (cb) {
		var items = [];

		for(var name in this._items) {
			if (!this._items.hasOwnProperty(name)) {
				continue;
			}

			var item = this._items[name].instance;

			if(item instanceof Permission) {
				items.push(item);
			}
		}

		cb(null, items);
		return this;
	}

	getGrants (role, cb) {
		if(!role || !this._items[role]) {
			return cb(null, null);
		}

		var roleGrants = this._items[role].grants;

		var grants = [];
		for(var i=0; i<roleGrants.length; i++) {
			var grantName = roleGrants[i];
			var grant = this._items[grantName];

			if(!grant) {
				continue;
			}

			grants.push(grant.instance);
		}

		cb(null, grants);
		return this;
	}
}