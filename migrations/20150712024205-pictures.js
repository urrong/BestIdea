var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
	db.createTable("pictures", {
		id: {type: "int", primaryKey: true},
		questid: {type: "int", primaryKey: true},
		picture: {type: "text", notNull: true}
	}, callback);
};

exports.down = function(db, callback) {
	db.dropTable("pictures", callback);
};
