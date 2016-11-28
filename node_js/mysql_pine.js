//-------------------------------------
// /node_js/mysql_pine.js
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
console.log(query);
		mysqlConnection.query(query, valueArr, function (err, rows, fields) {
			if (err) throw err;

			callback();
		});
	}

	this.updateValues = function (tableName, columnArr, valueArr, conditionStr, callback) {
		var setArr = [];
		var setStr = '';
		var query = 'UPDATE ' + tableName + ' SET ';
		for (var i = 0; i < columnArr.length; i++) {
			setArr.push(columnArr[i] +'=?')
		}
		setStr = setArr.join(',');
		query += setStr +' WHERE '+ conditionStr
		mysqlConnection.query(query, valueArr, function (err, rows, fields) {
			if (err) throw err;

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