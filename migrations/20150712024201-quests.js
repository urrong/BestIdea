var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
	db.createTable("quests", {
		id: {type: "int", unsigned: true, primaryKey: true, autoIncrement: true},
		name: {type: "string", notNull: true},
		dateAdded: {type: "date", notNull: true},
		stage: {type: "string", notNull: true},
		lowestBidder: "string",
		lowestBid: "decimal",
		description: "text",
		latitude: {type: "real", notNull:true},
		longtitude: {type: "real", notNull:true},
	}, callback);
};

exports.down = function(db, callback) {
	db.dropTable("quests", callback);
};
