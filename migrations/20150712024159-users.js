var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
	db.createTable("users", {
		email: {type: "string", primaryKey: true},
		name: "string"
	}, callback);
};

exports.down = function(db, callback) {
	db.dropTable("users", callback);
};
