var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
	db.createTable("transactions", {
		user: {type: "string", primaryKey: true},
		questid: {type: "int", primaryKey: true},
		amount: {type: "decimal", notNull: true}
	}, callback);
};

exports.down = function(db, callback) {
	db.dropTable("transactions", callback);
};
