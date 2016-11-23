//-------------------------------------
// /node_js/mysql_pine.js 					폐기예정
//-------------------------------------

function Mysql_pine (mysqlConnection) {

	var mysqlConnection = mysqlConnection;

	this.insertValues = function (tableName, columnArr, valueArr, callback) {
		var questionMarkArrStr = '(';
		var query = 'INSERT INTO ' + tableName + ' (';
		for (var i = 0; i < columnArr.length; i++) {
			if (i < columnArr.length-1) {
				questionMarkArrStr += '?,';
				query += columnArr[i] + ',';
			} else {
				questionMarkArrStr += '?)';
				query += columnArr[i] + ') VALUES ' + questionMarkArrStr;
			}
		}

		mysqlConnection.query(query, valueArr, function (err, rows, fields) {
			if (err) {
				res.send('Serverside Error has been occured!')
			}

			callback();
		});
	}
/*
	this.selectFromWhere = function (columnArr, tableName, whereConditionArr, callback) {
		var query = 'SELECT ';
		for (var i = 0; i < columnArr.length; i++) {
			if (i == columnArr.length-1) {
				query += columnArr[i] + ' FROM ' + tableName;
			} else {
				query += columnArr[i] + ', ';
			}
		}
		if (whereConditionArr.length) {
			query += ' WHERE ';
			for (var i = 0; i < whereConditionArr.length; i++) {
				if (i == whereConditionArr.length-1) {
					columnQuery += whereConditionArr[i] + ' ';
					query += columnQuery + 'FROM ' + tableName;
				} else {
					query += whereConditionArr[i] + ' AND ';
				}
			}
		}
		
		callback();
	}
	*/
}

module.exports = Mysql_pine;